import { getSession } from 'auth-astro/server'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ params, request }) => {
  const session = await getSession(request)
  if (!session) return Response.json({}, { status: 401 })

  const { id: taskId } = params
  // @ts-ignore
  const site = session?.site
  const { id, accessToken } = site

  const data = await fetch(
    `https://api.atlassian.com/ex/jira/${id}/rest/api/3/issue/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    }
  )

  const json = await data.json()

  return new Response(JSON.stringify(json))
}
