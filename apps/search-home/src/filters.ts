import type { Listing, FilterConfig } from './types.js'

export function applyFilters(listings: Listing[], filters: FilterConfig): Listing[] {
  return listings.filter((listing) => {
    if (filters.maxPrice != null && listing.price != null && listing.price > filters.maxPrice) {
      return false
    }
    if (filters.minSize != null && listing.size != null && listing.size < filters.minSize) {
      return false
    }
    if (filters.minRooms != null && listing.rooms != null && listing.rooms < filters.minRooms) {
      return false
    }
    return true
  })
}
