/**
 * Mock profiles for homepage card UI review only.
 * Names / locations / services drawn from real Directorio entries;
 * bios written as realistic stand-ins (most Hugo descriptions are still placeholder).
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
  cover: string | null;
  avatar: string | null;
}

export const MOCK_PROFILES: MockProfile[] = [
  {
    slug: "romina-hernandez",
    name: "Romina Hernández",
    estado: "CDMX",
    servicios: ["Diseño de Tipografía", "Lettering", "Ingeniería de Fuentes"],
    description:
      "Desde México, hago letras con amor y buen sazón. Tipografía a la medida, lettering e ingeniería de fuentes en Tortilla.studio.",
    website: "https://tortilla.studio",
    tier: "pro",
    featured: true,
    cover: "/mock/cover-warm.svg",
    avatar: null,
  },
  {
    slug: "cristobal-henestrosa",
    name: "Cristóbal Henestrosa",
    estado: "CDMX",
    servicios: ["Diseño de Tipografía", "Diseño Editorial"],
    description:
      "Diseñador tipográfico y editorial. Fuentes para prensa, libros e identidad cultural mexicana.",
    website: "https://henestrosatype.com",
    tier: "pro",
    featured: true,
    cover: "/mock/cover-cool.svg",
    avatar: null,
  },
  {
    slug: "miguel-contreras",
    name: "Miguel Contreras",
    estado: "Puebla",
    servicios: ["Lettering", "Branding", "Diseño de Tipografía", "Caligrafía"],
    description:
      "Lettering, caligrafía y tipografía para marcas. Proyectos de identidad con trazo propio.",
    website: "https://miglconts.com",
    tier: "pro",
    cover: "/mock/cover-green.svg",
    avatar: "/mock/miguel-avatar.png",
  },
  {
    slug: "cecilia-del-castillo",
    name: "Cecilia del Castillo",
    estado: "Fuera de México",
    servicios: ["Diseño de Tipografía", "Caligrafía"],
    description:
      "Mexican type designer & calligrapher. Fuentes y caligrafía para proyectos editoriales e identidad.",
    website: "https://www.instagram.com/ceci_dcd",
    tier: "free",
    cover: "/mock/cecilia-featured.png",
    avatar: null,
  },
  {
    slug: "antonio-mejia-lechuga",
    name: "Antonio Mejía Lechuga",
    estado: "Querétaro",
    servicios: ["Diseño Editorial"],
    description:
      "Diseño editorial y tipografía aplicada a libros, revistas y publicaciones independientes.",
    website: "https://cuatroojos.com.mx",
    tier: "free",
    cover: null,
    avatar: null,
  },
  {
    slug: "aspacia-kusulas",
    name: "Aspacia Kusulas",
    estado: "Fuera de México",
    servicios: ["Caligrafía"],
    description:
      "Caligrafía contemporánea para marca, papelería y piezas únicas. Enfoque en el trazo a mano.",
    website: "https://en.designkous.com/",
    tier: "free",
    cover: "/mock/cover-pink.svg",
    avatar: null,
  },
  {
    slug: "giovanni-bautista",
    name: "Giovanni Bautista",
    estado: "Oaxaca",
    servicios: ["Rotulación Manual", "Lettering"],
    description:
      "Rotulación a mano y lettering para comercio local, fachadas y espacios públicos en Oaxaca.",
    tier: "free",
    cover: "/mock/mara-featured.png",
    avatar: null,
  },
  {
    slug: "mara-osman",
    name: "Mara Osman",
    estado: "Ciudad de México",
    servicios: ["Branding", "Diseño de Tipografía", "Lettering", "Caligrafía"],
    description:
      "Identidad tipográfica, lettering y caligrafía para marcas culturales y editoriales.",
    tier: "pro",
    cover: "/mock/cover-cool.svg",
    avatar: null,
  },
  {
    slug: "alberto-guzman",
    name: "Alberto Guzmán",
    estado: "CDMX",
    servicios: [
      "Diseño de Tipografía",
      "Caligrafía",
      "Diseño Editorial",
      "Rotulación Manual",
      "Ingeniería de Fuentes",
      "Branding",
    ],
    description:
      "Práctica amplia alrededor de la letra: tipografía, caligrafía, rotulación e ingeniería de fuentes.",
    tier: "free",
    cover: null,
    avatar: null,
  },
  {
    slug: "sandra-morales",
    name: "Sandra Morales",
    estado: "Puebla",
    servicios: ["Rotulación Manual"],
    description:
      "Rotulación manual para negocios, letreros y piezas de señalética con carácter local.",
    tier: "free",
    cover: "/mock/cover-green.svg",
    avatar: null,
  },
  {
    slug: "elena-medina",
    name: "Elena Medina",
    estado: "Baja California Sur",
    servicios: ["Branding"],
    description:
      "Branding tipográfico para marcas del noroeste: logos, sistemas y aplicaciones.",
    tier: "free",
    cover: "/mock/cover-pink.svg",
    avatar: null,
  },
  {
    slug: "luisa-de-la-barrera",
    name: "Luisa De La Barrera",
    estado: "Querétaro",
    servicios: ["Ingeniería de Fuentes"],
    description:
      "Ingeniería tipográfica: hinting, kerning, exportación y soporte técnico para diseñadores de fuentes.",
    tier: "free",
    cover: null,
    avatar: null,
  },
];

/** Unique facet values from mock data (for FilterBar chips). */
export function mockFacetOptions(profiles: MockProfile[] = MOCK_PROFILES) {
  const servicios = new Set<string>();
  const estados = new Set<string>();
  for (const p of profiles) {
    for (const s of p.servicios) servicios.add(s);
    estados.add(p.estado);
  }
  return {
    servicios: [...servicios].sort((a, b) => a.localeCompare(b, "es")),
    estados: [...estados].sort((a, b) => a.localeCompare(b, "es")),
  };
}
