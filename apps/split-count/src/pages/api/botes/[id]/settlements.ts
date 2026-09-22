import type { APIRoute } from 'astro'
import {
  addSettlement,
  deletePendingSettlement,
  getBote,
  markSettlementPaid
} from '@/server/store'
import { computeBalances, planRoutedSettlements } from '@/lib/split'

export const prerender = false

interface SettlementBody {
  action?: 'create' | 'mark' | 'delete'
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
  const recipients = planRoutedSettlements(
    bote,
    computeBalances(bote)
  ).recipients

  if (body.action === 'mark') {
    if (!body.settlementId) {
      return new Response(JSON.stringify({ error: 'Falta el settlement' }), {
        status: 400
      })
    }
    if (
      !bote.settlements.some(
        (settlement) => settlement.id === body.settlementId
      )
    ) {
      return new Response(JSON.stringify({ error: 'No encontrado' }), {
        status: 404
      })
    }
    const ok = await markSettlementPaid(
      boteId,
      body.settlementId,
      body.paid ?? true,
      body.paid === false ? {} : recipients
    )
    if (!ok) {
      return new Response(JSON.stringify({ error: 'No encontrado' }), {
        status: 404
      })
    }
    return new Response(JSON.stringify({ ok: true }))
  }
  if (body.action === 'delete') {
    if (!body.settlementId)
      return new Response(JSON.stringify({ error: 'Falta el pago' }), {
        status: 400
      })
    const deleted = await deletePendingSettlement(boteId, body.settlementId)
    return new Response(JSON.stringify({ ok: deleted }), {
      status: deleted ? 200 : 404
    })
  }

  const amountCents = Number(body.amountCents)
  if (
    !body.from ||
    !body.to ||
    body.from === body.to ||
    !Number.isFinite(amountCents) ||
    !Number.isInteger(amountCents) ||
    amountCents <= 0
  ) {
    return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
      status: 400
    })
  }
  const accountIds = new Set([
    ...bote.participants.map((person) => person.id),
    ...bote.sharedWallets.map((wallet) => wallet.id)
  ])
  if (!accountIds.has(body.from) || !accountIds.has(body.to)) {
    return new Response(JSON.stringify({ error: 'Monedero no válido' }), {
      status: 400
    })
  }
  const settlement = await addSettlement(
    boteId,
    body.from,
    body.to,
    amountCents,
    body.paid === true,
    recipients
  )
  return new Response(JSON.stringify(settlement), { status: 201 })
}
