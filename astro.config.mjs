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
    server: {
      // Pair with `npm run dev:api` (wrangler) so /api/* hits D1 locally.
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8787",
          changeOrigin: true,
        },
      },
    },
  },
});
