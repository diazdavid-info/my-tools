import { nanoid } from 'nanoid'
import { getDb, initDb } from './db'
import { computeBalances } from '@/lib/split'
import type {
  Bote,
  Expense,
  Participant,
  SharedWallet,
  Settlement,
  SplitValue
} from '@/lib/types'

const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

function shortId(size = 10): string {
  return nanoid(size).replace(
    /[-_]/g,
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  )
}

interface BoteRow {
  id: string
  name: string
  created_at: string
  participants: string
}

interface ExpenseRow {
  id: string
  title: string
  amount_cents: number
  date: string
  payers: string
  split: string
}

interface SettlementRow {
  id: string
  from_id: string
  to_id: string
  amount_cents: number
  paid: number
}

function toBote(
  row: BoteRow,
  expenses: Expense[],
  settlements: Settlement[],
  sharedWallets: SharedWallet[]
): Bote {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    participants: JSON.parse(row.participants) as Participant[],
    sharedWallets,
    expenses,
    settlements
  }
}

export async function createBote(
  name: string,
  participants: Participant[],
  sharedWallets: SharedWallet[] = []
): Promise<Bote> {
  await initDb()
  const db = getDb()
  const id = shortId()
  const createdAt = new Date().toISOString()
  await db.batch(
    [
      {
        sql: 'INSERT INTO botes (id, name, created_at, participants) VALUES (?, ?, ?, ?)',
        args: [id, name, createdAt, JSON.stringify(participants)]
      },
      ...sharedWallets.map((wallet) => ({
        sql: 'INSERT INTO shared_wallets (id, bote_id, member_ids, locked_recipient_id) VALUES (?, ?, ?, ?)',
        args: [
          wallet.id,
          id,
          JSON.stringify(wallet.memberIds),
          wallet.lockedRecipientId ?? null
        ]
      }))
    ],
    'write'
  )
  return {
    id,
    name,
    createdAt,
    participants,
    sharedWallets,
    expenses: [],
    settlements: []
  }
}

export async function addParticipant(
  boteId: string,
  participant: Participant
): Promise<Participant | null> {
  const bote = await getBote(boteId)
  if (!bote) return null
  const db = getDb()
  const operations = bote.expenses
    .filter(
      (expense) =>
        expense.split.mode === 'equal' && !expense.split.participantIds
    )
    .map((expense) => ({
      sql: 'UPDATE expenses SET split = ? WHERE id = ? AND bote_id = ?',
      args: [
        JSON.stringify({
          mode: 'equal',
          participantIds: bote.participants.map((p) => p.id)
        }),
        expense.id,
        boteId
      ]
    }))
  operations.push({
    sql: 'UPDATE botes SET participants = ? WHERE id = ?',
    args: [JSON.stringify([...bote.participants, participant]), boteId]
  })
  await db.batch(operations, 'write')
  return participant
}

export async function addSharedWallet(
  boteId: string,
  wallet: SharedWallet
): Promise<SharedWallet> {
  await initDb()
  await getDb().execute({
    sql: 'INSERT INTO shared_wallets (id, bote_id, member_ids, locked_recipient_id) VALUES (?, ?, ?, ?)',
    args: [
      wallet.id,
      boteId,
      JSON.stringify(wallet.memberIds),
      wallet.lockedRecipientId ?? null
    ]
  })
  return wallet
}

export async function getBote(id: string): Promise<Bote | null> {
  await initDb()
  const db = getDb()
  const result = await db.execute({
    sql: 'SELECT * FROM botes WHERE id = ?',
    args: [id]
  })
  const row = result.rows[0] as unknown as BoteRow | undefined
  if (!row) return null

  const expenseRows = await db.execute({
    sql: 'SELECT * FROM expenses WHERE bote_id = ? ORDER BY date DESC, created_at DESC',
    args: [id]
  })
  const expenses: Expense[] = expenseRows.rows.map((r) => {
    const er = r as unknown as ExpenseRow
    return {
      id: er.id,
      title: er.title,
      amountCents: er.amount_cents,
      date: er.date,
      payers: JSON.parse(er.payers),
      split: JSON.parse(er.split) as SplitValue
    }
  })

  const settlementRows = await db.execute({
    sql: 'SELECT * FROM settlements WHERE bote_id = ? ORDER BY created_at',
    args: [id]
  })
  const settlements: Settlement[] = settlementRows.rows.map((r) => {
    const sr = r as unknown as SettlementRow
    return {
      id: sr.id,
      from: sr.from_id,
      to: sr.to_id,
      amountCents: sr.amount_cents,
      paid: sr.paid === 1
    }
  })

  const walletRows = await db.execute({
    sql: 'SELECT id, member_ids, locked_recipient_id FROM shared_wallets WHERE bote_id = ? ORDER BY created_at, rowid',
    args: [id]
  })
  const sharedWallets: SharedWallet[] = walletRows.rows.map((wallet) => ({
    id: String(wallet.id),
    memberIds: JSON.parse(String(wallet.member_ids)) as string[],
    lockedRecipientId: wallet.locked_recipient_id
      ? String(wallet.locked_recipient_id)
      : null
  }))

  const bote = toBote(row, expenses, settlements, sharedWallets)
  if (
    sharedWallets.some((wallet) => wallet.lockedRecipientId) &&
    settlements.every((settlement) => settlement.paid) &&
    Object.values(computeBalances(bote)).every((balance) => balance.net === 0)
  ) {
    await db.execute({
      sql: 'UPDATE shared_wallets SET locked_recipient_id = NULL WHERE bote_id = ?',
      args: [id]
    })
    for (const wallet of sharedWallets) wallet.lockedRecipientId = null
  }
  return bote
}

export async function lockSharedWalletRecipients(
  boteId: string,
  recipients: Record<string, string>
): Promise<void> {
  await initDb()
  const operations = Object.entries(recipients).map(
    ([walletId, recipientId]) => ({
      sql: 'UPDATE shared_wallets SET locked_recipient_id = ? WHERE id = ? AND bote_id = ? AND locked_recipient_id IS NULL',
      args: [recipientId, walletId, boteId]
    })
  )
  if (operations.length) await getDb().batch(operations, 'write')
}

export async function addExpense(
  boteId: string,
  expense: Omit<Expense, 'id'>
): Promise<Expense | null> {
  await initDb()
  const db = getDb()
  const id = shortId()
  await db.execute({
    sql: 'INSERT INTO expenses (id, bote_id, title, amount_cents, date, payers, split) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      boteId,
      expense.title,
      expense.amountCents,
      expense.date,
      JSON.stringify(expense.payers),
      JSON.stringify(expense.split)
    ]
  })
  return { id, ...expense }
}

export async function updateExpense(
  boteId: string,
  expenseId: string,
  expense: Omit<Expense, 'id'>
): Promise<Expense | null> {
  await initDb()
  const db = getDb()
  const result = await db.execute({
    sql: 'UPDATE expenses SET title = ?, amount_cents = ?, date = ?, payers = ?, split = ? WHERE id = ? AND bote_id = ?',
    args: [
      expense.title,
      expense.amountCents,
      expense.date,
      JSON.stringify(expense.payers),
      JSON.stringify(expense.split),
      expenseId,
      boteId
    ]
  })
  if (result.rowsAffected === 0) return null
  return { id: expenseId, ...expense }
}

export async function deleteExpense(
  boteId: string,
  expenseId: string
): Promise<boolean> {
  await initDb()
  const db = getDb()
  const result = await db.execute({
    sql: 'DELETE FROM expenses WHERE id = ? AND bote_id = ?',
    args: [expenseId, boteId]
  })
  return result.rowsAffected > 0
}

export async function addSettlement(
  boteId: string,
  from: string,
  to: string,
  amountCents: number,
  paid = false,
  recipients: Record<string, string> = {}
): Promise<Settlement | null> {
  await initDb()
  const db = getDb()
  const id = shortId()
  await db.batch(
    [
      ...Object.entries(recipients).map(([walletId, recipientId]) => ({
        sql: 'UPDATE shared_wallets SET locked_recipient_id = ? WHERE id = ? AND bote_id = ? AND locked_recipient_id IS NULL',
        args: [recipientId, walletId, boteId]
      })),
      {
        sql: 'INSERT INTO settlements (id, bote_id, from_id, to_id, amount_cents, paid) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, boteId, from, to, amountCents, paid ? 1 : 0]
      }
    ],
    'write'
  )
  return { id, from, to, amountCents, paid }
}

export async function deletePendingSettlement(
  boteId: string,
  settlementId: string
): Promise<boolean> {
  await initDb()
  const result = await getDb().execute({
    sql: 'DELETE FROM settlements WHERE id = ? AND bote_id = ? AND paid = 0',
    args: [settlementId, boteId]
  })
  return result.rowsAffected > 0
}

export async function markSettlementPaid(
  boteId: string,
  settlementId: string,
  paid: boolean,
  recipients: Record<string, string> = {}
): Promise<boolean> {
  await initDb()
  const db = getDb()
  const results = await db.batch(
    [
      ...Object.entries(recipients).map(([walletId, recipientId]) => ({
        sql: 'UPDATE shared_wallets SET locked_recipient_id = ? WHERE id = ? AND bote_id = ? AND locked_recipient_id IS NULL',
        args: [recipientId, walletId, boteId]
      })),
      {
        sql: 'UPDATE settlements SET paid = ? WHERE id = ? AND bote_id = ?',
        args: [paid ? 1 : 0, settlementId, boteId]
      }
    ],
    'write'
  )
  const result = results[results.length - 1]
  return result.rowsAffected > 0
}
