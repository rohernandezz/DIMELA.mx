// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static site: Astro builds into dist/.
// Cloudflare Worker serves that folder (see wrangler.toml).
export default defineConfig({
  site: "https://dimela.mx",
  output: "static",
  redirects: {
    "/bar": "/",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
