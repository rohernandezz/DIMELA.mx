/** URL slug helpers (Worker). Mirrors src/lib/slugs.ts toSlug. */

export function slugFromName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeSlug(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uniqueProfileSlug(env, baseSlug, excludeUserId = null) {
  let candidate = baseSlug || "perfil";
  let n = 2;
  while (true) {
    const row = await env.DB.prepare(
      `SELECT slug FROM profiles WHERE slug = ? AND (user_id IS NULL OR user_id != ?) LIMIT 1`,
    )
      .bind(candidate, excludeUserId ?? "")
      .first();
    if (!row) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}
