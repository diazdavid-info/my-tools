import type { APIRoute } from 'astro'
import { addParticipant, getBote } from '@/server/store'
import { avatarColor } from '@/lib/split'

export const prerender = false

export const POST: APIRoute = async ({ params, request }) => {
  const bote = params.id ? await getBote(params.id) : null
  if (!bote)
    return new Response(JSON.stringify({ error: 'Bote no encontrado' }), {
      status: 404
    })

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400
    })
  }
  const name = body.name?.trim()
  if (!name)
    return new Response(JSON.stringify({ error: 'Escribe un nombre' }), {
      status: 400
    })
  if (
    bote.participants.some(
      (person) => person.name.toLocaleLowerCase() === name.toLocaleLowerCase()
    )
  ) {
    return new Response(
      JSON.stringify({ error: 'Ese nombre ya está en el bote' }),
      { status: 400 }
    )
  }

  const id = crypto.randomUUID()
  const participant = await addParticipant(bote.id, {
    id,
    name,
    color: avatarColor(id)
  })
  return new Response(JSON.stringify(participant), { status: 201 })
}
