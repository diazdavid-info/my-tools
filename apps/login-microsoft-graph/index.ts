import express, { Request, Response } from 'express'
import { ConfidentialClientApplication, ResponseMode } from '@azure/msal-node'
import { Client } from '@microsoft/microsoft-graph-client'
import { ResponseType } from '@microsoft/microsoft-graph-client/src/ResponseType'
import * as dotenv from 'dotenv'
import { dbConnection } from './db-connection'

dotenv.config({ path: './.env' })
const app = express()
const port = 4001

const SCOPES = ['User.Read', 'Calendars.Read', 'Calendars.ReadWrite']

const config = {
  msalConfig: {
    auth: {
      clientId: process.env.CLIENT_ID ?? '',
      authority: 'https://login.microsoftonline.com/common',
      clientSecret: process.env.CLIENT_SECRET ?? '',
      clientCapabilities: ['CP1']
    }
  },
  redirectUri: 'http://localhost:4001/auth/redirect',
  postLogoutRedirectUri: 'http://localhost:4001'
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req: Request, res: Response) => {
  res.json({ code: 200, message: 'Hello World! 🐷' })
})

app.get('/login', async (req: Request, res: Response) => {
  const msalInstance = new ConfidentialClientApplication(config.msalConfig)

  const authCodeUrlRequest = {
    redirectUri: config.redirectUri,
    responseMode: ResponseMode.QUERY,
    scopes: SCOPES
  }
  const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(authCodeUrlRequest)

  res.redirect(authCodeUrlResponse)
})

app.get('/logout', async (req: Request, res: Response) => {
  const logoutUri = `${config.msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${config.postLogoutRedirectUri}`

  res.redirect(logoutUri)
})

app.post('/auth/redirect', async (req: Request, res: Response) => {
  const msalInstance = new ConfidentialClientApplication(config.msalConfig)

  const authCodeRequest = {
    redirectUri: config.redirectUri,
    scopes: SCOPES,
    code: req.body.code as string
  }

  const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest, req.body)

  await dbConnection('accounts').insert({
    accountId: tokenResponse.account?.homeAccountId,
    account: JSON.stringify(tokenResponse.account),
    token: tokenResponse.accessToken,
    cacheToken: msalInstance.getTokenCache().serialize(),
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return res.json({ token: tokenResponse, tokenCache: msalInstance.getTokenCache().serialize() })
})

app.get('/auth/redirect', async (req: Request, res: Response) => {
  const msalInstance = new ConfidentialClientApplication(config.msalConfig)

  const authCodeRequest = {
    redirectUri: config.redirectUri,
    scopes: SCOPES,
    code: req.query.code as string
  }

  const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest)

  if (tokenResponse.account?.homeAccountId === undefined)
    return res.status(401).json({ status: 401, error: 'Fallo al optener la cuenta' })

  const [account] = await dbConnection('accounts')
    .select('*')
    .where('accountId', '=', tokenResponse.account.homeAccountId)

  if (account) {
    await dbConnection('accounts')
      .update({
        accountId: tokenResponse.account.homeAccountId,
        account: JSON.stringify(tokenResponse.account),
        token: tokenResponse.accessToken,
        cacheToken: msalInstance.getTokenCache().serialize(),
        updatedAt: new Date()
      })
      .where('id', '=', account.id)
  } else {
    await dbConnection('accounts').insert({
      accountId: tokenResponse.account.homeAccountId,
      account: JSON.stringify(tokenResponse.account),
      token: tokenResponse.accessToken,
      cacheToken: msalInstance.getTokenCache().serialize(),
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  return res.json({ token: tokenResponse, tokenCache: msalInstance.getTokenCache().serialize() })
})

app.get('/me/:accountId', async (req: Request, res: Response) => {
  const { accountId } = req.params
  const { id, cacheToken, account } = await dbConnection('accounts')
    .select('*')
    .where('accountId', '=', accountId)
    .first()

  const msalInstance = new ConfidentialClientApplication(config.msalConfig)

  msalInstance.getTokenCache().deserialize(cacheToken)

  const tokenResponse = await msalInstance.acquireTokenSilent({
    account: JSON.parse(account),
    scopes: SCOPES,
    claims: undefined
  })

  await dbConnection('accounts')
    .update({
      accountId: tokenResponse.account?.homeAccountId,
      account: JSON.stringify(tokenResponse.account),
      token: tokenResponse.accessToken,
      cacheToken: msalInstance.getTokenCache().serialize(),
      updatedAt: new Date()
    })
    .where('id', '=', id)

  const client = Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.accessToken)
    }
  })

  const graphResponse = await client
    .api('/me')
    .responseType('raw' as ResponseType)
    .get()

  const me = await graphResponse.json()

  res.status(200).json({ me })
})

app.get('/me/:accountId/calendars', async (req: Request, res: Response) => {
  const { accountId } = req.params
  const { cacheToken, account } = await dbConnection('accounts').select('*').where('accountId', '=', accountId).first()

  const msalInstance = new ConfidentialClientApplication(config.msalConfig)

  msalInstance.getTokenCache().deserialize(cacheToken)

  const tokenResponse = await msalInstance.acquireTokenSilent({
    account,
    scopes: SCOPES,
    claims: undefined
  })

  const client = Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.accessToken)
    }
  })

  const graphResponse = await client
    .api('/me/calendars')
    .responseType('raw' as ResponseType)
    .get()

  const me = await graphResponse.json()
  res.status(200).json({ me })
})

app.post('/me/:accountId/subscriptions', async (req: Request, res: Response) => {
  const { accountId } = req.params
  const { cacheToken, account } = await dbConnection('accounts').select('*').where('accountId', '=', accountId).first()

  const msalInstance = new ConfidentialClientApplication(config.msalConfig)

  msalInstance.getTokenCache().deserialize(cacheToken)

  const tokenResponse = await msalInstance.acquireTokenSilent({
    account,
    scopes: SCOPES,
    claims: undefined
  })

  const client = Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.accessToken)
    }
  })

  const subscription = {
    changeType: 'created,updated,deleted',
    notificationUrl: 'https://01b0-85-55-15-25.ngrok-free.app/api/send/myNotifyClient',
    resource: 'me/events',
    expirationDateTime: '2023-09-14T18:23:45.9356913Z',
    clientState: 'secretClientValue',
    latestSupportedTlsVersion: 'v1_2'
  }

  const subscriptionResponse = await client.api('/subscriptions').post(subscription)

  return res.status(200).json({ subscriptionResponse })
})

app.post('/api/send/myNotifyClient', async (req: Request, res: Response) => {
  const { validationToken } = req.query

  if (validationToken) return res.status(200).send(validationToken)

  console.log(JSON.stringify(req.body))

  const { clientState } = req.body

  return res.status(200).send(clientState)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
