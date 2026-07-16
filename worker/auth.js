/**
 * Magic-link auth + session helpers (D1).
 */

const SESSION_COOKIE = "dm_session";
const SESSION_DAYS = 14;
const MAGIC_MINUTES = 30;

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

  const token = randomToken();
  const expiresAt = isoInMinutes(MAGIC_MINUTES);

  await env.DB.prepare(
    `INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)`,
  )
    .bind(token, email, expiresAt)
    .run();

  const verifyUrl = new URL("/api/auth/verify", url.origin);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("next", "/editar/");

  // Email provider later — for now return the link (dev/MVP).
  console.log(`Magic link for ${email}: ${verifyUrl.toString()}`);

  return json({
    ok: true,
    message: "Revisa tu correo (o usa el enlace de desarrollo).",
    expiresMinutes: MAGIC_MINUTES,
    verifyUrl: verifyUrl.toString(),
  });
}

export async function handleAuthVerify(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const token = (url.searchParams.get("token") || "").trim();
  const next = url.searchParams.get("next") || "/editar/";
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

  const sessionToken = randomToken();
  await env.DB.prepare(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`,
  )
    .bind(sessionToken, user.id, isoInDays(SESSION_DAYS))
    .run();

  const redirectTo = new URL(next, url.origin);
  if (redirectTo.origin !== url.origin) {
    redirectTo.href = new URL("/editar/", url.origin).href;
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo.pathname + redirectTo.search,
      "Set-Cookie": sessionCookie(sessionToken, url),
    },
  });
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

  const profile = await env.DB.prepare(
    `SELECT slug, name, estado, servicios, description, website, tier, featured, cover, avatar, custom_css, status, user_id
     FROM profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first();

  return json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
    profile: profile ? mapProfileRow(profile) : null,
  });
}

export function mapProfileRow(row) {
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
    customCss: row.custom_css || "",
    status: row.status,
    userId: row.user_id || undefined,
  };
}

export function sanitizeBio(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
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
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
  const estado = String(body.estado || "").trim();
  const website = body.website ? String(body.website).trim() : null;
  const description = sanitizeBio(body.description || "");
  const customCss = body.customCss != null ? String(body.customCss) : null;
  const servicios = Array.isArray(body.servicios)
    ? body.servicios.map(String)
    : [];

  if (!name || !slug || !estado) {
    return json({ ok: false, error: "Nombre, slug y ubicación son obligatorios." }, 400);
  }

  const existing = await env.DB.prepare(
    `SELECT slug FROM profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first();

  const slugTaken = await env.DB.prepare(
    `SELECT slug FROM profiles WHERE slug = ? AND (user_id IS NULL OR user_id != ?) LIMIT 1`,
  )
    .bind(slug, user.id)
    .first();
  if (slugTaken) {
    return json({ ok: false, error: "Ese slug ya está en uso." }, 409);
  }

  const serviciosJson = JSON.stringify(servicios);

  if (existing) {
    const oldSlug = existing.slug;
    if (oldSlug !== slug) {
      await env.DB.prepare(
        `UPDATE profiles SET
          slug = ?, name = ?, estado = ?, servicios = ?, description = ?, website = ?,
          custom_css = COALESCE(?, custom_css),
          status = CASE WHEN status = 'published' THEN 'draft' ELSE status END,
          updated_at = datetime('now')
         WHERE user_id = ?`,
      )
        .bind(slug, name, estado, serviciosJson, description, website, customCss, user.id)
        .run();
    } else {
      await env.DB.prepare(
        `UPDATE profiles SET
          name = ?, estado = ?, servicios = ?, description = ?, website = ?,
          custom_css = COALESCE(?, custom_css),
          updated_at = datetime('now')
         WHERE user_id = ?`,
      )
        .bind(name, estado, serviciosJson, description, website, customCss, user.id)
        .run();
    }
  } else {
    await env.DB.prepare(
      `INSERT INTO profiles (
        slug, name, estado, servicios, description, website, tier, featured,
        cover, avatar, custom_css, user_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'free', 0, NULL, NULL, ?, ?, 'draft')`,
    )
      .bind(slug, name, estado, serviciosJson, description, website, customCss, user.id)
      .run();
  }

  const profile = await env.DB.prepare(
    `SELECT slug, name, estado, servicios, description, website, tier, featured, cover, avatar, custom_css, status, user_id
     FROM profiles WHERE user_id = ? LIMIT 1`,
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
    `SELECT slug, name, estado, servicios, description, website, tier, featured, cover, avatar, custom_css, status, user_id
     FROM profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first();

  return json({ ok: true, profile: mapProfileRow(profile) });
}
