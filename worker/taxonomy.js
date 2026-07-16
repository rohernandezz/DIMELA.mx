/**
 * Canonical servicios — keep in sync with src/data/taxonomy.ts.
 */
export const SERVICIOS = [
  "Lettering",
  "Branding",
  "Diseño de Tipografía",
  "Diseño Editorial",
  "Caligrafía",
  "Ingeniería de Fuentes",
  "Rotulación Manual",
];

const SERVICIO_SET = new Set(SERVICIOS);

/**
 * Keep only allowlisted servicios, dedupe, preserve caller order.
 * Array order is the display order on cards and detail pages.
 */
export function normalizeServicios(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const s = String(item || "").trim();
    if (!SERVICIO_SET.has(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
