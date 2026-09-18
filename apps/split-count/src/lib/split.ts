import type { Bote, Expense, Participant, SplitValue } from './types'

/** Colores de avatar disponibles (tints del diseño) */
export const AVATAR_COLORS = [
  '#F7D3C3',
  '#CFDCF6',
  '#C5E6CF',
  '#F9E2C0',
  '#E4D3F3',
  '#FBD3DA',
  '#D3EDF4',
  '#F4EAC0'
]

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

export function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/** Reparto del importe de un gasto entre los participantes (en céntimos) */
export function splitExpense(
  expense: Expense,
  participants: Participant[]
): Record<string, number> {
  if (expense.split.mode === 'equal') {
    return splitEqual(
      expense.amountCents,
      participants.map((p) => p.id)
    )
  }

  const shares = expense.split.shares
  const involved = participants.filter((p) => (shares[p.id] ?? 0) > 0)
  if (involved.length === 0) return {}

  return splitProportional(
    expense.amountCents,
    involved.map((p) => p.id),
    involved.map((p) => shares[p.id] ?? 0)
  )
}

/** Reparto por igual con ajuste de redondeo (céntimos restantes al primero) */
export function splitEqual(
  amountCents: number,
  ids: string[]
): Record<string, number> {
  const result: Record<string, number> = {}
  const n = ids.length
  if (n === 0) return result
  const base = Math.floor(amountCents / n)
  let rest = amountCents - base * n
  for (const id of ids) {
    result[id] = base + (rest > 0 ? 1 : 0)
    if (rest > 0) rest--
  }
  return result
}

/** Reparto proporcional (porcentajes o importes) con redondeo */
export function splitProportional(
  amountCents: number,
  ids: string[],
  weights: number[]
): Record<string, number> {
  const result: Record<string, number> = {}
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return splitEqual(amountCents, ids)

  let assigned = 0
  ids.forEach((id, i) => {
    const cents = Math.round((amountCents * weights[i]) / total)
    result[id] = cents
    assigned += cents
  })

  // Ajustar diferencia de redondeo
  let diff = amountCents - assigned
  if (diff !== 0) {
    const order = [...ids].sort((a, b) => result[b] - result[a])
    for (const id of order) {
      if (diff === 0) break
      result[id] += diff > 0 ? 1 : -1
      diff += diff > 0 ? -1 : 1
    }
  }
  return result
}

export interface Balance {
  paid: number
  owed: number
  net: number
}

/** Saldos netos por participante: pagado − lo que le toca pagar */
export function computeBalances(bote: Bote): Record<string, Balance> {
  const balances: Record<string, Balance> = {}
  for (const p of bote.participants) {
    balances[p.id] = { paid: 0, owed: 0, net: 0 }
  }

  for (const expense of bote.expenses) {
    for (const payer of expense.payers) {
      if (balances[payer.id]) balances[payer.id].paid += payer.amountCents
    }
    const shares = splitExpense(expense, bote.participants)
    for (const [id, cents] of Object.entries(shares)) {
      if (balances[id]) balances[id].owed += cents
    }
  }

  for (const settlement of bote.settlements) {
    if (balances[settlement.from] && settlement.paid) {
      balances[settlement.from].paid += settlement.amountCents
    }
    if (balances[settlement.to] && settlement.paid) {
      balances[settlement.to].owed += settlement.amountCents
    }
  }

  for (const b of Object.values(balances)) {
    b.net = b.paid - b.owed
  }
  return balances
}

/** Pagos mínimos para saldar deudas (algoritmo greedy) */
export function computeSettlementSuggestions(
  balances: Record<string, Balance>
): { from: string; to: string; amountCents: number }[] {
  const debtors = Object.entries(balances)
    .filter(([, b]) => b.net < -0)
    .map(([id, b]) => ({ id, amount: -b.net }))
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount)
  const creditors = Object.entries(balances)
    .map(([id, b]) => ({ id, amount: b.net }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const transfers: { from: string; to: string; amountCents: number }[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    if (pay > 0)
      transfers.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amountCents: pay
      })
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount <= 0) i++
    if (creditors[j].amount <= 0) j++
  }
  return transfers
}

/** Suma de lo pagado por cada participante en un gasto */
export function isSplitComplete(
  expense: Expense,
  participants: Participant[]
): boolean {
  if (expense.split.mode === 'equal') return participants.length > 0
  const total = Object.values(expense.split.shares).reduce((a, b) => a + b, 0)
  return total > 0
}

export function validateSplit(
  split: SplitValue,
  amountCents: number
): string | null {
  if (split.mode === 'equal') return null
  const total = Object.values(split.shares).reduce((a, b) => a + b, 0)
  if (total <= 0) return 'Añade al menos a un participante'
  if (split.mode === 'percentages' && Math.abs(total - 100) > 0.01)
    return `Los porcentajes deben sumar 100 % (suman ${formatPercentInput(total)})`
  if (split.mode === 'amounts' && Math.round(total * 100) !== amountCents)
    return `Los importes deben sumar el total (${formatMoney(amountCents)})`
  return null
}

export function formatMoney(cents: number, decimals = 2): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(cents / 100)
}

/** Número decimal con coma y sin ceros finales (70.5 → "70,5", 70 → "70") */
export function formatDecimalNumber(value: number): string {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value)
}

/** Céntimos a texto de input con coma (8000 → "80,00") */
export function centsToInput(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatCompactMoney(cents: number): string {
  return formatMoney(cents, 0)
}

function formatPercentInput(value: number): string {
  return formatDecimalNumber(value)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short'
  }).format(d)
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(d)
}

export function dateGroupLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (sameDay(date, today)) return 'HOY'
  if (sameDay(date, yesterday)) return 'AYER'
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  })
    .format(date)
    .toUpperCase()
}
