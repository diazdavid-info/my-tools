import type { APIRoute } from 'astro'
import { addSettlement, getBote, markSettlementPaid } from '@/server/store'

export const prerender = false

interface SettlementBody {
  action?: 'create' | 'mark'
  from?: string
  to?: string
  amountCents?: number
  settlementId?: string
  paid?: boolean
}

export const POST: APIRoute = async ({ params, request }) => {
  const boteId = params.id
  if (!boteId) {
    return new Response(JSON.stringify({ error: 'Falta el id del bote' }), {
      status: 400
    })
  }

  let body: SettlementBody
  try {
    body = (await request.json()) as SettlementBody
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

  if (body.action === 'mark') {
    if (!body.settlementId) {
      return new Response(JSON.stringify({ error: 'Falta el settlement' }), {
        status: 400
      })
    }
    const ok = await markSettlementPaid(
      boteId,
      body.settlementId,
      body.paid ?? true
    )
    if (!ok) {
      return new Response(JSON.stringify({ error: 'No encontrado' }), {
        status: 404
      })
    }
    return new Response(JSON.stringify({ ok: true }))
  }

  const amountCents = Number(body.amountCents)
  if (
    !body.from ||
    !body.to ||
    !Number.isFinite(amountCents) ||
    amountCents <= 0
  ) {
    return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
      status: 400
    })
  }
  const settlement = await addSettlement(
    boteId,
    body.from,
    body.to,
    amountCents
  )
  return new Response(JSON.stringify(settlement), { status: 201 })
}
