import { describe, expect, it } from 'vitest'
import {
  centsToInput,
  computeBalances,
  computeRoutedSettlements,
  planRoutedSettlements,
  computeSettlementSuggestions,
  formatDecimalNumber,
  formatMoney,
  splitEqual,
  splitExpense,
  splitProportional
} from '@/lib/split'
import type { Bote, Expense, Participant } from '@/lib/types'

const participants: Participant[] = [
  { id: 'ana', name: 'Ana', color: '#f00' },
  { id: 'luis', name: 'Luis', color: '#0f0' },
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
      sharedWallets: [],
      expenses: [expense],
      settlements: []
    }

    const balances = computeBalances(bote)
    expect(balances.ana.net).toBe(8000 - 6000)
    expect(balances.luis.net).toBe(4000 - 3600)
    expect(balances.marta.net).toBe(0 - 2400)
  })
})

describe('monederos compartidos', () => {
  const people: Participant[] = [
    { id: 'david', name: 'David', color: '#f00' },
    { id: 'lau', name: 'Lau', color: '#0f0' },
    { id: 'bea', name: 'Bea', color: '#00f' }
  ]
  const expense = (
    id: string,
    amountCents: number,
    payerId: string,
    split: Expense['split']
  ): Expense => ({
    id,
    title: id,
    amountCents,
    date: '2026-01-01',
    payers: [{ id: payerId, amountCents }],
    split
  })
  const bote: Bote = {
    id: 'b',
    name: 'Viaje',
    createdAt: '2026-01-01',
    participants: people,
    sharedWallets: [
      { id: 'joint', memberIds: ['david', 'lau'], lockedRecipientId: null }
    ],
    expenses: [
      expense('comida', 3000, 'joint', {
        mode: 'equal',
        participantIds: ['david', 'lau', 'bea']
      }),
      expense('cafe', 900, 'bea', {
        mode: 'equal',
        participantIds: ['david', 'lau', 'bea']
      }),
      expense('postre', 600, 'bea', {
        mode: 'percentages',
        shares: { bea: 50, lau: 50 }
      })
    ],
    settlements: []
  }

  it('separa el saldo conjunto de los individuales cuando paga Bea', () => {
    const balances = computeBalances(bote)
    expect(
      Object.fromEntries(
        Object.entries(balances).map(([id, balance]) => [id, balance.net])
      )
    ).toEqual({
      david: -300,
      lau: -600,
      bea: -100,
      joint: 1000
    })
  })

  it('elige el receptor con menos pagos y respeta la elección fijada', () => {
    const balances = computeBalances(bote)
    const transfers = computeRoutedSettlements(bote, balances)
    expect(transfers).toEqual([
      { from: 'lau', to: 'david', amountCents: 600 },
      { from: 'bea', to: 'david', amountCents: 100 },
      { from: 'david', to: 'joint', amountCents: 1000 }
    ])
    const settled = computeBalances({
      ...bote,
      settlements: transfers.map((transfer, index) => ({
        id: String(index),
        ...transfer,
        paid: true
      }))
    })
    expect(Object.values(settled).every((balance) => balance.net === 0)).toBe(
      true
    )
    const withLau = {
      ...bote,
      sharedWallets: [{ ...bote.sharedWallets[0], lockedRecipientId: 'lau' }]
    }
    expect(computeRoutedSettlements(withLau, balances)).toEqual([
      { from: 'david', to: 'lau', amountCents: 300 },
      { from: 'bea', to: 'lau', amountCents: 100 },
      { from: 'lau', to: 'joint', amountCents: 1000 }
    ])
  })

  it('cambia de receptor cuando reduce el número de pagos', () => {
    const balances = {
      david: { paid: 0, owed: 0, net: -300 },
      lau: { paid: 0, owed: 0, net: -1000 },
      bea: { paid: 0, owed: 0, net: 300 },
      joint: { paid: 0, owed: 0, net: 1000 }
    }
    const chosen = planRoutedSettlements(bote, balances)
    expect(chosen.recipients).toEqual({ joint: 'lau' })
    expect(chosen.transfers).toHaveLength(2)
    const locked = planRoutedSettlements(
      {
        ...bote,
        sharedWallets: [
          { ...bote.sharedWallets[0], lockedRecipientId: 'david' }
        ]
      },
      balances
    )
    expect(locked.recipients).toEqual({ joint: 'david' })
    expect(locked.transfers).toHaveLength(3)
  })

  it('mantiene independientes varios monederos compartidos', () => {
    const fourPeople = [
      ...people,
      { id: 'carlos', name: 'Carlos', color: '#fff' }
    ]
    const all = fourPeople.map((person) => person.id)
    const second = {
      id: 'other',
      memberIds: ['bea', 'carlos'],
      lockedRecipientId: null
    }
    const multiple: Bote = {
      ...bote,
      participants: fourPeople,
      sharedWallets: [...bote.sharedWallets, second],
      expenses: [
        expense('uno', 4000, 'joint', { mode: 'equal', participantIds: all }),
        expense('dos', 2000, 'other', { mode: 'equal', participantIds: all })
      ]
    }
    const balances = computeBalances(multiple)
    expect(
      Object.fromEntries(
        Object.entries(balances).map(([id, balance]) => [id, balance.net])
      )
    ).toEqual({
      david: -500,
      lau: -500,
      bea: -1000,
      carlos: -1000,
      joint: 2000,
      other: 1000
    })
    const transfers = computeRoutedSettlements(multiple, balances)
    const settled = computeBalances({
      ...multiple,
      settlements: transfers.map((transfer, index) => ({
        id: String(index),
        ...transfer,
        paid: true
      }))
    })
    expect(Object.values(settled).every((balance) => balance.net === 0)).toBe(
      true
    )
  })

  it('respeta un cobro anterior al cambiar de responsable', () => {
    const withEarlierPayment: Bote = {
      ...bote,
      sharedWallets: [{ ...bote.sharedWallets[0], lockedRecipientId: 'lau' }],
      settlements: [
        { id: 'paid', from: 'bea', to: 'david', amountCents: 100, paid: true }
      ]
    }
    const balances = computeBalances(withEarlierPayment)
    const transfers = computeRoutedSettlements(withEarlierPayment, balances)
    expect(transfers).toEqual([
      { from: 'david', to: 'lau', amountCents: 400 },
      { from: 'lau', to: 'joint', amountCents: 1000 }
    ])
  })

  it('mantiene el reparto igualitario original al añadir una persona', () => {
    const original = bote.expenses[0]
    expect(
      splitExpense(original, [
        ...people,
        { id: 'new', name: 'Nueva', color: '#fff' }
      ])
    ).toEqual({
      david: 1000,
      lau: 1000,
      bea: 1000
    })
  })

  it('cuadra los saldos después de pagos personales y otro pago compartido', () => {
    const extended: Bote = {
      ...bote,
      expenses: [
        ...bote.expenses,
        expense('entradas', 1200, 'david', {
          mode: 'equal',
          participantIds: ['david', 'lau', 'bea']
        }),
        expense('taxi', 1000, 'lau', {
          mode: 'percentages',
          shares: { david: 50, lau: 50 }
        }),
        expense('compra', 1800, 'joint', {
          mode: 'equal',
          participantIds: ['david', 'lau', 'bea']
        })
      ]
    }
    const balances = computeBalances(extended)
    expect(
      Object.fromEntries(
        Object.entries(balances).map(([id, balance]) => [id, balance.net])
      )
    ).toEqual({
      david: 0,
      lau: -500,
      bea: -1100,
      joint: 1600
    })
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
