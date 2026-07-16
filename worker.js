/**
 * Cloudflare Worker: static assets + mock /api/search (D1 later).
 *
 * Most requests → env.ASSETS (Astro `dist/`).
 * /api/search reads public/data/profiles.json from assets and filters in-memory.
 */

function parseList(param) {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function filterProfiles(profiles, query) {
  const q = query.q.toLowerCase();
  const servicios = new Set(query.servicio);
  const estados = new Set(query.estado);

  return profiles.filter((p) => {
    if (q) {
      const hay = `${p.name} ${p.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (servicios.size && ![...servicios].some((s) => p.servicios.includes(s))) {
      return false;
    }
    if (estados.size && !estados.has(p.estado)) return false;
    return true;
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/search") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ ok: false, error: "Método no permitido." }, 405);
      }

      const assetRes = await env.ASSETS.fetch(new URL("/data/profiles.json", url.origin));
      if (!assetRes.ok) {
        return json({ ok: false, error: "No se pudo cargar el directorio mock." }, 503);
      }

      const profiles = await assetRes.json();
      const query = {
        q: (url.searchParams.get("q") || "").trim(),
        servicio: parseList(url.searchParams.get("servicio")),
        estado: parseList(url.searchParams.get("estado")),
      };
      const results = filterProfiles(profiles, query);

      return json({
        ok: true,
        source: "mock",
        total: results.length,
        query,
        results,
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ ok: false, error: "API aún no implementada." }, 501);
    }

    return env.ASSETS.fetch(request);
  },
};
