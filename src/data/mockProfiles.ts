/**
 * Mock profiles for homepage card UI review only.
 * Not wired to D1 / real content yet.
 */
export type MockTier = "free" | "pro";

export interface MockProfile {
  slug: string;
  name: string;
  estado: string;
  servicios: string[];
  description: string;
  website?: string;
  tier: MockTier;
  featured?: boolean;
  /** Featured/cover image path under /public, or null for placeholder */
  cover: string | null;
  /** Avatar path, or null for SVG fallback */
  avatar: string | null;
}

export const MOCK_PROFILES: MockProfile[] = [
  {
    slug: "romina-hernandez",
    name: "Romina Hernández",
    estado: "CDMX",
    servicios: ["Lettering", "Branding", "Diseño de Tipografía"],
    description: "Diseño tipográfico y lettering para marcas editoriales y culturales.",
    website: "https://example.com",
    tier: "pro",
    featured: true,
    cover: null,
    avatar: null,
  },
  {
    slug: "miguel-contreras",
    name: "Miguel Contreras",
    estado: "Jalisco",
    servicios: ["Lettering", "Rotulación Manual"],
    description: "Rotulación y lettering a mano para espacios y comercio local.",
    tier: "pro",
    featured: true,
    cover: "/mock/cover-warm.svg",
    avatar: "/mock/miguel-avatar.png",
  },
  {
    slug: "cecilia-del-castillo",
    name: "Cecilia del Castillo",
    estado: "CDMX",
    servicios: ["Caligrafía", "Lettering"],
    description: "Caligrafía contemporánea y lettering para proyectos editoriales.",
    tier: "free",
    cover: "/mock/cecilia-featured.png",
    avatar: null,
  },
  {
    slug: "mara",
    name: "Mara",
    estado: "Oaxaca",
    servicios: ["Diseño de Tipografía", "Diseño Editorial"],
    description: "Tipografía e identidad visual con enfoque editorial.",
    tier: "free",
    cover: "/mock/mara-featured.png",
    avatar: null,
  },
  {
    slug: "alina-kiliwa",
    name: "Alina Kiliwa",
    estado: "Baja California",
    servicios: ["Lettering", "Branding"],
    description: "Lettering e identidad para marcas independientes.",
    tier: "pro",
    cover: "/mock/cover-cool.svg",
    avatar: null,
  },
  {
    slug: "pedro-alcazar",
    name: "Pedro Alcázar",
    estado: "Puebla",
    servicios: ["Ingeniería de Fuentes", "Diseño de Tipografía"],
    description: "Diseño e ingeniería de fuentes para uso editorial y web.",
    tier: "free",
    cover: null,
    avatar: null,
  },
  {
    slug: "elena-medina",
    name: "Elena Medina",
    estado: "Nuevo León",
    servicios: ["Branding", "Diseño Editorial"],
    description: "Branding tipográfico y diseño editorial.",
    tier: "free",
    cover: "/mock/cover-pink.svg",
    avatar: null,
  },
  {
    slug: "aspacia-kusulas",
    name: "Aspacia Kusulas",
    estado: "CDMX",
    servicios: ["Lettering", "Caligrafía", "Rotulación Manual"],
    description: "Lettering y caligrafía para marca y espacio público.",
    website: "https://example.com",
    tier: "pro",
    cover: "/mock/cover-green.svg",
    avatar: null,
  },
];
