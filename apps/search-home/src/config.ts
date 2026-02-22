import { createFotocasaConfig } from './scrapers/fotocasa.js'
import { createPisosConfig } from './scrapers/pisos.js'
import type { ScraperConfig, FilterConfig } from './types.js'

export const scrapers: ScraperConfig[] = [
  createFotocasaConfig([
    'https://www.fotocasa.es/es/alquiler/viviendas/torrejon-de-ardoz/todas-las-zonas/l',
  ]),
  createPisosConfig([
    'https://www.pisos.com/alquiler/pisos-torrejon_de_ardoz/',
  ]),
]

export const filters: FilterConfig = {
  maxPrice: undefined,
  minSize: undefined,
  minRooms: undefined,
}
