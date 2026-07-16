/**
 * Mock profiles for the live directory UI.
 * Intentional dummy set (richer than the old Blowfish placeholders).
 * Hugo content/Directorio is not imported — keep iterating here until D1.
 */
import { MEXICO_ESTADOS, SERVICIOS, type MexicoEstado, type Servicio } from "./taxonomy";

export type MockTier = "free" | "pro";

export type MockProfileFont = {
  id: string;
  family: string;
  url: string;
  format: string;
};

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
  customCss?: string;
  customFonts?: MockProfileFont[];
}

const ROMINA_PIGEONETTE_FONT: MockProfileFont = {
  id: "pigeonette",
  family: "Pigeonette",
  url: "/media/profiles/user_romina/font/pigeonette.woff2",
  format: "woff2",
};

const ROMINA_THEME_CSS = [
  ".profile-card .bio-lead,",
  ".profile-detail .profile-bio > p:first-child {",
  "  font-family: 'Pigeonette', sans-serif;",
  "  font-size: 1.35rem;",
  "  line-height: 1.35;",
  "}",
  ".profile-detail .profile-bio {",
  "  font-family: 'Pigeonette', sans-serif;",
  "  font-size: 1.125rem;",
  "  line-height: 1.6;",
  "}",
  ".profile-detail .profile-bio h2 {",
  "  font-family: 'Pigeonette', sans-serif;",
  "  font-size: 1.5rem;",
  "}",
  ".profile-detail h1 {",
  "  font-family: 'Pigeonette', sans-serif;",
  "  letter-spacing: 0.02em;",
  "}",
].join("\n");

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
      "<p>Desde México, hago letras con amor y buen sazón. Tipografía a la medida, lettering e ingeniería en Tortilla.studio.</p><h2>Tipografía con raíz</h2><p>Trabajo con estudios, marcas y editoriales que buscan una voz tipográfica clara y con raíz mexicana — desde logotipos hasta familias completas para texto corrido, UI y packaging.</p><p>Me importa el oficio: boceto, revisión, kerning, pruebas en contexto real. Cada proyecto empieza con escucha y termina con archivos listos para producción.</p><h2>Colaboración</h2><p>Talleres, charlas y colaboraciones con el Colegio de Diseñadores, TMX y equipos creativos en CDMX y remoto. Si tienes un proyecto — editorial, marca o fuente propia — escríbeme.</p>",
    website: "https://tortilla.studio",
    tier: "pro",
    cover: "/mock/cover-warm.svg",
    avatar: null,
    customCss: ROMINA_THEME_CSS,
    customFonts: [ROMINA_PIGEONETTE_FONT],
  },
  {
    slug: "cristobal-henestrosa",
    name: "Cristóbal Henestrosa",
    estado: "Ciudad de México",
    servicios: ["Diseño de Tipografía", "Diseño Editorial"],
    description:
      "<p>Diseñador tipográfico y editorial. Fuentes para prensa, libros e identidad cultural mexicana.</p><h2>Editorial y prensa</h2><p>He diseñado tipos para periódicos, museos y sellos independientes. Me interesa la legibilidad, el detalle y la historia detrás de cada letra — cómo una familia tipográfica sostiene un tono editorial durante años.</p><p>Desde revistas culturales hasta catálogos de museo, busco sistemas que funcionen en titulares y en notas al pie con la misma voz.</p>",
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
      "<p>Lettering, caligrafía y tipografía para marcas. Proyectos de identidad con trazo propio.</p><h2>Marcas con carácter</h2><p>Desde Puebla trabajo con restaurantes, cervecerías y proyectos culturales que necesitan letras con carácter — mural, empaque o sistema completo.</p><p>El proceso mezcla boceto a mano, refinamiento digital y entrega lista para impresión o pantalla. Me gusta cuando la tipografía se siente hecha para ese negocio, no sacada de un catálogo.</p><p>Disponible para colaboraciones en México y remoto.</p>",
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
      "<p>Mexican type designer &amp; calligrapher. Fuentes y caligrafía para editorial e identidad.</p><h2>Caligrafía y fuentes</h2><p>Vivo entre proyectos editoriales y encargos de caligrafía para invitaciones, libros de artista y piezas de colección.</p><p>Investigo la relación entre trazo manual y sistemas tipográficos digitales — a veces la caligrafía guía una familia completa; otras, la fuente nace directo del lápiz.</p>",
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
      "<p>Diseño editorial y tipografía aplicada a libros, revistas y publicaciones independientes.</p><p>En Cuatro Ojos armamos publicaciones con ritmo, jerarquía y cuidado en cada página. Nos gusta el papel, la encuadernación y el detalle que se nota al hojear.</p>",
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
      "<p>Rotulación a mano y lettering para comercio local, fachadas y espacios públicos en Oaxaca.</p><p>Pintura, pincel y color para negocios de barrio, mercados y festivales. Cada letrero cuenta la historia del lugar.</p>",
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
      "<p>Identidad tipográfica, lettering y caligrafía para marcas culturales y editoriales.</p><h2>Sistema y voz</h2><p>Combino investigación, boceto y sistema para que la voz de una marca se sienta coherente en impreso y pantalla.</p><p>Proyectos recientes: festivales, sellos discográficos y identidad para espacios culturales en CDMX.</p><p>Trabajo en paquetes que incluyen logotipo, lettering, selección tipográfica y guías de uso para equipos internos.</p>",
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
      "<p>Rotulación manual para negocios, letreros y piezas de señalética con carácter local.</p><p>Trabajo con comercios de Puebla que quieren verse auténticos — sin plantillas, con letra hecha a mano.</p>",
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

const BLURB_MORE: Record<Servicio, string[]> = {
  Lettering: [
    "Colaboro con estudios de diseño y marcas que buscan letras con personalidad.",
    "Boceto, refinamiento y entrega para impreso y pantalla.",
  ],
  Branding: [
    "Investigo la voz de cada marca antes de dibujar la primera letra.",
    "Sistemas tipográficos para identidad en todos los puntos de contacto.",
  ],
  "Diseño de Tipografía": [
    "Familias a medida y ajustes finos para editorial y UI.",
    "Desde el concepto hasta los archivos listos para producción.",
  ],
  "Diseño Editorial": [
    "Maquetación, elección tipográfica y ritmo de lectura.",
    "Libros, revistas y catálogos con cuidado en cada página.",
  ],
  Caligrafía: [
    "Piezas únicas para invitaciones, logotipos y proyectos especiales.",
    "Tinta, pincel y digital para encargos editoriales y de marca.",
  ],
  "Ingeniería de Fuentes": [
    "Kerning, hinting y exportación para equipos de diseño.",
    "Soporte técnico para lanzar fuentes sin sorpresas.",
  ],
  "Rotulación Manual": [
    "Color, proporción y legibilidad para fachadas y señalética.",
    "Letreros pintados a mano para comercio y espacios públicos.",
  ],
};

function makePlaceholder(
  estado: MexicoEstado,
  index: number,
  suffix: string,
): MockProfile {
  const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[(index * 3) % LAST_NAMES.length]}`;
  const servicios = pickServicios(index);
  const primary = servicios[0];
  const lead =
    BLURBS[primary][index % BLURBS[primary].length] +
    ` Basada en ${estado}.`;
  const more = BLURB_MORE[primary][index % BLURB_MORE[primary].length];
  return {
    slug: `${slugify(name)}-${slugify(estado)}-${suffix}`,
    name,
    estado,
    servicios,
    description: `<p>${lead}</p><p>${more}</p>`,
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

export function getMockProfileBySlug(slug: string): MockProfile | undefined {
  return MOCK_PROFILES.find((p) => p.slug === slug);
}

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
