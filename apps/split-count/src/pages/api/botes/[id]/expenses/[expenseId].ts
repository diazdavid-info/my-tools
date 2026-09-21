import type { APIRoute } from 'astro'
import { getBote, updateExpense } from '@/server/store'
import { parseExpenseBody } from '../expenses'
import type { ExpenseBody } from '../expenses'

export const prerender = false

export const PUT: APIRoute = async ({ params, request }) => {
  const boteId = params.id
  const expenseId = params.expenseId
  if (!boteId) {
    return new Response(JSON.stringify({ error: 'Falta el id del bote' }), {
      status: 400
    })
  }
  if (!expenseId) {
    return new Response(JSON.stringify({ error: 'Falta el id del gasto' }), {
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

  const existing = bote.expenses.find((e) => e.id === expenseId)
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Gasto no encontrado' }), {
      status: 404
    })
  }

  const parsed = parseExpenseBody(body, bote)
  if ('error' in parsed) return parsed.error

  const expense = await updateExpense(boteId, expenseId, parsed.data)
  if (!expense) {
    return new Response(JSON.stringify({ error: 'Gasto no encontrado' }), {
      status: 404
    })
  }

  return new Response(JSON.stringify(expense), { status: 200 })
}
