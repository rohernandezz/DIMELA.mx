/**
 * Admin approval APIs (D1).
 */
import { getSessionUser, json, mapProfileRow, PROFILE_COLUMNS, normalizeEmail, isValidEmail } from "./auth.js";
import { normalizeSlug } from "./slugs.js";

async function requireAdmin(env, request) {
  if (!env.DB) return { error: json({ ok: false, error: "D1 no configurado." }, 503) };
  const user = await getSessionUser(env, request);
  if (!user) return { error: json({ ok: false, error: "No autenticado." }, 401) };
  if (user.role !== "admin") {
    return { error: json({ ok: false, error: "Se requiere rol admin." }, 403) };
  }
  return { user };
}

export async function handleAdminQueue(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  const gate = await requireAdmin(env, request);
  if (gate.error) return gate.error;

  const status = (new URL(request.url).searchParams.get("status") || "pending_review").trim();
  const allowed = new Set(["pending_review", "draft", "published", "rejected"]);
  const filter = allowed.has(status) ? status : "pending_review";

  const { results } = await env.DB.prepare(
    `SELECT p.slug, p.name, p.estado, p.servicios, p.description, p.website, p.tier,
            p.featured, p.cover, p.avatar, p.custom_css, p.status, p.user_id, p.galleries,
            p.invite_email, p.updated_at, u.email AS owner_email
     FROM profiles p
     LEFT JOIN users u ON u.id = p.user_id
     WHERE p.status = ?
     ORDER BY p.updated_at DESC`,
  )
    .bind(filter)
    .all();

  const profiles = (results || []).map((row) => ({
    ...mapProfileRow(row),
    ownerEmail: row.owner_email || null,
    inviteEmail: row.invite_email || null,
    updatedAt: row.updated_at || null,
  }));

  return json({ ok: true, status: filter, total: profiles.length, profiles });
}

export async function handleAdminDecide(request, env, url) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  const gate = await requireAdmin(env, request);
  if (gate.error) return gate.error;

  // /api/admin/profiles/:slug/approve|reject
  const parts = url.pathname.split("/").filter(Boolean);
  // ["api","admin","profiles", slug, "approve"]
  if (parts.length < 5 || parts[0] !== "api" || parts[1] !== "admin" || parts[2] !== "profiles") {
    return json({ ok: false, error: "Ruta inválida." }, 404);
  }
  const slug = decodeURIComponent(parts[3] || "").trim();
  const action = parts[4];
  if (!slug || (action !== "approve" && action !== "reject")) {
    return json({ ok: false, error: "Acción inválida." }, 400);
  }

  const nextStatus = action === "approve" ? "published" : "rejected";

  let note = null;
  try {
    if ((request.headers.get("content-type") || "").includes("application/json")) {
      const body = await request.json();
      note = body.note ? String(body.note).trim() : null;
    }
  } catch {
    /* optional body */
  }

  const existing = await env.DB.prepare(
    `SELECT slug, status FROM profiles WHERE slug = ? LIMIT 1`,
  )
    .bind(slug)
    .first();
  if (!existing) return json({ ok: false, error: "Perfil no encontrado." }, 404);

  await env.DB.prepare(
    `UPDATE profiles SET status = ?, updated_at = datetime('now') WHERE slug = ?`,
  )
    .bind(nextStatus, slug)
    .run();

  // Optional audit note in a lightweight way: store in description prefix? Skip — keep note in response only for now.
  const row = await env.DB.prepare(
    `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE slug = ? LIMIT 1`,
  )
    .bind(slug)
    .first();

  return json({
    ok: true,
    action,
    note,
    profile: mapProfileRow(row),
  });
}

/**
 * PATCH /api/admin/profiles/:slug — body: { slug?, inviteEmail? }
 */
export async function handleAdminProfilePatch(request, env, url) {
  if (request.method !== "PATCH") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  const gate = await requireAdmin(env, request);
  if (gate.error) return gate.error;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[0] !== "api" || parts[1] !== "admin" || parts[2] !== "profiles") {
    return json({ ok: false, error: "Ruta inválida." }, 404);
  }
  const oldSlug = decodeURIComponent(parts[3] || "").trim();

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON inválido." }, 400);
  }

  const existing = await env.DB.prepare(
    `SELECT slug, user_id FROM profiles WHERE slug = ? LIMIT 1`,
  )
    .bind(oldSlug)
    .first();
  if (!existing) return json({ ok: false, error: "Perfil no encontrado." }, 404);

  let newSlug = oldSlug;
  if (body.slug != null) {
    newSlug = normalizeSlug(body.slug);
    if (!newSlug) {
      return json({ ok: false, error: "Slug inválido." }, 400);
    }
  }

  let inviteEmail = undefined;
  if (body.inviteEmail != null) {
    const raw = String(body.inviteEmail).trim();
    if (!raw) {
      inviteEmail = null;
    } else {
      inviteEmail = normalizeEmail(raw);
      if (!isValidEmail(inviteEmail)) {
        return json({ ok: false, error: "inviteEmail inválido." }, 400);
      }
    }
    if (existing.user_id) {
      return json({ ok: false, error: "No se puede invitar: el perfil ya tiene dueño." }, 400);
    }
  }

  if (newSlug !== oldSlug) {
    const taken = await env.DB.prepare(`SELECT slug FROM profiles WHERE slug = ? LIMIT 1`)
      .bind(newSlug)
      .first();
    if (taken) {
      return json({ ok: false, error: "Ese slug ya está en uso." }, 409);
    }
    await env.DB.prepare(
      `UPDATE profiles SET slug = ?, updated_at = datetime('now') WHERE slug = ?`,
    )
      .bind(newSlug, oldSlug)
      .run();
  }

  if (inviteEmail !== undefined) {
    await env.DB.prepare(
      `UPDATE profiles SET invite_email = ?, updated_at = datetime('now') WHERE slug = ?`,
    )
      .bind(inviteEmail, newSlug)
      .run();
  }

  const row = await env.DB.prepare(`SELECT ${PROFILE_COLUMNS}, invite_email FROM profiles WHERE slug = ? LIMIT 1`)
    .bind(newSlug)
    .first();

  return json({
    ok: true,
    profile: { ...mapProfileRow(row), inviteEmail: row.invite_email || null },
    previousSlug: newSlug !== oldSlug ? oldSlug : undefined,
  });
}
