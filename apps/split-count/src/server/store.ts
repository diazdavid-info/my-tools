import { nanoid } from 'nanoid'
import { getDb, initDb } from './db'
import type {
  Bote,
  Expense,
  Participant,
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
  settlements: Settlement[]
): Bote {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    participants: JSON.parse(row.participants) as Participant[],
    expenses,
    settlements
  }
}

export async function createBote(
  name: string,
  participants: Participant[]
): Promise<Bote> {
  await initDb()
  const db = getDb()
  const id = shortId()
  const createdAt = new Date().toISOString()
  await db.execute({
    sql: 'INSERT INTO botes (id, name, created_at, participants) VALUES (?, ?, ?, ?)',
    args: [id, name, createdAt, JSON.stringify(participants)]
  })
  return { id, name, createdAt, participants, expenses: [], settlements: [] }
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

  return toBote(row, expenses, settlements)
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
  amountCents: number
): Promise<Settlement | null> {
  await initDb()
  const db = getDb()
  const id = shortId()
  await db.execute({
    sql: 'INSERT INTO settlements (id, bote_id, from_id, to_id, amount_cents) VALUES (?, ?, ?, ?, ?)',
    args: [id, boteId, from, to, amountCents]
  })
  return { id, from, to, amountCents, paid: false }
}

export async function markSettlementPaid(
  boteId: string,
  settlementId: string,
  paid: boolean
): Promise<boolean> {
  await initDb()
  const db = getDb()
  const result = await db.execute({
    sql: 'UPDATE settlements SET paid = ? WHERE id = ? AND bote_id = ?',
    args: [paid ? 1 : 0, settlementId, boteId]
  })
  return result.rowsAffected > 0
}
