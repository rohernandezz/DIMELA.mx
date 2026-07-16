/**
 * Cloudflare Worker: static assets (+ API stubs for later).
 *
 * Most requests → env.ASSETS (Astro `dist/`).
 * Future: /api/search, /api/auth, Stripe webhooks, etc.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Placeholder so /api/* is reserved for the Worker
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ ok: false, error: "API aún no implementada." }), {
        status: 501,
        headers: { "Content-Type": "application/json" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
