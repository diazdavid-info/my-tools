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
  body: unknown,
  bote: Bote
): { data: Omit<import('@/lib/types').Expense, 'id'> } | { error: Response } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: jsonError('Datos del gasto no válidos', 400) }
  }
  const input = body as ExpenseBody
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const amountCents = input.amountCents
  const payers = input.payers
  const split = input.split

  if (!title) {
    return { error: jsonError('Ponle un concepto al gasto', 400) }
  }
  if (!Number.isSafeInteger(amountCents) || amountCents! <= 0) {
    return { error: jsonError('El importe debe ser mayor que 0', 400) }
  }
  const participantIds = new Set(bote.participants.map((p) => p.id))
  const walletIds = new Set(bote.sharedWallets.map((wallet) => wallet.id))
  if (!Array.isArray(payers) || payers.length === 0) {
    return { error: jsonError('Elige con qué monedero se pagó', 400) }
  }
  if (
    payers.some(
      (p) =>
        !p ||
        typeof p.id !== 'string' ||
        (!participantIds.has(p.id) && !walletIds.has(p.id)) ||
        !Number.isSafeInteger(p.amountCents) ||
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
  if (payers.length > 1 && payers.some((payer) => walletIds.has(payer.id))) {
    return {
      error: jsonError(
        'Un monedero compartido debe ser el único pagador de este gasto',
        400
      )
    }
  }
  if (new Set(payers.map((payer) => payer.id)).size !== payers.length) {
    return { error: jsonError('Hay pagadores repetidos', 400) }
  }
  if (!split || typeof split !== 'object' || Array.isArray(split)) {
    return { error: jsonError('Falta cómo se reparte', 400) }
  }
  const splitError = validateSplit(split, amountCents!)
  if (splitError) {
    return { error: jsonError(splitError, 400) }
  }
  const shareIds = split.mode === 'equal' ? [] : Object.keys(split.shares)
  if (shareIds.some((id) => !participantIds.has(id))) {
    return { error: jsonError('Participante no válido en el reparto', 400) }
  }
  if (split.mode === 'equal') {
    const ids =
      split.participantIds ?? bote.participants.map((person) => person.id)
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => typeof id !== 'string' || !participantIds.has(id))
    ) {
      return { error: jsonError('Participantes no válidos en el reparto', 400) }
    }
    split.participantIds = ids
  }

  const date = input.date ?? new Date().toISOString()
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(date) ||
    !Number.isFinite(Date.parse(date))
  ) {
    return { error: jsonError('Fecha no válida', 400) }
  }

  return {
    data: {
      title,
      amountCents: amountCents!,
      date,
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

  let body: unknown
  try {
    body = await request.json()
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
