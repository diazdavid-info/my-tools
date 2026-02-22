import * as cheerio from 'cheerio'
import type { Listing, ScraperConfig } from '../types.js'

function parse(html: string, url: string): Listing[] {
  const $ = cheerio.load(html)
  const listings: Listing[] = []
  const now = new Date().toISOString()

  $('.ad-preview[data-lnk-href*="/alquilar/"]:not(.js-similarAd)').each((_, el) => {
    const $card = $(el)
    const href = $card.attr('data-lnk-href') || ''

    const idMatch = href.match(/(\d+_\d+)/)
    const externalId = idMatch?.[1]
    if (!externalId) return

    const title = $card.find('.ad-preview__title').text().trim()
    const location = $card.find('.ad-preview__subtitle').text().trim()

    const priceText = $card.find('.ad-preview__price').first().clone().children().remove().end().text().replace(/[^\d]/g, '')
    const price = priceText ? parseInt(priceText, 10) : null

    let rooms: number | null = null
    let size: number | null = null

    $card.find('.ad-preview__char').each((_, char) => {
      const text = $(char).text().trim()
      const roomMatch = text.match(/(\d+)\s*hab/)
      if (roomMatch) rooms = parseInt(roomMatch[1], 10)
      const sizeMatch = text.match(/(\d+)\s*m/)
      if (sizeMatch) size = parseInt(sizeMatch[1], 10)
    })

    const fullUrl = `https://www.pisos.com${href}`

    listings.push({
      source: 'pisos.com',
      externalId,
      url: fullUrl,
      title: title || 'Sin título',
      price,
      size,
      rooms,
      location,
      description: $card.find('.ad-preview__description').text().trim(),
      imageUrl: null,
      createdAt: now,
    })
  })

  return listings
}

export function createPisosConfig(urls: string[]): ScraperConfig {
  return { name: 'pisos.com', urls, parse }
}
