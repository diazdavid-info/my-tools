import type { APIRoute } from 'astro'
import { getBote } from '@/server/store'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const id = params.id
  if (!id) {
    return new Response(JSON.stringify({ error: 'Falta el id' }), {
      status: 400
    })
  }
  const bote = await getBote(id)
  if (!bote) {
    return new Response(JSON.stringify({ error: 'Bote no encontrado' }), {
      status: 404
    })
  }
  return new Response(JSON.stringify(bote), {
    headers: { 'Content-Type': 'application/json' }
  })
}
