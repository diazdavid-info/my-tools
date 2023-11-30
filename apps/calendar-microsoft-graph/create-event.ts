import { Client } from '@microsoft/microsoft-graph-client'
import { Event as EventMicrosoft } from '@microsoft/microsoft-graph-types'

interface Event {
  id?: string
  summary: string
  location: string
  description: string
  from: Date
  to: Date
  owner: { name: string; email: string }
  attendees: Array<{ name: string; email: string }> | []
}

const getClientByToken = (token: string): Client => {
  const graphOptions = { authProvider: async (done: any) => done(null, token) }
  return Client.init(graphOptions)
}

const buildEvent = (event: Event): EventMicrosoft => {
  const { summary, description, from, to, location, attendees, owner } = event
  return {
    categories: ['category'],
    subject: summary,
    body: {
      contentType: 'html',
      content: description
    },
    start: {
      dateTime: from.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: to.toISOString(),
      timeZone: 'UTC'
    },
    location: {
      displayName: location
    },
    attendees: [
      ...attendees.map(({ name, email }) => ({ emailAddress: { address: email, name } })),
      { emailAddress: { address: owner.email, name: owner.name } }
    ],
    organizer: {
      emailAddress: {
        address: owner.email,
        name: owner.name
      }
    }
  }
}

const token = ''
const calendarId = ''

const graphClient = getClientByToken(token)
const content = buildEvent({
  summary: '2 Meeting Test Integration',
  description: '',
  from: new Date('2023-12-02T12:30:00Z'),
  to: new Date('2023-12-02T13:00:00Z'),
  location: '',
  attendees: [{ name: 'san', email: 'foo@example.com' }],
  owner: { name: 'Super', email: 'baz@example.com' }
})
const { id }: { id?: string } = await graphClient.api(`/me/calendars/${calendarId}/events`).post(content)

if (!id) throw new Error('Event creation has not return an id')

console.log({ id })
