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

  persist(resolvedDbPath)
  return db
}

export function insertListings(listings: Listing[]): number {
  let inserted = 0

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO listings (source, externalId, url, title, price, size, rooms, location, description, imageUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const l of listings) {
    stmt.run([l.source, l.externalId, l.url, l.title, l.price, l.size, l.rooms, l.location, l.description, l.imageUrl, l.createdAt])
    if (db.getRowsModified() > 0) inserted++
  }

  stmt.free()
  persist(resolvedDbPath)
  return inserted
}

export function getNewListings(): Listing[] {
  const stmt = db.prepare('SELECT * FROM listings WHERE notified = 0 ORDER BY createdAt DESC')
  const listings: Listing[] = []

  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>
    listings.push({
      id: row.id as number,
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
