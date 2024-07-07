import { apiRouter } from '../index'

const port = '4221' || process.env.PORT

const app = apiRouter()

app.add('GET', '/', ({ request }): Response => {
  const headers: Record<string, string>[] = []
  request.headers.forEach((value, key) => {
    headers.push({ [key]: value })
  })
  return new Response(
    JSON.stringify({
      request,
      headers,
      body: request.body,
      status: 'ok!!!'
    }),
    {
      status: 200
    }
  )
})

app.add('GET', '/text', (): Response => {
  return new Response('Hello World')
})

app.add('GET', '/test/:randomString', ({ params }): Response => {
  const { randomString } = params
  return new Response(randomString)
})

app.add('GET', '/home', (): Response => {
  return Response.json({ status: 'ok' })
})

app.add('GET', '/user/:id', ({ params }): Response => {
  return Response.json({ status: 'ok', params })
})

app.add('POST', '/user', async ({ request }): Promise<Response> => {
  const json = await request.json()
  return Response.json({ status: 'ok', body: json })
})

app.run(parseInt(port), () => {
  console.log(`🫶 Server is running on http://localhost:${port}`)
})
