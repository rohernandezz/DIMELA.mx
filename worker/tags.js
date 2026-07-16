/**
 * Curated profile tags — keep in sync with src/data/tags.ts.
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
];

export const MAX_PROFILE_TAGS = 8;

const TAG_SET = new Set(PROFILE_TAGS);

/** Keep only allowlisted tags, dedupe, cap at MAX_PROFILE_TAGS. */
export function normalizeProfileTags(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const tag = String(item || "").trim();
    if (!TAG_SET.has(tag) || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_PROFILE_TAGS) break;
  }
  return out;
}
