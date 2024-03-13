import express from 'express'
import { google } from 'googleapis'
import bcrypt from 'bcryptjs'
import knex from 'knex'

const app = express()
const port = 3000
const REDIRECT_URL = 'http://localhost:3000/login/callback'

const connection = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/login/callback', async (req, res) => {
  const { state, code } = req.query
  if (!state || !bcrypt.compare(state, process.env.AUTH_SECRET)) throw new Error('error')
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URL
    }),
    headers: { 'Content-Type': 'Application/json' }
  })
  const json = await response.json()
  res.json(json)
})

app.get('/login', (req, res) => {
  const state = bcrypt.hash(process.env.AUTH_SECRET, 10)
  const queryParams = new URLSearchParams({
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
    include_granted_scopes: true,
    response_type: 'code',
    access_type: 'offline',
    state,
    redirect_uri: REDIRECT_URL,
    client_id: process.env.GOOGLE_CLIENT_ID
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`)
})

app.get('/sdk/login', async (req, res) => {
  const state = bcrypt.hash(process.env.AUTH_SECRET, 10)
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/sdk/login/callback'
  )
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile'],
    include_granted_scopes: true,
    state
  })
  res.redirect(authorizationUrl)
})

app.get('/sdk/login/callback', async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/sdk/login/callback'
  )
  const getTokenResponse = await oauth2Client.getToken(req.query.code)
  const { tokens } = getTokenResponse
  const { access_token, refresh_token, expiry_date } = tokens

  oauth2Client.setCredentials(tokens)
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  })
  const { data } = await oauth2.userinfo.get()
  const { email } = data

  const user = await connection('user').where('email', '=', email).first()
  if (user) {
    await connection('user')
      .update({
        token: access_token,
        refreshToken: refresh_token,
        expiredDate: new Date(expiry_date)
      })
      .where('id', '=', user.id)
    return res.json({ tokens, email })
  }

  await connection('user').insert({
    email,
    token: access_token,
    refreshToken: refresh_token,
    expiredDate: new Date(expiry_date)
  })

  res.json({ tokens, email })
})

app.get('/me/:email', async (req, res) => {
  const { email } = req.params
  const user = await connection('user').where('email', '=', email).first()
  if (!user) {
    return res.send('MAL', 401)
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/sdk/login/callback'
  )

  oauth2Client.on('tokens', (tokens) => {
    console.log(tokens)
    if (tokens.refresh_token) {
      // store the refresh_token in your secure persistent database
      console.log('tokens.refresh_token')
      console.log(tokens.refresh_token)
    }
    console.log('tokens.access_token')
    console.log(tokens.access_token)
  })

  oauth2Client.setCredentials({
    access_token: user.token,
    refresh_token: user.refreshToken
  })

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  })

  const { data } = await oauth2.userinfo.get()
  res.json(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
