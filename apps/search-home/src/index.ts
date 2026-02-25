#!/usr/bin/env node

import { initDb, insertListings, getNewListings, markAsNotified, markUnavailableListings, closeDb } from './db.js'
import { scrape, launchBrowser, closeBrowser } from './scraper.js'
import { applyFilters } from './filters.js'
import { sendListings } from './telegram.js'
import { scrapers, filters } from './config.js'

const INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES || '30', 10)

function log(msg: string): void {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

async function cycle(): Promise<void> {
  log('Starting scrape cycle...')

  let unavailableListings: import('./types.js').Listing[] = []

  for (const config of scrapers) {
    try {
      const listings = await scrape(config)
      if (listings.length > 0) {
        const { inserted, updated } = insertListings(listings)
        log(`[${config.name}] ${inserted} new, ${updated} price updates (${listings.length} scraped)`)

        // Detect listings that disappeared from this source
        const gone = markUnavailableListings(config.name, listings.map((l) => l.externalId))
        if (gone.length > 0) {
          log(`[${config.name}] ${gone.length} listings no longer available`)
          unavailableListings = unavailableListings.concat(gone)
        }
      } else {
        log(`[${config.name}] No listings found`)
      }
    } catch (err) {
      log(`[${config.name}] Scrape error: ${err}`)
    }
  }

  const newListings = getNewListings()
  const filtered = applyFilters(newListings, filters)

  if (filtered.length > 0) {
    log(`${filtered.length} new listings:`)
    for (const l of filtered) {
      const price = l.price != null ? `${l.price.toLocaleString('es-ES')} €` : 'N/A'
      const size = l.size != null ? `${l.size} m²` : ''
      const rooms = l.rooms != null ? `${l.rooms} hab` : ''
      const details = [price, size, rooms].filter(Boolean).join(' | ')
      console.log(`  [${l.source}] ${l.title}`)
      console.log(`    ${details}`)
      if (l.location) console.log(`    ${l.location}`)
      console.log(`    ${l.url}`)
      console.log()
    }

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      log(`Sending ${filtered.length} listings via Telegram...`)
      await sendListings(filtered)
      markAsNotified(filtered.map((l) => l.id!))
    }
  } else {
    log('No new listings to notify')
  }

  // Notify unavailable listings
  if (unavailableListings.length > 0 && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    log(`Sending ${unavailableListings.length} unavailable listings via Telegram...`)
    await sendListings(unavailableListings)
  }
}

async function main(): Promise<void> {
  if (process.argv.includes('--help')) {
    console.log(`search-home — scrape housing listings, store in SQLite, notify via Telegram

Usage: search-home

Environment variables:
  TELEGRAM_BOT_TOKEN   Telegram bot API token (required for notifications)
  TELEGRAM_CHAT_ID     Telegram chat ID to send messages to (required for notifications)
  INTERVAL_MINUTES     Minutes between scrape cycles (default: 30)
  DB_PATH              Path to SQLite database file (default: ~/.search-home/data.db)

The process runs in a loop, scraping configured URLs every INTERVAL_MINUTES.
Press Ctrl+C to stop.`)
    process.exit(0)
  }

  log('Initializing database...')
  await initDb()

  log('Launching browser...')
  await launchBrowser()

  const shutdown = async () => {
    log('Shutting down...')
    await closeBrowser()
    closeDb()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  log(`Running every ${INTERVAL_MINUTES} minutes. Press Ctrl+C to stop.`)

  // Run first cycle immediately
  await cycle()

  // Then loop
  setInterval(cycle, INTERVAL_MINUTES * 60 * 1000)
}

main().catch(async (err) => {
  console.error('Fatal error:', err)
  await closeBrowser()
  closeDb()
  process.exit(1)
})
