import { bioPlainText } from "./bio";

export type SearchQuery = {
  q: string;
  servicio: string[];
  estado: string[];
};

export type GalleryImage = {
  id: string;
  url: string;
  caption?: string;
};

export type ProfileGallery = {
  id: string;
  title: string;
  images: GalleryImage[];
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
  /** Present for owner/admin preview of unpublished profiles. */
  status?: string;
  galleries?: ProfileGallery[];
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
      const hay = `${p.name} ${bioPlainText(p.description)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (servicios.size && ![...servicios].some((s) => p.servicios.includes(s))) {
      return false;
    }
    if (estados.size && !estados.has(p.estado)) return false;
    return true;
  });
}
