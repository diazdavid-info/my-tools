import type { APIRoute } from 'astro'
import { createBote } from '@/server/store'
import { avatarColor } from '@/lib/split'
import type { Participant, SharedWallet } from '@/lib/types'

export const prerender = false

interface CreateBody {
  name?: string
  participants?: { clientId: string; name: string }[]
  sharedWallets?: { memberIds: string[] }[]
}

export const POST: APIRoute = async ({ request }) => {
  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400
    })
  }

  const name = body.name?.trim()
  if (!name) {
    return new Response(
      JSON.stringify({ error: 'El bote necesita un nombre' }),
      { status: 400 }
    )
  }

  const rawParticipants = (body.participants ?? [])
    .map((p) => p.name.trim())
    .filter(Boolean)
  if (rawParticipants.length < 2) {
    return new Response(
      JSON.stringify({ error: 'Añade al menos 2 participantes' }),
      { status: 400 }
    )
  }

  const seen = new Set<string>()
  const participants: Participant[] = []
  const ids = new Map<string, string>()
  for (const p of body.participants ?? []) {
    const pname = p.name.trim()
    if (!pname || seen.has(pname.toLowerCase())) continue
    seen.add(pname.toLowerCase())
    const id = crypto.randomUUID()
    if (!p.clientId || ids.has(p.clientId)) {
      return new Response(JSON.stringify({ error: 'Participante repetido' }), {
        status: 400
      })
    }
    ids.set(p.clientId, id)
    participants.push({
      id,
      name: pname,
      color: avatarColor(id)
    })
  }

  if (participants.length < 2) {
    return new Response(
      JSON.stringify({ error: 'Añade al menos 2 participantes distintos' }),
      { status: 400 }
    )
  }

  const occupied = new Set<string>()
  const sharedWallets: SharedWallet[] = []
  for (const draft of body.sharedWallets ?? []) {
    const memberIds = draft.memberIds?.map((id) => ids.get(id)) ?? []
    if (
      memberIds.length < 2 ||
      memberIds.some((id) => !id || occupied.has(id)) ||
      new Set(memberIds).size !== memberIds.length
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Cada monedero necesita al menos dos personas distintas y sin repetir'
        }),
        { status: 400 }
      )
    }
    for (const id of memberIds) occupied.add(id!)
    sharedWallets.push({
      id: crypto.randomUUID(),
      memberIds: memberIds as string[],
      lockedRecipientId: null
    })
  }

  const bote = await createBote(name, participants, sharedWallets)
  return new Response(JSON.stringify({ id: bote.id }), { status: 201 })
}
