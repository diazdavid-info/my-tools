import initSqlJs, { type Database } from 'sql.js'
import path from 'node:path'
import fs from 'node:fs'
import type { Listing } from './types.js'

let db: Database

function persist(dbPath: string): void {
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

let resolvedDbPath: string

export async function initDb(dbPath?: string): Promise<Database> {
  resolvedDbPath = dbPath || process.env.DB_PATH || path.join(process.env.HOME || '/tmp', '.search-home', 'data.db')
  const dir = path.dirname(resolvedDbPath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const SQL = await initSqlJs()

  if (fs.existsSync(resolvedDbPath)) {
    const buffer = fs.readFileSync(resolvedDbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      externalId TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      price REAL,
      size REAL,
      rooms INTEGER,
      location TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      imageUrl TEXT,
      notified INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      UNIQUE(source, externalId)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER NOT NULL,
      price REAL,
      recordedAt TEXT NOT NULL,
      FOREIGN KEY (listingId) REFERENCES listings(id)
    )
  `)

  persist(resolvedDbPath)
  return db
}

function findExisting(source: string, externalId: string): { id: number; price: number | null } | null {
  const stmt = db.prepare('SELECT id, price FROM listings WHERE source = ? AND externalId = ?')
  stmt.bind([source, externalId])
  let result: { id: number; price: number | null } | null = null
  if (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>
    result = { id: row.id as number, price: row.price as number | null }
  }
  stmt.free()
  return result
}

export function insertListings(listings: Listing[]): { inserted: number; updated: number } {
  let inserted = 0
  let updated = 0

  for (const l of listings) {
    const existing = findExisting(l.source, l.externalId)

    if (existing) {
      // Price changed — record history and update
      if (l.price != null && existing.price != null && l.price !== existing.price) {
        db.run('INSERT INTO price_history (listingId, price, recordedAt) VALUES (?, ?, ?)', [existing.id, existing.price, new Date().toISOString()])
        db.run('UPDATE listings SET price = ?, notified = 0 WHERE id = ?', [l.price, existing.id])
        updated++
      }
    } else {
      // New listing — insert
      db.run(
        'INSERT OR IGNORE INTO listings (source, externalId, url, title, price, size, rooms, location, description, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [l.source, l.externalId, l.url, l.title, l.price, l.size, l.rooms, l.location, l.description, l.imageUrl, l.createdAt],
      )
      if (db.getRowsModified() > 0) inserted++
    }
  }

  persist(resolvedDbPath)
  return { inserted, updated }
}

export function getNewListings(): Listing[] {
  const stmt = db.prepare('SELECT * FROM listings WHERE notified = 0 ORDER BY createdAt DESC')
  const listings: Listing[] = []

  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>
    const listingId = row.id as number

    // Check if there's a previous price in history
    let previousPrice: number | null = null
    const histStmt = db.prepare('SELECT price FROM price_history WHERE listingId = ? ORDER BY recordedAt DESC LIMIT 1')
    histStmt.bind([listingId])
    if (histStmt.step()) {
      const histRow = histStmt.getAsObject() as Record<string, unknown>
      previousPrice = histRow.price as number | null
    }
    histStmt.free()

    listings.push({
      id: listingId,
      source: row.source as string,
      externalId: row.externalId as string,
      url: row.url as string,
      title: row.title as string,
      price: row.price as number | null,
      size: row.size as number | null,
      rooms: row.rooms as number | null,
      location: row.location as string,
      description: row.description as string,
      imageUrl: row.imageUrl as string | null,
      createdAt: row.createdAt as string,
      previousPrice,
    })
  }

  stmt.free()
  return listings
}

export function markAsNotified(ids: number[]): void {
  if (ids.length === 0) return
  const placeholders = ids.map(() => '?').join(',')
  db.run(`UPDATE listings SET notified = 1 WHERE id IN (${placeholders})`, ids)
  persist(resolvedDbPath)
}

export function closeDb(): void {
  if (db) {
    persist(resolvedDbPath)
    db.close()
  }
}
