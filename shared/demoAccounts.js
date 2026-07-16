/**
 * Seeded beta/demo logins — keep in sync with db/seed-auth.sql.
 * Keys are `?demo=` values for GET /api/auth/beta.
 */
export const DEMO_ACCOUNTS = {
  romina: {
    email: "romina@tortilla.studio",
    label: "Romina Hernández",
    role: "member",
    slug: "romina-hernandez",
    next: "/editar/",
    blurb: "Miembro · edita el perfil romina-hernandez",
  },
  cristobal: {
    email: "demo.cristobal@dimela.mx",
    label: "Cristóbal Henestrosa",
    role: "member",
    slug: "cristobal-henestrosa",
    next: "/editar/",
    blurb: "Miembro · edita el perfil cristobal-henestrosa",
  },
  miguel: {
    email: "demo.miguel@dimela.mx",
    label: "Miguel Contreras",
    role: "member",
    slug: "miguel-contreras",
    next: "/editar/",
    blurb: "Miembro · edita el perfil miguel-contreras",
  },
  cecilia: {
    email: "demo.cecilia@dimela.mx",
    label: "Cecilia del Castillo",
    role: "member",
    slug: "cecilia-del-castillo",
    next: "/editar/",
    blurb: "Miembro · edita el perfil cecilia-del-castillo",
  },
  antonio: {
    email: "demo.antonio@dimela.mx",
    label: "Antonio Mejía Lechuga",
    role: "member",
    slug: "antonio-mejia-lechuga",
    next: "/editar/",
    blurb: "Miembro · edita el perfil antonio-mejia-lechuga",
  },
  giovanni: {
    email: "demo.giovanni@dimela.mx",
    label: "Giovanni Bautista",
    role: "member",
    slug: "giovanni-bautista",
    next: "/editar/",
    blurb: "Miembro · edita el perfil giovanni-bautista",
  },
  mara: {
    email: "demo.mara@dimela.mx",
    label: "Mara Osman",
    role: "member",
    slug: "mara-osman",
    next: "/editar/",
    blurb: "Miembro · edita el perfil mara-osman",
  },
  sandra: {
    email: "demo.sandra@dimela.mx",
    label: "Sandra Morales",
    role: "member",
    slug: "sandra-morales",
    next: "/editar/",
    blurb: "Miembro · edita el perfil sandra-morales",
  },
  admin: {
    email: "hola@dimela.mx",
    label: "Admin DIMELA",
    role: "admin",
    slug: null,
    next: "/admin/",
    blurb: "Admin · cola de aprobación",
  },
};
