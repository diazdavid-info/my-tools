import { Client } from '@microsoft/microsoft-graph-client'

const getClientByToken = (token: string): Client => {
  const graphOptions = { authProvider: async (done: any) => done(null, token) }
  return Client.init(graphOptions)
}

const token = ''
const calendarId = ''
const eventId = ''

const graphClient = getClientByToken(token)
const event = await graphClient.api(`/me/calendars/${calendarId}/events/${eventId}`).get()

console.log(event)
