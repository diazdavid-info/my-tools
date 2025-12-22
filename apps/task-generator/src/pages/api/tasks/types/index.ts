import type { APIRoute } from 'astro'
import { getSession } from 'auth-astro/server.ts'

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request)
  if (!session) return Response.json([], { status: 401 })

  const searchParams = new URL(request.url).searchParams
  const projectId = searchParams.get('projectId')

  // @ts-ignore
  const site = session?.site
  const { id, accessToken } = site

  const data = await fetch(
    `https://api.atlassian.com/ex/jira/${id}/rest/api/3/issuetype/project?projectId=${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    }
  )

  if (!data.ok) return new Response(JSON.stringify([]), { status: 401 })

  const json = await data.json()

  const fieldValues = json.map(
    ({ id, name }: { id: string; name: string }) => ({
      key: id,
      value: name
    })
  )

  return new Response(JSON.stringify(fieldValues))
}
