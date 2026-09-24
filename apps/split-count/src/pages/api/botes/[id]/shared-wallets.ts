import type { APIRoute } from 'astro'
import { addSharedWallet, getBote } from '@/server/store'

export const prerender = false

export const POST: APIRoute = async ({ params, request }) => {
  const bote = params.id ? await getBote(params.id) : null
  if (!bote)
    return new Response(JSON.stringify({ error: 'Bote no encontrado' }), {
      status: 404
    })

  let body: { memberIds?: string[] }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400
    })
  }

  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    (body.memberIds !== undefined &&
      (!Array.isArray(body.memberIds) ||
        body.memberIds.some((id) => typeof id !== 'string')))
  ) {
    return new Response(JSON.stringify({ error: 'Miembros no válidos' }), {
      status: 400
    })
  }

  const memberIds = body.memberIds ?? []
  const people = new Set(bote.participants.map((person) => person.id))
  const occupied = new Set(
    bote.sharedWallets.flatMap((wallet) => wallet.memberIds)
  )
  if (
    memberIds.length < 2 ||
    new Set(memberIds).size !== memberIds.length ||
    memberIds.some((id) => !people.has(id) || occupied.has(id))
  ) {
    return new Response(
      JSON.stringify({
        error:
          'Elige al menos dos personas que no tengan otro monedero compartido'
      }),
      { status: 400 }
    )
  }
  const wallet = await addSharedWallet(bote.id, {
    id: crypto.randomUUID(),
    memberIds,
    lockedRecipientId: null
  })
  return new Response(JSON.stringify(wallet), { status: 201 })
}
