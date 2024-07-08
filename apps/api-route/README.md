# Simple Route
**Rápido, fácil de usar, construido en TS y sin opiniones**

**Crea tu api en en nodejs con lo mínimo que necesitas**

## Índice
* [Instalación](#instalación)
* [Uso](#uso)

## Instalación
```bash
npm install api-route
```

## Uso
```typescript
import { apiRouter } from 'api-route'

const app = apiRouter()

app.add('GET', '/', (): Response => {
  return new Response('Hello World')
})

app.add('GET', '/user/:id', ({ params }): Response => {
  const { id } = params
  return Response.json({ status: 'ok', id })
})

app.add('POST', '/user', async ({ request }): Promise<Response> => {
  const json = await request.json()
  return Response.json({ status: 'ok', body: json })
})

app.run(4221, () => {
  console.log(`🫶 Server is running on http://localhost:4221`)
})
```
