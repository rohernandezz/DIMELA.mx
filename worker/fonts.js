/**
 * Pro custom font uploads (R2) — max 2 fonts per profile.
 */

import { getSessionUser, json, mapProfileRow, parseCustomFonts, PROFILE_COLUMNS } from "./auth.js";
import {
  assertUploadQuota,
  mediaPublicUrl,
  objectKeyFromUrl,
  recordMediaDelete,
  recordMediaPut,
} from "./media.js";
import {
  markProfileDraftForEdit,
  publicationReferencesMedia,
} from "./publications.js";

export const FONT_LIMITS = {
  maxFonts: 2,
  maxBytes: 768 * 1024,
};

const ALLOWED_TYPES = new Map([
  ["font/woff2", "woff2"],
  ["application/font-woff2", "woff2"],
  ["font/woff", "woff"],
  ["application/font-woff", "woff"],
  ["font/ttf", "ttf"],
  ["font/otf", "otf"],
  ["application/x-font-ttf", "ttf"],
  ["application/x-font-opentype", "otf"],
  ["application/vnd.ms-opentype", "otf"],
]);

function extFromType(type) {
  return ALLOWED_TYPES.get(String(type || "").toLowerCase()) || null;
}

function sanitizeFamily(raw) {
  const family = String(raw || "")
    .trim()
    .replace(/['"]/g, "")
    .slice(0, 48);
  if (!family || !/^[\p{L}\p{N}\s._-]+$/u.test(family)) return null;
  return family;
}

async function loadOwnedProfile(env, userId) {
  return env.DB.prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE user_id = ? LIMIT 1`)
    .bind(userId)
    .first();
}

async function saveFonts(env, userId, fonts) {
  await markProfileDraftForEdit(env, userId);
  await env.DB.prepare(
    `UPDATE profiles SET custom_fonts = ?, updated_at = datetime('now') WHERE user_id = ?`,
  )
    .bind(JSON.stringify(fonts), userId)
    .run();
}

/**
 * POST /api/me/profile/font — multipart: family, file
 */
export async function handleFontUpload(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB || !env.MEDIA) {
    return json({ ok: false, error: "Almacenamiento no configurado." }, 503);
  }

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  const profile = await loadOwnedProfile(env, user.id);
  if (!profile) {
    return json({ ok: false, error: "Guarda el borrador primero." }, 400);
  }
  if (profile.tier !== "pro") {
    return json({ ok: false, error: "Fuentes personalizadas solo en Pro." }, 403);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Formulario inválido." }, 400);
  }

  const family = sanitizeFamily(form.get("family"));
  if (!family) {
    return json({ ok: false, error: "Nombre de fuente inválido (máx. 48 caracteres)." }, 400);
  }

  const file = form.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return json({ ok: false, error: "Falta el archivo." }, 400);
  }

  const contentType = String(file.type || "").toLowerCase();
  const ext = extFromType(contentType);
  if (!ext) {
    return json(
      { ok: false, error: "Formato no permitido. Usa WOFF2, WOFF, TTF u OTF." },
      415,
    );
  }

  if (file.size > FONT_LIMITS.maxBytes) {
    return json(
      {
        ok: false,
        error: `Archivo demasiado grande (máx. ${Math.round(FONT_LIMITS.maxBytes / 1024)} KB).`,
      },
      413,
    );
  }

  const fonts = parseCustomFonts(profile.custom_fonts);
  if (fonts.length >= FONT_LIMITS.maxFonts) {
    return json(
      { ok: false, error: `Máximo ${FONT_LIMITS.maxFonts} fuentes por perfil.` },
      409,
    );
  }

  const quotaCheck = await assertUploadQuota(env, { fileSize: file.size, oldKey: null });
  if (!quotaCheck.ok) {
    return json({ ok: false, error: quotaCheck.error, code: quotaCheck.code }, 507);
  }

  const id = crypto.randomUUID().replaceAll("-", "");
  const key = `profiles/${user.id}/font/${id}.${ext}`;
  const body = await file.arrayBuffer();

  await env.MEDIA.put(key, body, {
    httpMetadata: {
      contentType: contentType || `font/${ext}`,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: { userId: user.id, kind: "font", slug: profile.slug },
  });

  await recordMediaPut(env, {
    key,
    userId: user.id,
    kind: "font",
    sizeBytes: file.size,
  });

  fonts.push({
    id,
    family,
    url: mediaPublicUrl(key),
    format: ext,
  });
  await saveFonts(env, user.id, fonts);

  const row = await loadOwnedProfile(env, user.id);
  return json({ ok: true, profile: mapProfileRow(row) });
}

/**
 * DELETE /api/me/profile/font — body: { fontId }
 */
export async function handleFontDelete(request, env) {
  if (request.method !== "DELETE") {
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

  const fontId = String(body.fontId || "").trim();
  if (!fontId) return json({ ok: false, error: "Falta fontId." }, 400);

  const profile = await loadOwnedProfile(env, user.id);
  if (!profile) return json({ ok: false, error: "Perfil no encontrado." }, 404);

  const fonts = parseCustomFonts(profile.custom_fonts);
  const target = fonts.find((f) => f.id === fontId);
  if (!target) return json({ ok: false, error: "Fuente no encontrada." }, 404);

  const next = fonts.filter((f) => f.id !== fontId);
  await saveFonts(env, user.id, next);

  const oldKey = objectKeyFromUrl(target.url);
  const isPublished = await publicationReferencesMedia(env, profile.slug, target.url);
  if (oldKey && env.MEDIA && !isPublished) {
    try {
      await env.MEDIA.delete(oldKey);
      await recordMediaDelete(env, oldKey);
    } catch (err) {
      console.error("R2 font delete failed:", err);
    }
  }

  const row = await loadOwnedProfile(env, user.id);
  return json({ ok: true, profile: mapProfileRow(row) });
}
