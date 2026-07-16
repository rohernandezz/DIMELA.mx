/**
 * URL slugs for taxonomy labels (estados / servicios).
 */
import { MEXICO_ESTADOS, SERVICIOS, type MexicoEstado, type Servicio } from "../data/taxonomy";

export function toSlug(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Short public slugs for common estados. */
const ESTADO_SLUG_BY_LABEL: Partial<Record<MexicoEstado, string>> = {
  "Ciudad de México": "cdmx",
  "Estado de México": "edomex",
};

export function estadoSlug(estado: string): string {
  return ESTADO_SLUG_BY_LABEL[estado as MexicoEstado] ?? toSlug(estado);
}

const ESTADO_BY_SLUG = new Map<string, MexicoEstado>();
for (const estado of MEXICO_ESTADOS) {
  ESTADO_BY_SLUG.set(estadoSlug(estado), estado);
}
/** Legacy / alternate slugs. */
ESTADO_BY_SLUG.set("ciudad-de-mexico", "Ciudad de México");
ESTADO_BY_SLUG.set("estado-de-mexico", "Estado de México");

const SERVICIO_BY_SLUG = new Map(SERVICIOS.map((s) => [toSlug(s), s]));

export function estadoFromSlug(slug: string): MexicoEstado | undefined {
  return ESTADO_BY_SLUG.get(slug);
}

export function servicioFromSlug(slug: string): Servicio | undefined {
  return SERVICIO_BY_SLUG.get(slug);
}

export function servicioSlug(servicio: Servicio): string {
  return toSlug(servicio);
}
