import * as cheerio from 'cheerio'
import type { Listing, ScraperConfig } from '../types.js'

function parse(html: string, url: string): Listing[] {
  const $ = cheerio.load(html)
  const listings: Listing[] = []
  const now = new Date().toISOString()
  const seen = new Set<string>()

  // Extract city slug from the source URL to filter out "nearby" listings from other cities
  const citySlug = url.match(/\/viviendas\/([^/]+)\//)?.[1] ?? ''

  // Each listing title lives inside an h3 > a[link-box-link]
  $('h3 a[data-panot-component="link-box-link"][href*="/es/alquiler/vivienda/"]').each((_, el) => {
    const $link = $(el)
    const href = $link.attr('href') || ''

    // Skip listings from other cities (e.g. "pisos cercanos" section)
    if (citySlug && !href.includes(`/${citySlug}/`)) return

    const idMatch = href.match(/\/(\d+)\/d/)
    const externalId = idMatch?.[1]
    if (!externalId || seen.has(externalId)) return
    seen.add(externalId)

    const title = $link.text().trim().replace(/\s+/g, ' ')
    if (!title) return

    // Navigate up to the link-box container to find price and details
    const $card = $link.closest('[data-panot-component="link-box"]')

    // Price is in the first .text-display-3 > span, formatted like "1.300 €"
    const priceRaw = $card.find('.text-display-3 > span').first().clone().children().remove().end().text()
    const priceMatch = priceRaw.match(/([\d.]+)\s*€/)
    const price = priceMatch ? parseInt(priceMatch[1].replace(/\./g, ''), 10) : null

    let rooms: number | null = null
    let size: number | null = null

    $card.find('ul li').each((_, li) => {
      const text = $(li).text().trim()
      const roomMatch = text.match(/(\d+)\s*hab/)
      if (roomMatch) rooms = parseInt(roomMatch[1], 10)
      const sizeMatch = text.match(/(\d+)\s*m²/)
      if (sizeMatch) size = parseInt(sizeMatch[1], 10)
    })

    const fullUrl = `https://www.fotocasa.es${href.split('?')[0]}`

    // Image: walk up to the article/section wrapper that contains both image and details
    const $wrapper = $card.parent()
    const imageUrl = $wrapper.find('img[src*="fotocasa"], img[src*="static"]').first().attr('src')
      || $wrapper.find('img').first().attr('src')
      || null

    listings.push({
      source: 'fotocasa',
      externalId,
      url: fullUrl,
      title,
      price,
      size,
      rooms,
      location: '',
      description: '',
      imageUrl,
      createdAt: now,
    })
  })

  return listings
}

export function createFotocasaConfig(urls: string[]): ScraperConfig {
  return { name: 'fotocasa', urls, parse }
}
