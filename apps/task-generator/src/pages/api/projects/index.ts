import { getSession } from "auth-astro/server";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);
  if (!session) return Response.json({}, { status: 401 });

  // @ts-ignore
  const site = session?.site;
  const { id, accessToken } = site;

  const data = await fetch(
    `https://api.atlassian.com/ex/jira/${id}/rest/api/3/project`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!data.ok) return new Response(JSON.stringify({ ok: false }), { status: 401 });

  const json = await data.json();

  const projectJira = json.map(({ id, key, name }: {id: string, key: string, name: string}) => ({
    key: id,
    value: `${name} (${key})`,
  }));

  return new Response(JSON.stringify(projectJira));
};
