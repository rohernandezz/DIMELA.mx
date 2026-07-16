/**
 * Mock profiles for homepage UI review.
 * Covers every estado (+ Fuera de México); denser in CDMX, Puebla, Jalisco, etc.
 */
import { MEXICO_ESTADOS, SERVICIOS, type MexicoEstado, type Servicio } from "./taxonomy";

export type MockTier = "free" | "pro";

export interface MockProfile {
  slug: string;
  name: string;
  estado: MexicoEstado;
  servicios: Servicio[];
  description: string;
  website?: string;
  tier: MockTier;
  featured?: boolean;
  cover: string | null;
  avatar: string | null;
}

const COVERS = [
  "/mock/cover-warm.svg",
  "/mock/cover-cool.svg",
  "/mock/cover-pink.svg",
  "/mock/cover-green.svg",
  "/mock/cecilia-featured.png",
  "/mock/mara-featured.png",
  null,
] as const;

function coverFor(i: number): string | null {
  return COVERS[i % COVERS.length] ?? null;
}

/** Named “hero” entries (realistic copy) shown first in the mock list. */
const FEATURED_REALISTIC: MockProfile[] = [
  {
    slug: "romina-hernandez",
    name: "Romina Hernández",
    estado: "Ciudad de México",
    servicios: ["Diseño de Tipografía", "Lettering", "Ingeniería de Fuentes"],
    description:
      "Desde México, hago letras con amor y buen sazón. Tipografía a la medida, lettering e ingeniería en Tortilla.studio.",
    website: "https://tortilla.studio",
    tier: "pro",
    cover: "/mock/cover-warm.svg",
    avatar: null,
  },
  {
    slug: "cristobal-henestrosa",
    name: "Cristóbal Henestrosa",
    estado: "Ciudad de México",
    servicios: ["Diseño de Tipografía", "Diseño Editorial"],
    description:
      "Diseñador tipográfico y editorial. Fuentes para prensa, libros e identidad cultural mexicana.",
    website: "https://henestrosatype.com",
    tier: "pro",
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
      "Mexican type designer & calligrapher. Fuentes y caligrafía para editorial e identidad.",
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
];

/** Extra density for popular hubs (placeholders). */
const HUB_EXTRA: { estado: MexicoEstado; count: number }[] = [
  { estado: "Ciudad de México", count: 8 },
  { estado: "Puebla", count: 5 },
  { estado: "Jalisco", count: 4 },
  { estado: "Nuevo León", count: 3 },
  { estado: "Oaxaca", count: 3 },
  { estado: "Querétaro", count: 2 },
  { estado: "Yucatán", count: 2 },
  { estado: "Veracruz", count: 2 },
];

const FIRST_NAMES = [
  "Ana",
  "Bruno",
  "Camila",
  "Diego",
  "Elena",
  "Fernanda",
  "Gabriel",
  "Helena",
  "Iván",
  "Jimena",
  "Kevin",
  "Lucia",
  "Marco",
  "Natalia",
  "Oscar",
  "Paula",
  "Rafael",
  "Sofía",
  "Tomás",
  "Valeria",
  "Ximena",
  "Yuri",
];

const LAST_NAMES = [
  "Reyes",
  "López",
  "Martínez",
  "García",
  "Hernández",
  "Ramírez",
  "Torres",
  "Flores",
  "Vargas",
  "Castillo",
  "Moreno",
  "Jiménez",
  "Ruiz",
  "Díaz",
  "Cruz",
];

const BLURBS: Record<Servicio, string[]> = {
  Lettering: [
    "Lettering para marca, empaques y piezas editoriales.",
    "Letras dibujadas a mano para identidad y campaña.",
  ],
  Branding: [
    "Identidad tipográfica y sistemas de marca.",
    "Branding con foco en tipografía y voz visual.",
  ],
  "Diseño de Tipografía": [
    "Diseño de fuentes para editorial, marca y pantalla.",
    "Familias tipográficas a la medida y retail.",
  ],
  "Diseño Editorial": [
    "Diseño editorial y tipografía aplicada a publicaciones.",
    "Libros, revistas y piezas impresas con cuidado tipográfico.",
  ],
  Caligrafía: [
    "Caligrafía contemporánea para marca y piezas únicas.",
    "Trazo caligráfico para invitaciones, logos y arte.",
  ],
  "Ingeniería de Fuentes": [
    "Ingeniería tipográfica: producción, kerning y exportación.",
    "Soporte técnico para diseñadores de fuentes.",
  ],
  "Rotulación Manual": [
    "Rotulación a mano para fachadas y comercio local.",
    "Letreros y señalética con trazo manual.",
  ],
};

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickServicios(i: number): Servicio[] {
  const primary = SERVICIOS[i % SERVICIOS.length];
  if (i % 3 === 0) {
    const second = SERVICIOS[(i + 2) % SERVICIOS.length];
    return primary === second ? [primary] : [primary, second];
  }
  return [primary];
}

function makePlaceholder(
  estado: MexicoEstado,
  index: number,
  suffix: string,
): MockProfile {
  const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[(index * 3) % LAST_NAMES.length]}`;
  const servicios = pickServicios(index);
  const primary = servicios[0];
  const blurb =
    BLURBS[primary][index % BLURBS[primary].length] +
    ` Basada en ${estado}.`;
  return {
    slug: `${slugify(name)}-${slugify(estado)}-${suffix}`,
    name,
    estado,
    servicios,
    description: blurb,
    tier: index % 7 === 0 ? "pro" : "free",
    cover: coverFor(index),
    avatar: index % 11 === 0 ? "/mock/miguel-avatar.png" : null,
  };
}

function buildPlaceholders(): MockProfile[] {
  const out: MockProfile[] = [];
  let n = 0;

  // At least one placeholder per estado (including Fuera de México).
  for (const estado of MEXICO_ESTADOS) {
    out.push(makePlaceholder(estado, n, "base"));
    n += 1;
  }

  // Extra density in hubs.
  for (const { estado, count } of HUB_EXTRA) {
    for (let i = 0; i < count; i++) {
      out.push(makePlaceholder(estado, n, `hub${i}`));
      n += 1;
    }
  }

  return out;
}

export const MOCK_PROFILES: MockProfile[] = [
  ...FEATURED_REALISTIC,
  ...buildPlaceholders(),
];

export function mockFacetOptions(profiles: MockProfile[] = MOCK_PROFILES) {
  const servicios = new Set<string>();
  const estados = new Set<string>();
  for (const p of profiles) {
    for (const s of p.servicios) servicios.add(s);
    estados.add(p.estado);
  }
  // Prefer full taxonomy lists so empty states still appear in filters.
  return {
    servicios: [...SERVICIOS],
    estados: [...MEXICO_ESTADOS],
    usedServicios: [...servicios].sort((a, b) => a.localeCompare(b, "es")),
    usedEstados: [...estados].sort((a, b) => a.localeCompare(b, "es")),
  };
}
