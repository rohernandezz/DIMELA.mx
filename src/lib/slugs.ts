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

const ESTADO_BY_SLUG = new Map(MEXICO_ESTADOS.map((e) => [toSlug(e), e]));
const SERVICIO_BY_SLUG = new Map(SERVICIOS.map((s) => [toSlug(s), s]));

export function estadoFromSlug(slug: string): MexicoEstado | undefined {
  return ESTADO_BY_SLUG.get(slug);
}

export function servicioFromSlug(slug: string): Servicio | undefined {
  return SERVICIO_BY_SLUG.get(slug);
}

export function estadoSlug(estado: MexicoEstado): string {
  return toSlug(estado);
}

export function servicioSlug(servicio: Servicio): string {
  return toSlug(servicio);
}
