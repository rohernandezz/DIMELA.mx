/**
 * Profile image upload (R2) + public media serving + free-tier quota guard.
 */

import { getSessionUser, json, mapProfileRow, PROFILE_COLUMNS } from "./auth.js";

const ALLOWED_KINDS = new Set(["cover", "avatar"]);
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const MAX_BYTES = {
  cover: 5 * 1024 * 1024,
  avatar: 2 * 1024 * 1024,
};

/** Cloudflare R2 free tier (Standard): 10 GB-month storage, 1M Class A ops/month. */
const R2_FREE_STORAGE_BYTES = 10 * 1024 * 1024 * 1024;
const R2_FREE_CLASS_A_OPS = 1_000_000;

/** Stop uploads before ~60% of free tier to leave headroom. */
export const QUOTA_MARGIN = 0.6;

export const MEDIA_LIMITS = {
  maxStorageBytes: Math.floor(R2_FREE_STORAGE_BYTES * QUOTA_MARGIN),
  maxClassAOpsPerMonth: Math.floor(R2_FREE_CLASS_A_OPS * QUOTA_MARGIN),
};

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function formatGiB(bytes) {
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function mediaPublicUrl(key) {
  return `/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function keyFromMediaPath(pathname) {
  if (!pathname.startsWith("/media/")) return null;
  const raw = pathname.slice("/media/".length);
  if (!raw || raw.includes("..")) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

function extFromType(type) {
  return ALLOWED_TYPES.get(String(type || "").toLowerCase()) || null;
}

export { extFromType, ALLOWED_TYPES };

async function loadOwnedProfile(env, userId) {
  return env.DB.prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE user_id = ? LIMIT 1`)
    .bind(userId)
    .first();
}

export function objectKeyFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url, "https://dimela.mx");
    if (!u.pathname.startsWith("/media/")) return null;
    return keyFromMediaPath(u.pathname);
  } catch {
    return null;
  }
}

async function getTotalStorageBytes(env) {
  const row = await env.DB.prepare(
    `SELECT COALESCE(SUM(size_bytes), 0) AS total FROM media_objects`,
  ).first();
  return Number(row?.total ?? 0);
}

async function getObjectSize(env, key) {
  if (!key) return 0;
  const row = await env.DB.prepare(
    `SELECT size_bytes FROM media_objects WHERE key = ? LIMIT 1`,
  )
    .bind(key)
    .first();
  return Number(row?.size_bytes ?? 0);
}

async function ensureQuotaRow(env) {
  const monthKey = currentMonthKey();
  let row = await env.DB.prepare(
    `SELECT month_key, class_a_ops FROM media_quota WHERE id = 'platform' LIMIT 1`,
  ).first();

  if (!row) {
    await env.DB.prepare(
      `INSERT INTO media_quota (id, month_key, class_a_ops) VALUES ('platform', ?, 0)`,
    )
      .bind(monthKey)
      .run();
    return { month_key: monthKey, class_a_ops: 0 };
  }

  if (row.month_key !== monthKey) {
    await env.DB.prepare(
      `UPDATE media_quota SET month_key = ?, class_a_ops = 0, updated_at = datetime('now') WHERE id = 'platform'`,
    )
      .bind(monthKey)
      .run();
    return { month_key: monthKey, class_a_ops: 0 };
  }

  return { month_key: row.month_key, class_a_ops: Number(row.class_a_ops ?? 0) };
}

export async function getMediaQuotaSnapshot(env) {
  const storageBytes = await getTotalStorageBytes(env);
  const quota = await ensureQuotaRow(env);
  const classAOps = quota.class_a_ops;
  const storageBlocked = storageBytes >= MEDIA_LIMITS.maxStorageBytes;
  const classABlocked = classAOps >= MEDIA_LIMITS.maxClassAOpsPerMonth;

  return {
    storageBytes,
    storageLimitBytes: MEDIA_LIMITS.maxStorageBytes,
    storageUsedPercent: Math.round((storageBytes / MEDIA_LIMITS.maxStorageBytes) * 1000) / 10,
    classAOpsThisMonth: classAOps,
    classAOpsLimit: MEDIA_LIMITS.maxClassAOpsPerMonth,
    marginPercent: Math.round(QUOTA_MARGIN * 100),
    uploadsBlocked: storageBlocked || classABlocked,
    storageBlocked,
    classABlocked,
  };
}

export async function assertUploadQuota(env, { fileSize, oldKey }) {
  const oldSize = await getObjectSize(env, oldKey);
  const totalStorage = await getTotalStorageBytes(env);
  const netDelta = fileSize - oldSize;

  if (totalStorage + netDelta > MEDIA_LIMITS.maxStorageBytes) {
    return {
      ok: false,
      code: "quota_storage",
      error: `Almacenamiento del directorio lleno (${formatGiB(totalStorage)} de ${formatGiB(MEDIA_LIMITS.maxStorageBytes)} reservados, ~${Math.round(QUOTA_MARGIN * 100)}% del tier gratuito de R2). Contacta al equipo DIMELA.`,
    };
  }

  const quota = await ensureQuotaRow(env);
  const opsNeeded = 1 + (oldKey ? 1 : 0);
  if (quota.class_a_ops + opsNeeded > MEDIA_LIMITS.maxClassAOpsPerMonth) {
    return {
      ok: false,
      code: "quota_class_a",
      error: `Límite mensual de subidas alcanzado (${quota.class_a_ops.toLocaleString("es-MX")} operaciones este mes; tope ~${Math.round(QUOTA_MARGIN * 100)}% del tier gratuito de R2). Intenta el próximo mes o contacta al equipo DIMELA.`,
    };
  }

  return { ok: true, opsNeeded };
}

export async function recordMediaPut(env, { key, userId, kind, sizeBytes }) {
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO media_objects (key, user_id, kind, size_bytes) VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET size_bytes = excluded.size_bytes, kind = excluded.kind`,
    ).bind(key, userId, kind, sizeBytes),
    env.DB.prepare(
      `UPDATE media_quota SET class_a_ops = class_a_ops + 1, updated_at = datetime('now') WHERE id = 'platform'`,
    ),
  ]);
}

export async function recordMediaDelete(env, key) {
  const existed = await getObjectSize(env, key);
  if (!existed) {
    await env.DB.prepare(
      `UPDATE media_quota SET class_a_ops = class_a_ops + 1, updated_at = datetime('now') WHERE id = 'platform'`,
    ).run();
    return;
  }

  await env.DB.batch([
    env.DB.prepare(`DELETE FROM media_objects WHERE key = ?`).bind(key),
    env.DB.prepare(
      `UPDATE media_quota SET class_a_ops = class_a_ops + 1, updated_at = datetime('now') WHERE id = 'platform'`,
    ),
  ]);
}

/**
 * GET /api/me/media/quota — storage + Class A usage vs free-tier cap.
 */
export async function handleMediaQuotaGet(request, env) {
  if (request.method !== "GET") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  const quota = await getMediaQuotaSnapshot(env);
  return json({ ok: true, quota });
}

/**
 * POST /api/me/profile/upload — multipart: kind=cover|avatar, file=<image>
 */
export async function handleMeProfileUpload(request, env, _url) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);
  if (!env.MEDIA) return json({ ok: false, error: "R2 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  const profile = await loadOwnedProfile(env, user.id);
  if (!profile) {
    return json(
      {
        ok: false,
        error: "Guarda el borrador primero para crear tu perfil, luego sube la imagen.",
      },
      400,
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Formulario inválido." }, 400);
  }

  const kind = String(form.get("kind") || "").trim().toLowerCase();
  if (!ALLOWED_KINDS.has(kind)) {
    return json({ ok: false, error: "Tipo de imagen inválido (cover o avatar)." }, 400);
  }

  const file = form.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return json({ ok: false, error: "Falta el archivo." }, 400);
  }

  const contentType = String(file.type || "").toLowerCase();
  const ext = extFromType(contentType);
  if (!ext) {
    return json(
      { ok: false, error: "Formato no permitido. Usa JPEG, PNG, WebP o GIF." },
      415,
    );
  }

  const maxBytes = MAX_BYTES[kind];
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return json(
      { ok: false, error: `Archivo demasiado grande (máx. ${mb} MB para ${kind}).` },
      413,
    );
  }

  const column = kind === "cover" ? "cover" : "avatar";
  const previousUrl = profile[column];
  const oldKey = objectKeyFromUrl(previousUrl);

  const quotaCheck = await assertUploadQuota(env, { fileSize: file.size, oldKey });
  if (!quotaCheck.ok) {
    return json(
      { ok: false, error: quotaCheck.error, code: quotaCheck.code },
      507,
    );
  }

  const id = crypto.randomUUID().replaceAll("-", "");
  const key = `profiles/${user.id}/${kind}/${id}.${ext}`;
  const body = await file.arrayBuffer();

  await env.MEDIA.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      userId: user.id,
      kind,
      slug: profile.slug,
    },
  });

  const publicUrl = mediaPublicUrl(key);

  await env.DB.prepare(
    `UPDATE profiles SET ${column} = ?, updated_at = datetime('now') WHERE user_id = ?`,
  )
    .bind(publicUrl, user.id)
    .run();

  await recordMediaPut(env, {
    key,
    userId: user.id,
    kind,
    sizeBytes: file.size,
  });

  if (oldKey && oldKey.startsWith(`profiles/${user.id}/`) && oldKey !== key) {
    try {
      await env.MEDIA.delete(oldKey);
      await recordMediaDelete(env, oldKey);
    } catch (err) {
      console.error("R2 delete previous failed:", err);
    }
  }

  const updated = await loadOwnedProfile(env, user.id);
  const quota = await getMediaQuotaSnapshot(env);
  return json({
    ok: true,
    kind,
    url: publicUrl,
    profile: mapProfileRow(updated),
    quota,
  });
}

/**
 * GET /media/* — serve objects from R2 (public CDN-style URLs stored on profiles).
 */
export async function handleMediaGet(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.MEDIA) return json({ ok: false, error: "R2 no configurado." }, 503);

  const key = keyFromMediaPath(url.pathname);
  if (!key || !key.startsWith("profiles/")) {
    return json({ ok: false, error: "No encontrado." }, 404);
  }

  const object = await env.MEDIA.get(key);
  if (!object) {
    return json({ ok: false, error: "No encontrado." }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Access-Control-Allow-Origin", "*");

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  return new Response(object.body, { status: 200, headers });
}
