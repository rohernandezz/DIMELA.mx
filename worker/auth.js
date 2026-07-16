/**
 * Magic-link auth + session helpers (D1).
 */

import { slugFromName, uniqueProfileSlug } from "./slugs.js";
import { sanitizeCustomCss } from "./customCss.js";
import { sendMagicLinkEmail } from "./email.js";
import { DEMO_ACCOUNTS } from "../shared/demoAccounts.js";
import { markProfileDraftForEdit } from "./publications.js";
import { normalizeProfileTags } from "./tags.js";
import { normalizeServicios } from "./taxonomy.js";

export { DEMO_ACCOUNTS };

const SESSION_COOKIE = "dm_session";
const SESSION_DAYS = 14;
const MAGIC_MINUTES = 30;

function isLocalDevHost(url) {
  const h = url.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".localhost");
}

/** Expose magic link in JSON for local dev or when explicitly enabled. */
export function exposeMagicLinkInResponse(env, url) {
  if (isLocalDevHost(url)) return true;
  return env.DEV_MAGIC_LINKS === "true" || env.DEV_MAGIC_LINKS === "1";
}

async function ownedProfileRow(env, userId) {
  return env.DB.prepare(`SELECT slug FROM profiles WHERE user_id = ? LIMIT 1`).bind(userId).first();
}

export async function listClaimableProfiles(env, user) {
  if (!env.DB || !user?.email) return [];
  const owned = await ownedProfileRow(env, user.id);
  if (owned) return [];

  const { results } = await env.DB.prepare(
    `SELECT slug, name, estado, status
     FROM profiles
     WHERE user_id IS NULL
       AND invite_email IS NOT NULL
       AND invite_email = ?
     ORDER BY name COLLATE NOCASE`,
  )
    .bind(normalizeEmail(user.email))
    .all();

  return (results || []).map((row) => ({
    slug: row.slug,
    name: row.name,
    estado: row.estado,
    status: row.status,
  }));
}

async function claimProfile(env, user, slug) {
  const email = normalizeEmail(user.email);
  const profile = await env.DB.prepare(
    `SELECT slug, user_id, invite_email FROM profiles WHERE slug = ? LIMIT 1`,
  )
    .bind(slug)
    .first();

  if (!profile) return { ok: false, error: "Perfil no encontrado." };
  if (profile.user_id) return { ok: false, error: "Este perfil ya tiene dueño." };
  if (!profile.invite_email || normalizeEmail(profile.invite_email) !== email) {
    return { ok: false, error: "Este perfil no está disponible para reclamar con tu correo." };
  }

  const owned = await ownedProfileRow(env, user.id);
  if (owned) return { ok: false, error: "Ya tienes un perfil vinculado." };

  await env.DB.prepare(
    `UPDATE profiles SET user_id = ?, invite_email = NULL, updated_at = datetime('now') WHERE slug = ?`,
  )
    .bind(user.id, slug)
    .run();

  return { ok: true, slug };
}

async function autoClaimSingleProfile(env, user) {
  const claimable = await listClaimableProfiles(env, user);
  if (claimable.length !== 1) return null;
  const result = await claimProfile(env, user, claimable[0].slug);
  return result.ok ? claimable[0].slug : null;
}

async function resolvePostLoginPath(env, user, requestedNext, publicOrigin) {
  const owned = await ownedProfileRow(env, user.id);
  if (owned) {
    const next = requestedNext || "/editar/";
    const url = new URL(next, publicOrigin);
    return url.pathname + url.search;
  }

  const autoSlug = await autoClaimSingleProfile(env, user);
  if (autoSlug) {
    return `/editar/?claimed=${encodeURIComponent(autoSlug)}`;
  }

  const claimable = await listClaimableProfiles(env, user);
  if (claimable.length > 0) {
    return "/cuenta/?step=claim";
  }

  const next = requestedNext || "/cuenta/?step=create";
  const url = new URL(next, publicOrigin);
  return url.pathname + url.search;
}

/** Beta one-click login: localhost always; remote needs BETA_LOGIN (+ optional BETA_LOGIN_SECRET). */
export function betaLoginAllowed(env, url, secret) {
  if (isLocalDevHost(url)) return true;
  const enabled = env.BETA_LOGIN === "true" || env.BETA_LOGIN === "1";
  if (!enabled) return false;
  const expected = env.BETA_LOGIN_SECRET;
  if (!expected) return true;
  return String(secret || "") === expected;
}

async function createSessionForUser(env, user) {
  const sessionToken = randomToken();
  await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`)
    .bind(sessionToken, user.id, isoInDays(SESSION_DAYS))
    .run();
  return sessionToken;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function cookieSecure(url) {
  return url.protocol === "https:";
}

/** Browser-facing origin (respects Vite/Astro proxy headers in local dev). */
export function requestPublicOrigin(request, url) {
  const forwardedHost = request.headers.get("X-Forwarded-Host");
  if (forwardedHost) {
    const proto = request.headers.get("X-Forwarded-Proto") || "http";
    return `${proto}://${forwardedHost}`;
  }
  return url.origin;
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

export function sessionCookie(token, requestUrl, maxAgeSec = SESSION_DAYS * 86400) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (cookieSecure(requestUrl)) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(requestUrl) {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (cookieSecure(requestUrl)) parts.push("Secure");
  return parts.join("; ");
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

function isoInMinutes(mins) {
  return new Date(Date.now() + mins * 60_000).toISOString();
}

function isoInDays(days) {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getSessionUser(env, request) {
  if (!env.DB) return null;
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')
     LIMIT 1`,
  )
    .bind(token)
    .first();

  return row || null;
}

export async function handleAuthRequest(request, env, url) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON inválido." }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Email inválido." }, 400);
  }

  const recent = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM magic_links
     WHERE email = ? AND expires_at > datetime('now')`,
  )
    .bind(email)
    .first();
  if ((recent?.c || 0) >= 5) {
    return json({ ok: false, error: "Demasiados enlaces activos. Espera un momento." }, 429);
  }

  const token = randomToken();
  const expiresAt = isoInMinutes(MAGIC_MINUTES);

  await env.DB.prepare(
    `INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)`,
  )
    .bind(token, email, expiresAt)
    .run();

  const publicOrigin = requestPublicOrigin(request, url);
  const verifyUrl = new URL("/api/auth/verify", publicOrigin);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("next", body.next || "/cuenta/");

  const verifyUrlString = verifyUrl.toString();
  const emailResult = await sendMagicLinkEmail(env, { to: email, verifyUrl: verifyUrlString });

  // Production email needs Workers Paid + Email Sending. Until then, fall back to
  // returning the link in JSON (beta / local). Set FORCE_EMAIL_ONLY=true to require email.
  const forceEmailOnly = env.FORCE_EMAIL_ONLY === "true" || env.FORCE_EMAIL_ONLY === "1";
  if (!emailResult.sent && forceEmailOnly) {
    console.error(`Magic link email not sent for ${email}:`, emailResult.reason || "unknown");
    return json(
      {
        ok: false,
        error:
          "Correo no configurado en el servidor. Contacta a hola@dimela.mx para acceder.",
      },
      503,
    );
  }

  if (!emailResult.sent) {
    console.log(`Magic link for ${email}: ${verifyUrlString}`);
  }

  const showLink = !emailResult.sent || exposeMagicLinkInResponse(env, url);
  const payload = {
    ok: true,
    message: emailResult.sent
      ? "Revisa tu correo — te enviamos un enlace para entrar."
      : "Enlace listo (beta — correo aún no activo).",
    expiresMinutes: MAGIC_MINUTES,
    emailSent: Boolean(emailResult.sent),
  };

  if (showLink) {
    payload.verifyUrl = verifyUrlString;
    payload.verifyPath = `${verifyUrl.pathname}${verifyUrl.search}`;
  }

  return json(payload);
}

export async function handleAuthVerify(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const token = (url.searchParams.get("token") || "").trim();
  const requestedNext = url.searchParams.get("next") || "/cuenta/";
  if (!token) return json({ ok: false, error: "Falta token." }, 400);

  const link = await env.DB.prepare(
    `SELECT token, email, expires_at, used_at FROM magic_links WHERE token = ? LIMIT 1`,
  )
    .bind(token)
    .first();

  if (!link || link.used_at) {
    return json({ ok: false, error: "Enlace inválido o ya usado." }, 400);
  }
  if (new Date(link.expires_at).getTime() < Date.now()) {
    return json({ ok: false, error: "Enlace expirado." }, 400);
  }

  const email = normalizeEmail(link.email);
  let user = await env.DB.prepare(`SELECT id, email, role FROM users WHERE email = ? LIMIT 1`)
    .bind(email)
    .first();

  if (!user) {
    const id = newId("user");
    await env.DB.prepare(`INSERT INTO users (id, email, role) VALUES (?, ?, 'member')`)
      .bind(id, email)
      .run();
    user = { id, email, role: "member" };
  }

  await env.DB.prepare(`UPDATE magic_links SET used_at = datetime('now') WHERE token = ?`)
    .bind(token)
    .run();

  const sessionToken = await createSessionForUser(env, user);

  const publicOrigin = requestPublicOrigin(request, url);
  const redirectPath = await resolvePostLoginPath(env, user, requestedNext, publicOrigin);
  const redirectTo = new URL(redirectPath, publicOrigin);
  if (redirectTo.origin !== publicOrigin) {
    redirectTo.href = new URL("/cuenta/", publicOrigin).href;
  }

  const cookieUrl = new URL(publicOrigin);

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo.pathname + redirectTo.search,
      "Set-Cookie": sessionCookie(sessionToken, cookieUrl),
    },
  });
}

function resolveDemoAccount(demoKey) {
  const key = String(demoKey || "")
    .trim()
    .toLowerCase();
  return DEMO_ACCOUNTS[key] || null;
}

export async function handleAuthBeta(request, env, url) {
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  let demoKey;
  let secret;
  let nextOverride;

  if (request.method === "GET") {
    demoKey = url.searchParams.get("demo");
    secret = url.searchParams.get("secret") || url.searchParams.get("key");
    nextOverride = url.searchParams.get("next");
  } else {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "JSON inválido." }, 400);
    }
    demoKey = body.demo;
    secret = body.secret || body.key;
    nextOverride = body.next;
  }

  if (!betaLoginAllowed(env, url, secret)) {
    return json({ ok: false, error: "Acceso beta no habilitado." }, 403);
  }

  const account = resolveDemoAccount(demoKey);
  if (!account) {
    return json({ ok: false, error: "Cuenta demo desconocida." }, 400);
  }

  const email = normalizeEmail(account.email);
  const user = await env.DB.prepare(`SELECT id, email, role FROM users WHERE email = ? LIMIT 1`)
    .bind(email)
    .first();

  if (!user) {
    return json(
      {
        ok: false,
        error: "Usuario demo no encontrado. Ejecuta db:seed:auth en D1.",
      },
      404,
    );
  }

  const sessionToken = await createSessionForUser(env, user);
  const publicOrigin = requestPublicOrigin(request, url);
  const next = nextOverride || account.next;
  const redirectTo = new URL(next, publicOrigin);
  if (redirectTo.origin !== publicOrigin) {
    redirectTo.href = new URL(account.next, publicOrigin).href;
  }

  const cookieUrl = new URL(publicOrigin);

  if (request.method === "GET") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo.pathname + redirectTo.search,
        "Set-Cookie": sessionCookie(sessionToken, cookieUrl),
      },
    });
  }

  return json(
    {
      ok: true,
      user: { id: user.id, email: user.email, role: user.role },
      redirect: redirectTo.pathname + redirectTo.search,
    },
    200,
    { "Set-Cookie": sessionCookie(sessionToken, cookieUrl) },
  );
}

export async function handleAuthLogout(request, env, url) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (token && env.DB) {
    await env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
  }
  return json(
    { ok: true },
    200,
    { "Set-Cookie": clearSessionCookie(url) },
  );
}

export async function handleAuthMe(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  let profile;
  try {
    profile = await env.DB.prepare(
      `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE user_id = ? LIMIT 1`,
    )
      .bind(user.id)
      .first();
  } catch (err) {
    console.error("handleAuthMe profile query failed:", err);
    return json(
      {
        ok: false,
        error: "Base de datos local desactualizada. Ejecuta npm run db:sync:local y reinicia dev:api.",
      },
      503,
    );
  }

  return json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
    profile: profile ? mapProfileRow(profile) : null,
    claimable: await listClaimableProfiles(env, user),
  });
}

export async function handleMeProfileClaim(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON inválido." }, 400);
  }

  const slug = String(body.slug || "").trim();
  if (!slug) return json({ ok: false, error: "Falta slug." }, 400);

  const result = await claimProfile(env, user, slug);
  if (!result.ok) return json({ ok: false, error: result.error }, 400);

  const profile = await env.DB.prepare(
    `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first();

  return json({ ok: true, profile: mapProfileRow(profile) });
}

export const PROFILE_COLUMNS = `slug, name, estado, servicios, tags, description, website, tier,
  featured, cover, avatar, custom_css, custom_fonts, status, user_id, galleries,
  EXISTS(SELECT 1 FROM profile_publications pp WHERE pp.slug = profiles.slug) AS has_publication`;

export function parseCustomFonts(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((f) => f && typeof f === "object" && f.id && f.family && f.url)
      .map((f) => ({
        id: String(f.id),
        family: String(f.family),
        url: String(f.url),
        format: String(f.format || "woff2"),
      }));
  } catch {
    return [];
  }
}

export function parseGalleries(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapProfileRow(row) {
  let servicios = [];
  try {
    servicios = JSON.parse(row.servicios || "[]");
  } catch {
    servicios = [];
  }
  let tags = [];
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch {
    tags = [];
  }
  if (!Array.isArray(tags)) tags = [];
  return {
    slug: row.slug,
    name: row.name,
    estado: row.estado,
    servicios,
    tags,
    description: row.description || "",
    website: row.website || undefined,
    tier: row.tier,
    featured: Boolean(row.featured),
    cover: row.cover,
    avatar: row.avatar,
    customCss: row.custom_css || "",
    customFonts: parseCustomFonts(row.custom_fonts),
    status: row.status,
    userId: row.user_id || undefined,
    galleries: parseGalleries(row.galleries),
    hasPublishedVersion: Boolean(row.has_publication),
  };
}

export function sanitizeBio(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

export function bioPlainText(html) {
  return sanitizeBio(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>\s*/gi, " ")
    .replace(/<\/h[1-6]>\s*/gi, " ")
    .replace(/<li>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function handleMeProfilePut(request, env) {
  if (request.method !== "PUT" && request.method !== "PATCH") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON inválido." }, 400);
  }

  const name = String(body.name || "").trim();
  const estado = String(body.estado || "").trim();
  const website = body.website ? String(body.website).trim() : null;
  const description = sanitizeBio(body.description || "");
  const servicios = normalizeServicios(body.servicios);
  const tags = normalizeProfileTags(body.tags);

  if (!name || !estado) {
    return json({ ok: false, error: "Nombre y ubicación son obligatorios." }, 400);
  }

  const owned = await env.DB.prepare(
    `SELECT slug, tier FROM profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first();

  let customCss = null;
  if (body.customCss != null && owned?.tier === "pro") {
    customCss = sanitizeCustomCss(body.customCss);
  }

  const existing = owned;

  if (!existing) {
    const claimable = await listClaimableProfiles(env, user);
    if (claimable.length > 0) {
      return json(
        {
          ok: false,
          error: "Tienes un perfil pendiente de reclamar antes de crear uno nuevo.",
          claimable,
        },
        409,
      );
    }
  }

  let slug;
  if (existing) {
    slug = existing.slug;
  } else {
    const base = slugFromName(name);
    if (!base) {
      return json({ ok: false, error: "Nombre inválido para generar URL." }, 400);
    }
    slug = await uniqueProfileSlug(env, base, user.id, user.email);
  }

  const serviciosJson = JSON.stringify(servicios);
  const tagsJson = JSON.stringify(tags);

  if (existing) {
    await markProfileDraftForEdit(env, user.id);
    await env.DB.prepare(
      `UPDATE profiles SET
        name = ?, estado = ?, servicios = ?, tags = ?, description = ?, website = ?,
        custom_css = COALESCE(?, custom_css),
        updated_at = datetime('now')
       WHERE user_id = ?`,
    )
      .bind(name, estado, serviciosJson, tagsJson, description, website, customCss, user.id)
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO profiles (
        slug, name, estado, servicios, tags, description, website, tier, featured,
        cover, avatar, custom_css, custom_fonts, user_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'free', 0, NULL, NULL, ?, '[]', ?, 'draft')`,
    )
      .bind(
        slug,
        name,
        estado,
        serviciosJson,
        tagsJson,
        description,
        website,
        customCss || "",
        user.id,
      )
      .run();
  }

  const profile = await env.DB.prepare(
    `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first();

  return json({ ok: true, profile: mapProfileRow(profile) });
}

export async function handleMeProfileSubmit(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  const result = await env.DB.prepare(
    `UPDATE profiles SET status = 'pending_review', updated_at = datetime('now')
     WHERE user_id = ?`,
  )
    .bind(user.id)
    .run();

  if (!result.meta?.changes) {
    return json({ ok: false, error: "No hay perfil para enviar." }, 404);
  }

  const profile = await env.DB.prepare(
    `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first();

  return json({ ok: true, profile: mapProfileRow(profile) });
}
