/**
 * Profile gallery upload + management (R2 + D1 JSON on profiles.galleries).
 */

import {
  getSessionUser,
  json,
  mapProfileRow,
  parseGalleries,
  PROFILE_COLUMNS,
} from "./auth.js";
import {
  assertUploadQuota,
  extFromType,
  getMediaQuotaSnapshot,
  mediaPublicUrl,
  objectKeyFromUrl,
  recordMediaDelete,
  recordMediaPut,
} from "./media.js";
import {
  markProfileDraftForEdit,
  publicationReferencesMedia,
} from "./publications.js";

export const GALLERY_LIMITS = {
  free: { maxGalleries: 1, maxImagesPerGallery: 12, maxBytes: 3 * 1024 * 1024 },
  pro: { maxGalleries: 5, maxImagesPerGallery: 24, maxBytes: 5 * 1024 * 1024 },
};

const DEFAULT_GALLERY_TITLE = "Galería";

function galleryLimits(tier) {
  return tier === "pro" ? GALLERY_LIMITS.pro : GALLERY_LIMITS.free;
}

function newId() {
  return crypto.randomUUID().replaceAll("-", "");
}

async function loadOwnedProfile(env, userId) {
  return env.DB.prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE user_id = ? LIMIT 1`)
    .bind(userId)
    .first();
}

async function saveGalleries(env, userId, galleries) {
  await markProfileDraftForEdit(env, userId);
  await env.DB.prepare(
    `UPDATE profiles SET galleries = ?, updated_at = datetime('now') WHERE user_id = ?`,
  )
    .bind(JSON.stringify(galleries), userId)
    .run();
}

function ensureDefaultGallery(galleries, tier) {
  if (galleries.length) return galleries;
  return [{ id: newId(), title: DEFAULT_GALLERY_TITLE, images: [] }];
}

function findGallery(galleries, galleryId) {
  return galleries.find((g) => g.id === galleryId) || null;
}

function totalImages(galleries) {
  return galleries.reduce((n, g) => n + (g.images?.length || 0), 0);
}

function sanitizeTitle(title) {
  const t = String(title || "").trim().slice(0, 80);
  return t || DEFAULT_GALLERY_TITLE;
}

async function respondWithProfile(env, userId) {
  const updated = await loadOwnedProfile(env, userId);
  const quota = await getMediaQuotaSnapshot(env);
  return json({ ok: true, profile: mapProfileRow(updated), quota });
}

/**
 * POST /api/me/profile/gallery/upload — multipart: file, galleryId?, caption?
 */
export async function handleGalleryUpload(request, env) {
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
      { ok: false, error: "Guarda el borrador primero para crear tu perfil." },
      400,
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Formulario inválido." }, 400);
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

  const limits = galleryLimits(profile.tier);
  if (file.size > limits.maxBytes) {
    const mb = Math.round(limits.maxBytes / (1024 * 1024));
    return json({ ok: false, error: `Archivo demasiado grande (máx. ${mb} MB).` }, 413);
  }

  let galleries = ensureDefaultGallery(parseGalleries(profile.galleries), profile.tier);
  let galleryId = String(form.get("galleryId") || "").trim();
  let gallery = galleryId ? findGallery(galleries, galleryId) : galleries[0];

  if (!gallery) {
    if (profile.tier !== "pro" || galleries.length >= limits.maxGalleries) {
      return json({ ok: false, error: "Galería no encontrada." }, 404);
    }
    gallery = { id: newId(), title: DEFAULT_GALLERY_TITLE, images: [] };
    galleries.push(gallery);
    galleryId = gallery.id;
  }

  if ((gallery.images?.length || 0) >= limits.maxImagesPerGallery) {
    return json(
      {
        ok: false,
        error: `Límite de ${limits.maxImagesPerGallery} imágenes por galería (${profile.tier === "pro" ? "Pro" : "Free"}).`,
      },
      400,
    );
  }

  const quotaCheck = await assertUploadQuota(env, { fileSize: file.size, oldKey: null });
  if (!quotaCheck.ok) {
    return json({ ok: false, error: quotaCheck.error, code: quotaCheck.code }, 507);
  }

  const imageId = newId();
  const key = `profiles/${user.id}/gallery/${gallery.id}/${imageId}.${ext}`;
  const body = await file.arrayBuffer();

  await env.MEDIA.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      userId: user.id,
      kind: "gallery",
      galleryId: gallery.id,
      slug: profile.slug,
    },
  });

  const publicUrl = mediaPublicUrl(key);
  const caption = String(form.get("caption") || "").trim().slice(0, 200);

  if (!Array.isArray(gallery.images)) gallery.images = [];
  gallery.images.push({ id: imageId, url: publicUrl, caption: caption || undefined });

  await recordMediaPut(env, {
    key,
    userId: user.id,
    kind: "gallery",
    sizeBytes: file.size,
  });

  await saveGalleries(env, user.id, galleries);
  return respondWithProfile(env, user.id);
}

/**
 * DELETE /api/me/profile/gallery/image — JSON: { galleryId, imageId }
 */
export async function handleGalleryImageDelete(request, env) {
  if (request.method !== "DELETE") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);
  if (!env.MEDIA) return json({ ok: false, error: "R2 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON inválido." }, 400);
  }

  const galleryId = String(body.galleryId || "").trim();
  const imageId = String(body.imageId || "").trim();
  if (!galleryId || !imageId) {
    return json({ ok: false, error: "Faltan galleryId e imageId." }, 400);
  }

  const profile = await loadOwnedProfile(env, user.id);
  if (!profile) return json({ ok: false, error: "Perfil no encontrado." }, 404);

  const galleries = parseGalleries(profile.galleries);
  const gallery = findGallery(galleries, galleryId);
  if (!gallery) return json({ ok: false, error: "Galería no encontrada." }, 404);

  const idx = (gallery.images || []).findIndex((img) => img.id === imageId);
  if (idx === -1) return json({ ok: false, error: "Imagen no encontrada." }, 404);

  const [removed] = gallery.images.splice(idx, 1);
  const oldKey = objectKeyFromUrl(removed.url);
  const isPublished = await publicationReferencesMedia(env, profile.slug, removed.url);
  if (oldKey && !isPublished) {
    try {
      await env.MEDIA.delete(oldKey);
      await recordMediaDelete(env, oldKey);
    } catch (err) {
      console.error("R2 gallery delete failed:", err);
    }
  }

  await saveGalleries(env, user.id, galleries);
  return respondWithProfile(env, user.id);
}

/**
 * POST /api/me/profile/gallery — JSON: { title } — create gallery (Pro: up to 5)
 */
export async function handleGalleryCreate(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  const profile = await loadOwnedProfile(env, user.id);
  if (!profile) return json({ ok: false, error: "Perfil no encontrado." }, 404);

  const limits = galleryLimits(profile.tier);
  let galleries = parseGalleries(profile.galleries);

  if (profile.tier !== "pro") {
    return json(
      { ok: false, error: "Varias galerías requiere cuenta Pro." },
      403,
    );
  }

  if (galleries.length >= limits.maxGalleries) {
    return json(
      { ok: false, error: `Máximo ${limits.maxGalleries} galerías en Pro.` },
      400,
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  galleries.push({
    id: newId(),
    title: sanitizeTitle(body.title),
    images: [],
  });

  await saveGalleries(env, user.id, galleries);
  return respondWithProfile(env, user.id);
}

/**
 * PUT /api/me/profile/gallery — JSON: { galleryId, title }
 */
export async function handleGalleryUpdate(request, env) {
  if (request.method !== "PUT") {
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

  const galleryId = String(body.galleryId || "").trim();
  if (!galleryId) return json({ ok: false, error: "Falta galleryId." }, 400);

  const profile = await loadOwnedProfile(env, user.id);
  if (!profile) return json({ ok: false, error: "Perfil no encontrado." }, 404);

  const galleries = parseGalleries(profile.galleries);
  const gallery = findGallery(galleries, galleryId);
  if (!gallery) return json({ ok: false, error: "Galería no encontrada." }, 404);

  gallery.title = sanitizeTitle(body.title);
  await saveGalleries(env, user.id, galleries);
  return respondWithProfile(env, user.id);
}

/**
 * DELETE /api/me/profile/gallery — JSON: { galleryId } — Pro only, must keep ≥1
 */
export async function handleGalleryDelete(request, env) {
  if (request.method !== "DELETE") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
  if (!env.DB) return json({ ok: false, error: "D1 no configurado." }, 503);
  if (!env.MEDIA) return json({ ok: false, error: "R2 no configurado." }, 503);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: "No autenticado." }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON inválido." }, 400);
  }

  const galleryId = String(body.galleryId || "").trim();
  if (!galleryId) return json({ ok: false, error: "Falta galleryId." }, 400);

  const profile = await loadOwnedProfile(env, user.id);
  if (!profile) return json({ ok: false, error: "Perfil no encontrado." }, 404);

  if (profile.tier !== "pro") {
    return json({ ok: false, error: "Eliminar galerías requiere cuenta Pro." }, 403);
  }

  let galleries = parseGalleries(profile.galleries);
  if (galleries.length <= 1) {
    return json({ ok: false, error: "Debe quedar al menos una galería." }, 400);
  }

  const idx = galleries.findIndex((g) => g.id === galleryId);
  if (idx === -1) return json({ ok: false, error: "Galería no encontrada." }, 404);

  const [removed] = galleries.splice(idx, 1);
  for (const img of removed.images || []) {
    const oldKey = objectKeyFromUrl(img.url);
    if (!oldKey || (await publicationReferencesMedia(env, profile.slug, img.url))) continue;
    try {
      await env.MEDIA.delete(oldKey);
      await recordMediaDelete(env, oldKey);
    } catch (err) {
      console.error("R2 gallery bulk delete failed:", err);
    }
  }

  await saveGalleries(env, user.id, galleries);
  return respondWithProfile(env, user.id);
}

export { totalImages, galleryLimits };
