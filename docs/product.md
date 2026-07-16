# Product

DIMELA.mx is a Spanish-language **directory** of Mexican lettering / type people. The Astro port turns it from a static Hugo catalog into a **small platform**: self-serve profiles, admin approval, Free vs Pro.

## Audience

- **Visitors** — find letristas by service, location, or name
- **Members** — create and maintain their own profile (`/editar/`)
- **Admins** — approve submissions (`/admin/`); later curate homepage Destacados

## Free vs Pro

| | Free | Pro |
|---|------|-----|
| Directory card | Scaled slightly smaller, softer border | Full cell, stronger border, Pro badge |
| Homepage | General grid only | Eligible for **Destacados** (admin-curated among Pro; not built yet) |
| Bio | TipTap → sanitized HTML | Same + richer blocks over time |
| Gallery | One simple gallery (capped) | Multiple named portfolio galleries |
| Styling | Site default only | **Custom CSS** scoped to card + profile (MySpace-like) |
| Billing | Free | Stripe subscription |

**Approval ≠ payment.** Paying for Pro unlocks tools; **admin approval** still gates public visibility (`published`).

### Profile lifecycle

```
draft → pending_review → published
                      ↘ rejected → (revise) → draft
```

Members can upgrade to Pro while still draft/pending so they can build the portfolio before going live.

Owner/admin **preview** of unpublished profiles is supported via `/api/profile` (working-tree; verify locally).

## Discovery UI

Two ways to find people (both stay):

### 1. Homepage / directorio FilterBar (primary) — **Option B, live on `/`**

- Text search (`q`)
- **Servicio** chips (multi-select)
- **Ubicación** multi-select
- Sticky bar (header + search); desktop full-bleed when collapsed sticky; pink **Limpiar** when active
- Shareable URL: `/?q=&servicio=Lettering,Branding&estado=Ciudad de México`
- Grid: `auto-fill` cards; page width capped at `96rem`; order randomized once per load

**Facet rule:** OR within a facet, AND across facets  
(e.g. Lettering *or* Branding, *and* CDMX if selected).

**Data today:** Directory grids, filters, taxonomy indexes, and profile detail pages load from Worker APIs over D1 (`/api/search`, `/api/profile`), with `profiles.json` as fallback.

Other filter UI experiments (A/C/D) are archived as routes — see [ui-prototypes.md](ui-prototypes.md).

### 2. Taxonomy browse (secondary)

| Route | Role |
|-------|------|
| `/servicios/` | Index of services + counts |
| `/servicios/[slug]/` | Locked to that service; still filter by estado + text |
| `/estado/` | Index of states + counts |
| `/estado/[slug]/` | Locked to that state; still filter by servicio + text |

Nav IA: Todo · Locación · Servicio · Acerca de · (member/admin entry points via `/editar/`, `/admin/`).

## Scale

Realistic ceiling for years: **~200 profiles**. Design for API filtering; soft pagination only if the unfiltered grid feels heavy. No Algolia planned.

## Auth (MVP live)

- Magic-link / email OTP (no passwords); link returned in API JSON until email is wired
- Session cookie `dm_session`; one profile per member (admin can edit any via queue)
- Claim flow for existing Hugo-seeded entries — still TBD
- Demo member: `romina@tortilla.studio` · Demo admin: `hola@dimela.mx`

## Out of scope (for now)

- Full social graph (follows, comments, activity feed)
- Arbitrary HTML/JS embeds on Free profiles
- Decap CMS / Netlify Identity
- Vendoring the Blowfish Hugo theme inside Astro
