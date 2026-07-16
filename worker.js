/**
 * Cloudflare Worker: assets + directory/search + auth + profile save (D1) + R2 media.
 */
import {
  getSessionUser,
  handleAuthLogout,
  handleAuthMe,
  handleAuthRequest,
  handleAuthVerify,
  handleMeProfilePut,
  handleMeProfileSubmit,
  json,
  mapProfileRow,
} from "./worker/auth.js";
import { handleAdminDecide, handleAdminQueue } from "./worker/admin.js";
import { handleMeProfileUpload, handleMediaGet, handleMediaQuotaGet } from "./worker/media.js";

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

async function loadProfileFromD1(env, slug, { publishedOnly = true } = {}) {
  if (!env.DB) return null;
  try {
    const row = await env.DB.prepare(
      `SELECT slug, name, estado, servicios, description, website, tier, featured, cover, avatar, custom_css, status, user_id
       FROM profiles
       WHERE ${publishedOnly ? "status = 'published' AND " : ""}slug = ?
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

async function canPreviewProfile(env, request, profile) {
  const user = await getSessionUser(env, request);
  if (!user || !profile) return false;
  if (user.role === "admin") return true;
  return Boolean(profile.userId && profile.userId === user.id);
}

/** Serve static assets; rewrite missing /directorio/{slug}/ to the client shell when visible. */
async function serveAssets(request, env, url) {
  const assetRes = await env.ASSETS.fetch(request);
  if (assetRes.status !== 404) return assetRes;

  const m = url.pathname.match(/^\/directorio\/([^/]+)\/?$/);
  const slug = m?.[1] ? decodeURIComponent(m[1]) : "";
  if (!slug || slug === "ver") return assetRes;

  // Only rewrite when the profile is public or the session may preview it.
  let visible = await loadProfileFromD1(env, slug);
  if (!visible) {
    const { profiles } = await loadProfiles(env, url.origin);
    visible = profiles?.find((p) => p.slug === slug) || null;
  }
  if (!visible) {
    const draft = await loadProfileFromD1(env, slug, { publishedOnly: false });
    if (draft && draft.status !== "published" && (await canPreviewProfile(env, request, draft))) {
      visible = draft;
    }
  }
  if (!visible) return assetRes;

  const shellUrl = new URL("/directorio/ver/", url.origin);
  const shellRes = await env.ASSETS.fetch(new Request(shellUrl, request));
  if (!shellRes.ok) return assetRes;

  return new Response(shellRes.body, {
    status: 200,
    headers: shellRes.headers,
  });
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
    if (path === "/api/me/profile/upload") return handleMeProfileUpload(request, env, url);
    if (path === "/api/me/media/quota") return handleMediaQuotaGet(request, env);
    if (path.startsWith("/media/")) return handleMediaGet(request, env, url);
    if (path === "/api/admin/queue") return handleAdminQueue(request, env);
    if (path.startsWith("/api/admin/profiles/") && (path.endsWith("/approve") || path.endsWith("/reject"))) {
      return handleAdminDecide(request, env, url);
    }

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
      let preview = false;

      if (!profile) {
        const { source: mockSource, profiles } = await loadProfiles(env, url.origin);
        source = mockSource;
        profile = profiles?.find((p) => p.slug === slug) || null;
      }

      // Owner/admin preview of draft|pending_review|rejected (not listed publicly).
      if (!profile) {
        const draft = await loadProfileFromD1(env, slug, { publishedOnly: false });
        if (draft && draft.status !== "published" && (await canPreviewProfile(env, request, draft))) {
          profile = draft;
          source = "d1";
          preview = true;
        }
      }

      if (!profile) {
        return publicJson({ ok: false, error: "Perfil no encontrado." }, 404);
      }

      if (preview) {
        return json({ ok: true, source, profile, preview: true });
      }

      return publicJson({ ok: true, source, profile });
    }

    if (path.startsWith("/api/")) {
      return json({ ok: false, error: "API aún no implementada." }, 501);
    }

    return serveAssets(request, env, url);
  },
};
