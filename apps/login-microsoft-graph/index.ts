import express, { Request, Response } from 'express'
import { ConfidentialClientApplication, ResponseMode } from '@azure/msal-node'
import { Client } from '@microsoft/microsoft-graph-client'
import { ResponseType } from '@microsoft/microsoft-graph-client/src/ResponseType'
import * as dotenv from 'dotenv'
import { dbConnection } from './db-connection'

dotenv.config({ path: './.env' })
const app = express()
const port = 4001

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
    responseMode: ResponseMode.FORM_POST,
    scopes: []
  }
  const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(authCodeUrlRequest)

  res.redirect(authCodeUrlResponse)
})

app.post('/auth/redirect', async (req: Request, res: Response) => {
  const msalInstance = new ConfidentialClientApplication(config.msalConfig)

  const authCodeRequest = {
    redirectUri: config.redirectUri,
    scopes: ['User.Read'],
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
    scopes: ['User.Read'],
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
    scopes: ['User.Read'],
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
