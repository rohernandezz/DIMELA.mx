/**
 * Curated profile tags (subespecialidades / contextos).
 *
 * Searchable via `q` — not filter chips. Edit this list to add/remove tags.
 * Keep worker/tags.js in sync (Worker allowlist for PUT /api/me/profile).
 */
export const PROFILE_TAGS = [
  "Tipografía custom",
  "Tipo para marca",
  "Murales",
  "Gran formato",
  "Grabado caligráfico",
  "Activaciones",
  "Pizarras",
  "Brush",
  "Neon",
  "Packaging",
  "Talleres",
  "Señalética",
  "Fachada",
  "Retail",
  "Editorial",
  "Logotipo",
] as const;

export type ProfileTag = (typeof PROFILE_TAGS)[number];

/** Soft cap per profile in the editor and API. */
export const MAX_PROFILE_TAGS = 8;

const TAG_SET = new Set<string>(PROFILE_TAGS);

export function isProfileTag(value: string): value is ProfileTag {
  return TAG_SET.has(value);
}

/** Keep only allowlisted tags, dedupe, cap at MAX_PROFILE_TAGS. */
export function normalizeProfileTags(raw: unknown): ProfileTag[] {
  if (!Array.isArray(raw)) return [];
  const out: ProfileTag[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const tag = String(item || "").trim();
    if (!isProfileTag(tag) || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_PROFILE_TAGS) break;
  }
  return out;
}
