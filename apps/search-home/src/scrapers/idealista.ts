import * as cheerio from 'cheerio'
import type { Listing, ScraperConfig } from '../types.js'

function parse(html: string, url: string): Listing[] {
  const $ = cheerio.load(html)
  const listings: Listing[] = []
  const now = new Date().toISOString()

  $('article.item').each((_, el) => {
    const $el = $(el)
    const linkEl = $el.find('a.item-link')
    const href = linkEl.attr('href') || ''
    const title = linkEl.attr('title') || $el.find('.item-link').text().trim()

    const externalId = href.match(/\/inmueble\/(\d+)\//)?.[1] || href.replace(/\//g, '_')
    if (!externalId) return

    const priceText = $el.find('.item-price').text().replace(/[^\d]/g, '')
    const price = priceText ? parseInt(priceText, 10) : null

    const detailNodes = $el.find('.item-detail')
    let rooms: number | null = null
    let size: number | null = null

    detailNodes.each((_, detail) => {
      const text = $(detail).text().trim()
      const roomMatch = text.match(/(\d+)\s*hab/)
      if (roomMatch) rooms = parseInt(roomMatch[1], 10)
      const sizeMatch = text.match(/(\d+)\s*m/)
      if (sizeMatch) size = parseInt(sizeMatch[1], 10)
    })

    const location = $el.find('.item-detail-char .item-description').text().trim()
      || $el.find('.item-location').text().trim()
    const description = $el.find('.item-description p').text().trim()
    const imageUrl = $el.find('img').attr('src') || $el.find('img').attr('data-src') || null

    const fullUrl = href.startsWith('http') ? href : `https://www.idealista.com${href}`

    listings.push({
      source: 'idealista',
      externalId,
      url: fullUrl,
      title: title || 'Sin título',
      price,
      size,
      rooms,
      location,
      description,
      imageUrl,
      createdAt: now,
    })
  })

  return listings
}

export function createIdealistaConfig(urls: string[]): ScraperConfig {
  return { name: 'idealista', urls, parse }
}
