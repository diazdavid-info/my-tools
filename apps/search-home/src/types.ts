export interface Listing {
  id?: number
  source: string
  externalId: string
  url: string
  title: string
  price: number | null
  size: number | null
  rooms: number | null
  location: string
  description: string
  imageUrl: string | null
  createdAt: string
  previousPrice?: number | null
}

export interface ScraperConfig {
  name: string
  urls: string[]
  parse: (html: string, url: string) => Listing[]
}

export interface FilterConfig {
  maxPrice?: number
  minSize?: number
  minRooms?: number
}
