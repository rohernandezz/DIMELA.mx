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
