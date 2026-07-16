/**
 * Counts for taxonomy browse indexes (mock data).
 */
import { MOCK_PROFILES, type MockProfile } from "../data/mockProfiles";
import { MEXICO_ESTADOS, SERVICIOS, type MexicoEstado, type Servicio } from "../data/taxonomy";
import { estadoSlug, servicioSlug } from "./slugs";

export type TaxonomyCount = {
  label: string;
  slug: string;
  count: number;
};

export function countByEstado(profiles: MockProfile[] = MOCK_PROFILES): TaxonomyCount[] {
  const counts = new Map<MexicoEstado, number>();
  for (const e of MEXICO_ESTADOS) counts.set(e, 0);
  for (const p of profiles) {
    counts.set(p.estado, (counts.get(p.estado) ?? 0) + 1);
  }
  return MEXICO_ESTADOS.map((label) => ({
    label,
    slug: estadoSlug(label),
    count: counts.get(label) ?? 0,
  }));
}

export function countByServicio(profiles: MockProfile[] = MOCK_PROFILES): TaxonomyCount[] {
  const counts = new Map<Servicio, number>();
  for (const s of SERVICIOS) counts.set(s, 0);
  for (const p of profiles) {
    for (const s of p.servicios) {
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
  }
  return SERVICIOS.map((label) => ({
    label,
    slug: servicioSlug(label),
    count: counts.get(label) ?? 0,
  }));
}
