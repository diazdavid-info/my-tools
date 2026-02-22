import { chromium, type Browser } from 'playwright'
import type { ScraperConfig, Listing } from './types.js'

let browser: Browser | null = null

export async function launchBrowser(): Promise<void> {
  browser = await chromium.launch({ headless: true })
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}

export async function scrape(config: ScraperConfig): Promise<Listing[]> {
  if (!browser) throw new Error('Browser not launched. Call launchBrowser() first.')

  const allListings: Listing[] = []

  for (const url of config.urls) {
    try {
      console.log(`[${config.name}] Navigating to ${url}`)
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'es-ES',
      })
      const page = await context.newPage()

      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })

      // Accept cookies if a consent dialog appears
      try {
        const cookieBtn = page.locator('#didomi-notice-agree-button, button:has-text("Aceptar"), button:has-text("Acepto"), button:has-text("Accept")')
        await cookieBtn.first().click({ timeout: 3_000 })
        await page.waitForTimeout(1_000)
      } catch {
        // No cookie dialog
      }

      // Scroll down progressively to trigger lazy-loaded listings
      for (let i = 0; i < 15; i++) {
        await page.evaluate('window.scrollBy(0, window.innerHeight)')
        await page.waitForTimeout(1_500)
      }

      const html = await page.content()
      const listings = config.parse(html, url)
      console.log(`[${config.name}] Found ${listings.length} listings from ${url}`)
      allListings.push(...listings)

      await context.close()
    } catch (err) {
      console.error(`[${config.name}] Error scraping ${url}:`, err)
    }

    // Delay between requests to the same source
    await new Promise((r) => setTimeout(r, 2_000 + Math.random() * 3_000))
  }

  return allListings
}
