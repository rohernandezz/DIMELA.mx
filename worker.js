/**
 * Cloudflare Worker: static assets + /api/search (D1 when bound, else mock JSON).
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
    if (servicios.size && ![...servicios].some((s) => (p.servicios || []).includes(s))) {
      return false;
    }
    if (estados.size && !estados.has(p.estado)) return false;
    return true;
  });
}

function mapD1Row(row) {
  let servicios = [];
  try {
    servicios = JSON.parse(row.servicios || "[]");
  } catch {
    servicios = [];
  }
  return {
    slug: row.slug,
    name: row.name,
    estado: row.estado,
    servicios,
    description: row.description || "",
    website: row.website || undefined,
    tier: row.tier,
    featured: Boolean(row.featured),
    cover: row.cover,
    avatar: row.avatar,
  };
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

async function loadFromD1(env) {
  if (!env.DB) return null;
  try {
    const { results } = await env.DB.prepare(
      `SELECT slug, name, estado, servicios, description, website, tier, featured, cover, avatar
       FROM profiles
       WHERE status = 'published'
       ORDER BY name COLLATE NOCASE`,
    ).all();
    if (!results?.length) return null;
    return results.map(mapD1Row);
  } catch (err) {
    console.error("D1 search load failed, falling back to mock:", err);
    return null;
  }
}

async function loadFromMock(env, origin) {
  const assetRes = await env.ASSETS.fetch(new URL("/data/profiles.json", origin));
  if (!assetRes.ok) return null;
  return assetRes.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/search") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ ok: false, error: "Método no permitido." }, 405);
      }

      const query = {
        q: (url.searchParams.get("q") || "").trim(),
        servicio: parseList(url.searchParams.get("servicio")),
        estado: parseList(url.searchParams.get("estado")),
      };

      let source = "mock";
      let profiles = await loadFromD1(env);
      if (profiles) {
        source = "d1";
      } else {
        profiles = await loadFromMock(env, url.origin);
      }

      if (!profiles) {
        return json({ ok: false, error: "No se pudo cargar el directorio." }, 503);
      }

      const results = filterProfiles(profiles, query);

      return json({
        ok: true,
        source,
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
