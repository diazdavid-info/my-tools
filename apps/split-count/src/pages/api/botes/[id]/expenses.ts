import type { APIRoute } from 'astro'
import { addExpense, getBote } from '@/server/store'
import { validateSplit } from '@/lib/split'
import type { SplitValue } from '@/lib/types'

export const prerender = false

interface ExpenseBody {
  title?: string
  amountCents?: number
  date?: string
  payers?: { id: string; amountCents: number }[]
  split?: SplitValue
}

export const POST: APIRoute = async ({ params, request }) => {
  const boteId = params.id
  if (!boteId) {
    return new Response(JSON.stringify({ error: 'Falta el id del bote' }), {
      status: 400
    })
  }

  let body: ExpenseBody
  try {
    body = (await request.json()) as ExpenseBody
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400
    })
  }

  const bote = await getBote(boteId)
  if (!bote) {
    return new Response(JSON.stringify({ error: 'Bote no encontrado' }), {
      status: 404
    })
  }

  const title = body.title?.trim()
  const amountCents = Number(body.amountCents)
  const payers = body.payers ?? []
  const split = body.split

  if (!title) {
    return new Response(
      JSON.stringify({ error: 'Ponle un concepto al gasto' }),
      { status: 400 }
    )
  }
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return new Response(
      JSON.stringify({ error: 'El importe debe ser mayor que 0' }),
      { status: 400 }
    )
  }
  const participantIds = new Set(bote.participants.map((p) => p.id))
  if (payers.length === 0) {
    return new Response(JSON.stringify({ error: 'Marca quién ha pagado' }), {
      status: 400
    })
  }
  if (
    payers.some(
      (p) =>
        !participantIds.has(p.id) ||
        !Number.isFinite(p.amountCents) ||
        p.amountCents <= 0
    )
  ) {
    return new Response(
      JSON.stringify({ error: 'Pagador o importe no válido' }),
      { status: 400 }
    )
  }
  const payerTotal = payers.reduce((sum, p) => sum + p.amountCents, 0)
  if (payerTotal !== amountCents) {
    return new Response(
      JSON.stringify({
        error: 'Lo pagado debe coincidir con el importe del gasto'
      }),
      { status: 400 }
    )
  }
  if (!split) {
    return new Response(JSON.stringify({ error: 'Falta cómo se reparte' }), {
      status: 400
    })
  }
  const splitError = validateSplit(split, amountCents)
  if (splitError) {
    return new Response(JSON.stringify({ error: splitError }), { status: 400 })
  }
  const shareIds = split.mode === 'equal' ? [] : Object.keys(split.shares)
  if (shareIds.some((id) => !participantIds.has(id))) {
    return new Response(
      JSON.stringify({ error: 'Participante no válido en el reparto' }),
      { status: 400 }
    )
  }

  const expense = await addExpense(boteId, {
    title,
    amountCents,
    date: body.date ?? new Date().toISOString(),
    payers,
    split
  })

  return new Response(JSON.stringify(expense), { status: 201 })
}
