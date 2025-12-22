import type { APIRoute } from 'astro'
import { getSession } from 'auth-astro/server.ts'

export const GET: APIRoute = async ({ params, request }) => {
  const session = await getSession(request)
  if (!session) return Response.json([], { status: 401 })

  // @ts-ignore
  const site = session?.site
  const { id, accessToken } = site

  const { fieldId } = params
  const contextId = 10129

  const data = await fetch(
    `https://api.atlassian.com/ex/jira/${id}/rest/api/3/field/${fieldId}/context/${contextId}/option`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    }
  )

  if (!data.ok) return new Response(JSON.stringify([]), { status: 401 })

  const json = await data.json()
  const { values } = json

  const fieldValues = values.map(
    ({ id, value }: { id: string; value: string }) => ({
      key: id,
      value: value
    })
  )

  return new Response(JSON.stringify(fieldValues))
}
