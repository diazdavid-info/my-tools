import { getSession as getSessionAuth } from 'auth-astro/server'

export const getSession = async (req: Request) => {
  return getSessionAuth(req)
}
