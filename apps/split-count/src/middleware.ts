import { defineMiddleware } from 'astro:middleware'
import { initDb } from './server/db'

export const onRequest = defineMiddleware(async (_context, next) => {
  await initDb()
  return next()
})
