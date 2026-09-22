import { afterAll, describe, expect, it } from 'vitest'
import { createClient } from '@libsql/client'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getDb, initDb } from './db'

const directory = mkdtempSync(join(tmpdir(), 'split-count-migration-'))
const path = join(directory, 'old.db')
const previousPath = process.env.DB_PATH
process.env.DB_PATH = path

afterAll(() => {
  if (previousPath === undefined) delete process.env.DB_PATH
  else process.env.DB_PATH = previousPath
  rmSync(directory, { recursive: true, force: true })
})

describe('migración de participantes antiguos', () => {
  it('retira las marcas antiguas sin modificar los nombres', async () => {
    const oldDb = createClient({ url: `file:${path}` })
    await oldDb.execute(
      'CREATE TABLE botes (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL, participants TEXT NOT NULL)'
    )
    await oldDb.execute({
      sql: 'INSERT INTO botes (id, name, created_at, participants) VALUES (?, ?, ?, ?)',
      args: [
        'old',
        'Viejo',
        '2025-01-01',
        JSON.stringify([
          {
            id: 'one',
            name: 'Luis y Sara',
            color: '#fff',
            couple: true,
            members: []
          }
        ])
      ]
    })
    await oldDb.execute(
      "CREATE TABLE shared_wallets (id TEXT PRIMARY KEY, bote_id TEXT NOT NULL, member_ids TEXT NOT NULL, recipient_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))"
    )
    await oldDb.execute({
      sql: 'INSERT INTO shared_wallets (id, bote_id, member_ids, recipient_id) VALUES (?, ?, ?, ?)',
      args: ['joint', 'old', JSON.stringify(['one', 'two']), 'one']
    })
    await oldDb.execute({
      sql: 'INSERT INTO botes (id, name, created_at, participants) VALUES (?, ?, ?, ?)',
      args: ['active', 'Activo', '2025-01-01', '[]']
    })
    await oldDb.execute({
      sql: 'INSERT INTO shared_wallets (id, bote_id, member_ids, recipient_id) VALUES (?, ?, ?, ?)',
      args: ['active-joint', 'active', JSON.stringify(['one', 'two']), 'two']
    })
    await oldDb.execute(
      "CREATE TABLE settlements (id TEXT PRIMARY KEY, bote_id TEXT NOT NULL, from_id TEXT NOT NULL, to_id TEXT NOT NULL, amount_cents INTEGER NOT NULL, paid INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))"
    )
    await oldDb.execute({
      sql: 'INSERT INTO settlements (id, bote_id, from_id, to_id, amount_cents) VALUES (?, ?, ?, ?, ?)',
      args: ['payment', 'active', 'one', 'two', 100]
    })
    oldDb.close()

    await initDb()
    await initDb()
    const result = await getDb().execute({
      sql: 'SELECT participants FROM botes WHERE id = ?',
      args: ['old']
    })
    expect(JSON.parse(String(result.rows[0].participants))).toEqual([
      { id: 'one', name: 'Luis y Sara', color: '#fff' }
    ])
    const columns = await getDb().execute('PRAGMA table_info(shared_wallets)')
    expect(columns.rows.map((column) => String(column.name))).toContain(
      'locked_recipient_id'
    )
    expect(columns.rows.map((column) => String(column.name))).not.toContain(
      'recipient_id'
    )
    const wallets = await getDb().execute(
      'SELECT id, locked_recipient_id FROM shared_wallets ORDER BY id'
    )
    expect(
      wallets.rows.map((wallet) => [wallet.id, wallet.locked_recipient_id])
    ).toEqual([
      ['active-joint', 'two'],
      ['joint', null]
    ])
  })
})
