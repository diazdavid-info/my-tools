import type { APIRoute } from 'astro'
import { createBote } from '@/server/store'
import { avatarColor } from '@/lib/split'
import type { Participant } from '@/lib/types'

export const prerender = false

interface CreateBody {
  name?: string
  participants?: { name: string; couple?: boolean; members?: string[] }[]
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
  for (const p of body.participants ?? []) {
    const pname = p.name.trim()
    if (!pname || seen.has(pname.toLowerCase())) continue
    seen.add(pname.toLowerCase())
    const id = crypto.randomUUID()
    participants.push({
      id,
      name: pname,
      color: avatarColor(id),
      couple: p.couple,
      members: p.members
    })
  }

  if (participants.length < 2) {
    return new Response(
      JSON.stringify({ error: 'Añade al menos 2 participantes distintos' }),
      { status: 400 }
    )
  }

  const bote = await createBote(name, participants)
  return new Response(JSON.stringify({ id: bote.id }), { status: 201 })
}
