import { describe, expect, it } from 'vitest'
import { parseExpenseBody } from './expenses'
import type { Bote } from '@/lib/types'

const bote: Bote = {
  id: 'bote',
  name: 'Viaje',
  createdAt: '2026-09-24T00:00:00.000Z',
  participants: [
    { id: 'ana', name: 'Ana', color: '#fff' },
    { id: 'luis', name: 'Luis', color: '#000' }
  ],
  sharedWallets: [],
  expenses: [],
  settlements: []
}

const valid = {
  title: 'Cena',
  amountCents: 1000,
  date: '2026-09-24T12:00:00.000Z',
  payers: [{ id: 'ana', amountCents: 1000 }],
  split: { mode: 'equal', participantIds: ['ana', 'luis'] }
}

describe('parseExpenseBody', () => {
  it('accepts a valid expense', () => {
    expect(parseExpenseBody(valid, bote)).toHaveProperty('data')
  })

  it.each([
    null,
    [],
    { ...valid, payers: {} },
    { ...valid, split: { mode: 'unsupported' } },
    { ...valid, split: { mode: 'amounts', shares: null } },
    { ...valid, split: { mode: 'equal', participantIds: {} } },
    { ...valid, amountCents: Number.MAX_SAFE_INTEGER + 1 },
    { ...valid, date: 'fecha inválida' }
  ])('rejects malformed expense data', (input) => {
    const result = parseExpenseBody(input, bote)
    expect(result).toHaveProperty('error')
    if ('error' in result) expect(result.error.status).toBe(400)
  })
})
