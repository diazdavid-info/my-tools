import { createClient, type Client } from '@libsql/client'
import { dirname, isAbsolute, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'

let client: Client | undefined

/** DB_PATH comes from Astro's local .env or the runtime environment in production. */
export function getDbPath(): string {
  const dbPath = process.env.DB_PATH ?? import.meta.env.DB_PATH
  if (!dbPath) {
    throw new Error('DB_PATH is required. Define it in .env locally or in the deployment environment.')
  }
  return isAbsolute(dbPath) ? dbPath : resolve(dbPath)
}

export function getDb(): Client {
  if (!client) {
    const file = getDbPath()
    mkdirSync(dirname(file), { recursive: true })
    client = createClient({ url: `file:${file}` })
  }
  return client
}

export async function initDb(): Promise<void> {
  const db = getDb()
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS botes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      participants TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      bote_id TEXT NOT NULL,
      title TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Otros',
      payers TEXT NOT NULL DEFAULT '[]',
      split TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (bote_id) REFERENCES botes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id TEXT PRIMARY KEY,
      bote_id TEXT NOT NULL,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      paid INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (bote_id) REFERENCES botes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_bote ON expenses(bote_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_bote ON settlements(bote_id);
  `)
}
