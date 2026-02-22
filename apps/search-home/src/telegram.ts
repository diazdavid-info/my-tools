import type { Listing } from './types.js'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatListing(listing: Listing): string {
  const lines: string[] = []

  // Details line: size | rooms | price
  const details: string[] = []
  if (listing.size != null) details.push(`${listing.size} m\u00b2`)
  if (listing.rooms != null) details.push(`${listing.rooms} hab.`)
  if (listing.price != null) details.push(`${listing.price.toLocaleString('es-ES')} \u20ac/mes`)
  if (details.length > 0) lines.push(`<b>${details.join('  \u00b7  ')}</b>`)

  // Title
  lines.push('')
  lines.push(escapeHtml(listing.title))

  // Location
  if (listing.location) {
    lines.push(`\ud83d\udccd ${escapeHtml(listing.location)}`)
  }

  // Link
  lines.push('')
  lines.push(`\ud83d\udd17 <a href="${listing.url}">Ver en ${listing.source}</a>`)

  return lines.join('\n')
}

export async function sendListings(listings: Listing[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping notification')
    return
  }

  for (const listing of listings) {
    const text = formatListing(listing)

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[telegram] sendMessage failed: ${res.status} ${body}`)
    }

    // Rate limiting between messages
    await new Promise((r) => setTimeout(r, 300))
  }
}
