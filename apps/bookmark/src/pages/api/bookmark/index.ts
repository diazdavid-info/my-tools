import type { APIRoute } from "astro";
import ogs from "open-graph-scraper";

export const POST: APIRoute = async ({ request }) => {
  const { url } = await request.json();

  const options = { url };

  const { result, error } = await ogs(options);
  if (!error) console.log(result);

  return new Response(
    JSON.stringify({
      name: "Astro",
      url: "https://astro.build/",
    }),
  );
};

// id, url, title?, description?, image?
