/**
 * Cloudflare Worker: assets + directory/search + auth + profile save (D1).
 */
import {
  handleAuthLogout,
  handleAuthMe,
  handleAuthRequest,
  handleAuthVerify,
  handleMeProfilePut,
  handleMeProfileSubmit,
  json,
  mapProfileRow,
} from "./worker/auth.js";

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
  return mapProfileRow(row);
}

function publicJson(data, status = 200) {
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
      `SELECT slug, name, estado, servicios, description, website, tier, featured, cover, avatar, custom_css, status, user_id
       FROM profiles
       WHERE status = 'published'
       ORDER BY name COLLATE NOCASE`,
    ).all();
    if (!results?.length) return null;
    return results.map(mapD1Row);
  } catch (err) {
    console.error("D1 load failed, falling back to mock:", err);
    return null;
  }
}

async function loadProfileFromD1(env, slug) {
  if (!env.DB) return null;
  try {
    const row = await env.DB.prepare(
      `SELECT slug, name, estado, servicios, description, website, tier, featured, cover, avatar, custom_css, status, user_id
       FROM profiles
       WHERE status = 'published' AND slug = ?
       LIMIT 1`,
    )
      .bind(slug)
      .first();
    return row ? mapD1Row(row) : null;
  } catch (err) {
    console.error("D1 profile load failed:", err);
    return null;
  }
}

async function loadFromMock(env, origin) {
  const assetRes = await env.ASSETS.fetch(new URL("/data/profiles.json", origin));
  if (!assetRes.ok) return null;
  return assetRes.json();
}

async function loadProfiles(env, origin) {
  let source = "mock";
  let profiles = await loadFromD1(env);
  if (profiles) source = "d1";
  else profiles = await loadFromMock(env, origin);
  return { source, profiles };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/auth/request") return handleAuthRequest(request, env, url);
    if (path === "/api/auth/verify") return handleAuthVerify(request, env, url);
    if (path === "/api/auth/logout") return handleAuthLogout(request, env, url);
    if (path === "/api/auth/me") return handleAuthMe(request, env);
    if (path === "/api/me/profile") {
      if (request.method === "PUT" || request.method === "PATCH") {
        return handleMeProfilePut(request, env);
      }
      return json({ ok: false, error: "Método no permitido." }, 405);
    }
    if (path === "/api/me/profile/submit") return handleMeProfileSubmit(request, env);

    if (path === "/api/search") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return publicJson({ ok: false, error: "Método no permitido." }, 405);
      }

      const query = {
        q: (url.searchParams.get("q") || "").trim(),
        servicio: parseList(url.searchParams.get("servicio")),
        estado: parseList(url.searchParams.get("estado")),
      };

      const { source, profiles } = await loadProfiles(env, url.origin);
      if (!profiles) {
        return publicJson({ ok: false, error: "No se pudo cargar el directorio." }, 503);
      }

      const results = filterProfiles(profiles, query);

      return publicJson({
        ok: true,
        source,
        total: results.length,
        query,
        results,
      });
    }

    if (path === "/api/profile") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return publicJson({ ok: false, error: "Método no permitido." }, 405);
      }

      const slug = (url.searchParams.get("slug") || "").trim();
      if (!slug) {
        return publicJson({ ok: false, error: "Falta slug." }, 400);
      }

      let source = "d1";
      let profile = await loadProfileFromD1(env, slug);
      if (!profile) {
        const { source: mockSource, profiles } = await loadProfiles(env, url.origin);
        source = mockSource;
        profile = profiles?.find((p) => p.slug === slug) || null;
      }

      if (!profile) {
        return publicJson({ ok: false, error: "Perfil no encontrado." }, 404);
      }

      return publicJson({ ok: true, source, profile });
    }

    if (path.startsWith("/api/")) {
      return json({ ok: false, error: "API aún no implementada." }, 501);
    }

    return env.ASSETS.fetch(request);
  },
};
