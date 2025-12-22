import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import auth from "auth-astro";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), auth()],
  output: "server",
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
  },
});
