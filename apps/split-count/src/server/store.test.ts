import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  addExpense,
  addParticipant,
  addSharedWallet,
  createBote,
  getBote,
  lockSharedWalletRecipients,
  addSettlement,
  deletePendingSettlement
} from './store'
import type { Participant } from '@/lib/types'

const directory = mkdtempSync(join(tmpdir(), 'split-count-store-'))
const previousPath = process.env.DB_PATH
process.env.DB_PATH = join(directory, 'test.db')

afterAll(() => {
  if (previousPath === undefined) delete process.env.DB_PATH
  else process.env.DB_PATH = previousPath
  rmSync(directory, { recursive: true, force: true })
})

describe('configuración posterior del bote', () => {
  it('conserva el reparto histórico y fija el receptor durante la liquidación', async () => {
    const people: Participant[] = [
      { id: 'david', name: 'David', color: '#f00' },
      { id: 'lau', name: 'Lau', color: '#0f0' }
    ]
    const bote = await createBote('Viaje', people)
    await addExpense(bote.id, {
      title: 'Cena',
      amountCents: 1000,
      date: '2026-01-01',
      payers: [{ id: 'david', amountCents: 1000 }],
      split: { mode: 'equal' }
    })
    await addParticipant(bote.id, { id: 'bea', name: 'Bea', color: '#00f' })
    const wallet = {
      id: 'joint',
      memberIds: ['david', 'lau'],
      lockedRecipientId: null
    }
    await addSharedWallet(bote.id, wallet)
    await lockSharedWalletRecipients(bote.id, { joint: 'lau' })

    const updated = await getBote(bote.id)
    expect(updated?.participants.map((person) => person.name)).toEqual([
      'David',
      'Lau',
      'Bea'
    ])
    expect(updated?.expenses[0].split).toEqual({
      mode: 'equal',
      participantIds: ['david', 'lau']
    })
    expect(updated?.sharedWallets).toEqual([
      { ...wallet, lockedRecipientId: 'lau' }
    ])
    await addSettlement(bote.id, 'lau', 'david', 500, true)
    const pending = await addSettlement(bote.id, 'david', 'lau', 100, false)
    expect((await getBote(bote.id))?.sharedWallets[0].lockedRecipientId).toBe(
      'lau'
    )
    await deletePendingSettlement(bote.id, pending!.id)
    const settled = await getBote(bote.id)
    expect(settled?.sharedWallets[0].lockedRecipientId).toBeNull()
  })
})
