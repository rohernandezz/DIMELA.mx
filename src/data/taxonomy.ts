/** Canonical Mexican states (32) + diaspora bucket used in the directory. */
export const MEXICO_ESTADOS = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Estado de México",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
  "Fuera de México",
] as const;

export type MexicoEstado = (typeof MEXICO_ESTADOS)[number];

/** Max ~10 services for chips / path menus. */
export const SERVICIOS = [
  "Lettering",
  "Branding",
  "Diseño de Tipografía",
  "Diseño Editorial",
  "Caligrafía",
  "Ingeniería de Fuentes",
  "Rotulación Manual",
] as const;

export type Servicio = (typeof SERVICIOS)[number];

const SERVICIO_SET = new Set<string>(SERVICIOS);

export function isServicio(value: string): value is Servicio {
  return SERVICIO_SET.has(value);
}

/**
 * Keep only allowlisted servicios, dedupe, preserve caller order.
 * Array order is the display order on cards and detail pages.
 * Keep worker/taxonomy.js in sync.
 */
export function normalizeServicios(raw: unknown): Servicio[] {
  if (!Array.isArray(raw)) return [];
  const out: Servicio[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const s = String(item || "").trim();
    if (!isServicio(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
