import { describe, expect, it } from 'vitest'
import {
  centsToInput,
  computeBalances,
  computeSettlementSuggestions,
  formatDecimalNumber,
  formatMoney,
  splitEqual,
  splitProportional,
} from '@/lib/split'
import type { Bote, Expense, Participant } from '@/lib/types'

const participants: Participant[] = [
  { id: 'ana', name: 'Ana', color: '#f00' },
  { id: 'luis', name: 'Luis y Sara', color: '#0f0', couple: true },
  { id: 'marta', name: 'Marta', color: '#00f' }
]

describe('splitEqual', () => {
  it('divide por igual sin perder céntimos', () => {
    expect(splitEqual(10000, ['a', 'b', 'c'])).toEqual({
      a: 3334,
      b: 3333,
      c: 3333
    })
  })

  it('con dos participantes exactos', () => {
    expect(splitEqual(10000, ['a', 'b'])).toEqual({ a: 5000, b: 5000 })
  })

  it('con lista vacía devuelve objeto vacío', () => {
    expect(splitEqual(10000, [])).toEqual({})
  })
})

describe('splitProportional', () => {
  it('divide por porcentajes', () => {
    const result = splitProportional(12000, ['a', 'b', 'c'], [50, 30, 20])
    expect(result).toEqual({ a: 6000, b: 3600, c: 2400 })
  })

  it('divide por importes exactos', () => {
    const result = splitProportional(10000, ['a', 'b'], [6000, 4000])
    expect(result).toEqual({ a: 6000, b: 4000 })
  })

  it('ajusta el redondeo para que sume el total', () => {
    const result = splitProportional(
      10001,
      ['a', 'b', 'c'],
      [33.33, 33.33, 33.34]
    )
    const total = Object.values(result).reduce((a, b) => a + b, 0)
    expect(total).toBe(10001)
  })

  it('con pesos 0 reparte por igual', () => {
    const result = splitProportional(9000, ['a', 'b'], [0, 0])
    expect(result).toEqual({ a: 4500, b: 4500 })
  })
})

describe('computeBalances', () => {
  it('calcula saldos con un gasto pagado por varios', () => {
    const expense: Expense = {
      id: 'e1',
      title: 'Cena',
      amountCents: 12000,
      date: new Date().toISOString(),
      payers: [
        { id: 'ana', amountCents: 8000 },
        { id: 'luis', amountCents: 4000 }
      ],
      split: { mode: 'percentages', shares: { ana: 50, luis: 30, marta: 20 } }
    }
    const bote: Bote = {
      id: 'b1',
      name: 'Test',
      createdAt: new Date().toISOString(),
      participants,
      expenses: [expense],
      settlements: []
    }

    const balances = computeBalances(bote)
    expect(balances.ana.net).toBe(8000 - 6000)
    expect(balances.luis.net).toBe(4000 - 3600)
    expect(balances.marta.net).toBe(0 - 2400)
  })
})

describe('computeSettlementSuggestions', () => {
  it('sugiere los pagos mínimos para saldar', () => {
    const balances = {
      ana: { paid: 8000, owed: 6000, net: 2000 },
      luis: { paid: 4000, owed: 3600, net: 400 },
      marta: { paid: 0, owed: 2400, net: -2400 }
    }
    const transfers = computeSettlementSuggestions(balances)
    const total = transfers.reduce((sum, t) => sum + t.amountCents, 0)
    expect(total).toBe(2400)
    expect(transfers.every((t) => t.from === 'marta')).toBe(true)
  })

  it('sin deudas no sugiere nada', () => {
    const balances = {
      ana: { paid: 5000, owed: 5000, net: 0 },
      b: { paid: 5000, owed: 5000, net: 0 }
    }
    expect(computeSettlementSuggestions(balances)).toEqual([])
  })
})

describe('formatMoney', () => {
  it('formatea en euros con formato español', () => {
    const result = formatMoney(12000)
    expect(result).toContain('120')
    expect(result).toContain('€')
  })
})

describe('formatDecimalNumber', () => {
  it('usa coma como separador decimal', () => {
    expect(formatDecimalNumber(70.5)).toBe('70,5')
    expect(formatDecimalNumber(70)).toBe('70')
    expect(formatDecimalNumber(33.33)).toBe('33,33')
  })
})

describe('centsToInput', () => {
  it('usa coma como separador decimal', () => {
    expect(centsToInput(8000)).toBe('80,00')
    expect(centsToInput(4050)).toBe('40,50')
  })
})
