# Product

DIMELA.mx is a Spanish-language **directory** of Mexican lettering / type people. The Astro port turns it from a static Hugo catalog into a **small platform**: self-serve profiles, admin approval, Free vs Pro.

## Audience

- **Visitors** — find letristas by service, location, or name
- **Members** — create and maintain their own profile
- **Admins** — approve submissions, curate homepage Destacados

## Free vs Pro

| | Free | Pro |
|---|------|-----|
| Directory card | Standard size, site styles | Larger card, Pro badge |
| Homepage | General grid only | Eligible for **Destacados** (admin-curated among Pro) |
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

## Discovery UI

Two ways to find people (both stay):

### 1. Homepage / directorio FilterBar (primary)

- Text search (`q`)
- **Servicio** chips (multi-select)
- **Ubicación** chips (multi-select)
- Clear filters
- Shareable URL: `/?q=&servicio=lettering,branding&estado=cdmx`

**Facet rule:** OR within a facet, AND across facets  
(e.g. Lettering *or* Branding, *and* CDMX if selected).

Backed by `/api/search` over **published** profiles only (not client show/hide of every card).

### 2. Taxonomy browse (secondary)

| Route | Role |
|-------|------|
| `/servicios/` | Index of services + counts |
| `/servicios/[slug]/` | Locked to that service; still filter by estado + text |
| `/estado/` | Index of states + counts |
| `/estado/[slug]/` | Locked to that state; still filter by servicio + text |

Nav keeps today’s IA: Todo · Locación · Servicio · Acerca de.

## Scale

Realistic ceiling for years: **~200 profiles**. Design for API filtering; soft pagination only if the unfiltered grid feels heavy. No Algolia planned.

## Auth (planned)

- Magic-link / email OTP (no passwords)
- One profile per member (admin can edit any)
- Claim flow for existing Hugo-seeded entries

## Out of scope (for now)

- Full social graph (follows, comments, activity feed)
- Arbitrary HTML/JS embeds on Free profiles
- Decap CMS / Netlify Identity
- Vendoring the Blowfish Hugo theme inside Astro
