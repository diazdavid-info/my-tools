import type { APIRoute } from 'astro'
import { addExpense, getBote } from '@/server/store'
import { validateSplit } from '@/lib/split'
import type { Bote, SplitValue } from '@/lib/types'

export const prerender = false

export interface ExpenseBody {
  title?: string
  amountCents?: number
  date?: string
  payers?: { id: string; amountCents: number }[]
  split?: SplitValue
}

function jsonError(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), { status })
}

export function parseExpenseBody(
  body: ExpenseBody,
  bote: Bote
): { data: Omit<import('@/lib/types').Expense, 'id'> } | { error: Response } {
  const title = body.title?.trim()
  const amountCents = Number(body.amountCents)
  const payers = body.payers ?? []
  const split = body.split

  if (!title) {
    return { error: jsonError('Ponle un concepto al gasto', 400) }
  }
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { error: jsonError('El importe debe ser mayor que 0', 400) }
  }
  const participantIds = new Set(bote.participants.map((p) => p.id))
  if (payers.length === 0) {
    return { error: jsonError('Marca quién ha pagado', 400) }
  }
  if (
    payers.some(
      (p) =>
        !participantIds.has(p.id) ||
        !Number.isFinite(p.amountCents) ||
        p.amountCents <= 0
    )
  ) {
    return { error: jsonError('Pagador o importe no válido', 400) }
  }
  const payerTotal = payers.reduce((sum, p) => sum + p.amountCents, 0)
  if (payerTotal !== amountCents) {
    return {
      error: jsonError('Lo pagado debe coincidir con el importe del gasto', 400)
    }
  }
  if (!split) {
    return { error: jsonError('Falta cómo se reparte', 400) }
  }
  const splitError = validateSplit(split, amountCents)
  if (splitError) {
    return { error: jsonError(splitError, 400) }
  }
  const shareIds = split.mode === 'equal' ? [] : Object.keys(split.shares)
  if (shareIds.some((id) => !participantIds.has(id))) {
    return { error: jsonError('Participante no válido en el reparto', 400) }
  }

  return {
    data: {
      title,
      amountCents,
      date: body.date ?? new Date().toISOString(),
      payers,
      split
    }
  }
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
    return jsonError('JSON inválido', 400)
  }

  const bote = await getBote(boteId)
  if (!bote) {
    return jsonError('Bote no encontrado', 404)
  }

  const parsed = parseExpenseBody(body, bote)
  if ('error' in parsed) return parsed.error

  const expense = await addExpense(boteId, parsed.data)

  return new Response(JSON.stringify(expense), { status: 201 })
}
