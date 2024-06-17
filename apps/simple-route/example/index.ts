import simpleRoute from '../src'

const port = 4221 || process.env.PORT

const app = simpleRoute()

app.add('GET', '/', ({ request }): Response => {
  return new Response(
    JSON.stringify({
      request,
      headers: [...request.headers],
      body: request.body,
      status: 'ok!!!'
    }),
    {
      status: 200
    }
  )
})

app.add('GET', '/home', (): Response => {
  return Response.json({ status: 'ok' })
})

app.add('GET', '/user/:id', (): Response => {
  return Response.json({ status: 'ok' })
})

app.run(port, () => {
  console.log(`🫶 Server is running on http://localhost:${port}`)
})
