/**
 * Shared filter shape for client + /api/search (mock today, D1 later).
 */

export type SearchQuery = {
  q: string;
  servicio: string[];
  estado: string[];
};

export type SearchableProfile = {
  slug: string;
  name: string;
  estado: string;
  servicios: string[];
  description: string;
  tier: string;
  cover: string | null;
  avatar: string | null;
  website?: string;
  featured?: boolean;
};

export function parseSearchParams(params: URLSearchParams): SearchQuery {
  const split = (key: string) =>
    (params.get(key) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return {
    q: (params.get("q") || "").trim(),
    servicio: split("servicio"),
    estado: split("estado"),
  };
}

export function filterProfiles<T extends SearchableProfile>(
  profiles: T[],
  query: SearchQuery,
): T[] {
  const q = query.q.toLowerCase();
  const servicios = new Set(query.servicio);
  const estados = new Set(query.estado);

  return profiles.filter((p) => {
    if (q) {
      const hay = `${p.name} ${p.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (servicios.size && ![...servicios].some((s) => p.servicios.includes(s))) {
      return false;
    }
    if (estados.size && !estados.has(p.estado)) return false;
    return true;
  });
}
