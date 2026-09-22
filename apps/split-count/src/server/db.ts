import { createClient, type Client } from '@libsql/client'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { existsSync, mkdirSync, statSync } from 'node:fs'

let client: Client | undefined
let legacyParticipantsCleaned = false
let walletSchemaMigrated = false
let initialization: Promise<void> | undefined

/** DB_PATH comes from Astro's local .env or the runtime environment in production. */
export function getDbPath(): string {
  const dbPath = process.env.DB_PATH ?? import.meta.env.DB_PATH
  if (!dbPath) {
    throw new Error(
      'DB_PATH is required. Define it in .env locally or in the deployment environment.'
    )
  }

  const resolvedPath = isAbsolute(dbPath) ? dbPath : resolve(dbPath)
  if (existsSync(resolvedPath) && statSync(resolvedPath).isDirectory()) {
    return join(resolvedPath, 'bote.db')
  }

  return resolvedPath
}

export function getDb(): Client {
  if (!client) {
    const file = getDbPath()
    mkdirSync(dirname(file), { recursive: true })
    client = createClient({ url: `file:${file}` })
  }
  return client
}

export function initDb(): Promise<void> {
  initialization ??= initializeDb().catch((error: unknown) => {
    initialization = undefined
    throw error
  })
  return initialization
}

async function initializeDb(): Promise<void> {
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

    CREATE TABLE IF NOT EXISTS shared_wallets (
      id TEXT PRIMARY KEY,
      bote_id TEXT NOT NULL,
      member_ids TEXT NOT NULL,
      locked_recipient_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (bote_id) REFERENCES botes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_bote ON expenses(bote_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_bote ON settlements(bote_id);
    CREATE INDEX IF NOT EXISTS idx_shared_wallets_bote ON shared_wallets(bote_id);
  `)

  if (!walletSchemaMigrated) {
    const columns = await db.execute('PRAGMA table_info(shared_wallets)')
    const names = new Set(columns.rows.map((row) => String(row.name)))
    if (names.has('recipient_id') && !names.has('locked_recipient_id')) {
      await db.executeMultiple(`
        BEGIN;
        CREATE TABLE shared_wallets_migrated (
          id TEXT PRIMARY KEY,
          bote_id TEXT NOT NULL,
          member_ids TEXT NOT NULL,
          locked_recipient_id TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (bote_id) REFERENCES botes(id) ON DELETE CASCADE
        );
        INSERT INTO shared_wallets_migrated (id, bote_id, member_ids, locked_recipient_id, created_at)
          SELECT id, bote_id, member_ids,
            CASE WHEN EXISTS (
              SELECT 1 FROM settlements WHERE settlements.bote_id = shared_wallets.bote_id
            ) THEN recipient_id ELSE NULL END,
            created_at
          FROM shared_wallets;
        DROP TABLE shared_wallets;
        ALTER TABLE shared_wallets_migrated RENAME TO shared_wallets;
        CREATE INDEX idx_shared_wallets_bote ON shared_wallets(bote_id);
        COMMIT;
      `)
    }
    walletSchemaMigrated = true
  }

  // Las versiones anteriores guardaban metadatos de pareja dentro del JSON.
  if (!legacyParticipantsCleaned) {
    const rows = await db.execute('SELECT id, participants FROM botes')
    for (const row of rows.rows) {
      const participants = JSON.parse(String(row.participants)) as Record<
        string,
        unknown
      >[]
      if (
        !participants.some(
          (participant) => 'couple' in participant || 'members' in participant
        )
      )
        continue
      const cleaned = participants.map(
        ({ couple: _couple, members: _members, ...person }) => person
      )
      await db.execute({
        sql: 'UPDATE botes SET participants = ? WHERE id = ?',
        args: [JSON.stringify(cleaned), String(row.id)]
      })
    }
    legacyParticipantsCleaned = true
  }
}
