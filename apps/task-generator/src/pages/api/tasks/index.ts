import type {APIRoute} from "astro";
import {getSession} from "auth-astro/server.ts";

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if(!session) return Response.json({}, {status: 401})

  // @ts-ignore
  const site = session?.site;
  const {id, accessToken, url} = site

  const { id: taskId, epic, type, dev, project, points, content, title } = await request.json()

  const body = {
    fields: {
      summary: title,
      parent: { key: epic },
      issuetype: { id: type },
      customfield_10030: { id: dev },
      project: { id: project },
      customfield_10026: points,
      description: {
        type: 'doc',
        version: 1,
        content: JSON.parse(content)
      }
    }
  }

  const data = await fetch(`https://api.atlassian.com/ex/jira/${id}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const {key} = await data.json()

  return new Response(JSON.stringify({
    id: taskId,
    key,
    url: `${url}/browse/${key}`
  }))
}
