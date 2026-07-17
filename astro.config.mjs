// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

/** @typedef {{ on: (event: string, cb: (...args: any[]) => void) => void }} DevProxy */

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
      // Pair with `npm run dev:api` (wrangler) so /api/* and /media/* hit D1/R2 locally.
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8787",
          changeOrigin: true,
          configure: (/** @type {DevProxy} */ proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const host = req.headers.host;
              if (host) proxyReq.setHeader("X-Forwarded-Host", host);
              proxyReq.setHeader("X-Forwarded-Proto", "http");
            });
          },
        },
        "/media": {
          target: "http://127.0.0.1:8787",
          changeOrigin: true,
          configure: (/** @type {DevProxy} */ proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const host = req.headers.host;
              if (host) proxyReq.setHeader("X-Forwarded-Host", host);
              proxyReq.setHeader("X-Forwarded-Proto", "http");
            });
          },
        },
      },
    },
  },
});
