import express from 'express'
import { google } from 'googleapis'

const app = express()
const port = 3000
const REDIRECT_URL = 'http://localhost:3000/login/callback'

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/login/callback', async (req, res) => {
  const { state, code, hd } = req.query
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
  const queryParams = new URLSearchParams({
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
    include_granted_scopes: true,
    response_type: 'code',
    access_type: 'offline',
    state: 'state_parameter_passthrough_value',
    redirect_uri: REDIRECT_URL,
    client_id: process.env.GOOGLE_CLIENT_ID
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`)
})

app.get('/sdk/login', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/sdk/login/callback'
  )
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile'],
    include_granted_scopes: true
  })
  res.redirect(authorizationUrl)
})

app.get('/sdk/login/callback', async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/sdk/login/callback'
  )
  const { tokens } = await oauth2Client.getToken(req.query.code)

  res.json(tokens)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
