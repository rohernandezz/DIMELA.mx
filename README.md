# DIMELA.mx

**Directorio Mexicano de Letristas** — directory of Mexican lettering, type, calligraphy, and related practices.

Astro 7 + Tailwind v4 on **Cloudflare Workers** + D1 (same pattern as [sitioCelest](https://github.com/rohernandezz/sitioCelest)). Live preview: [dimela-mx.ro-88c.workers.dev](https://dimela-mx.ro-88c.workers.dev).

> **Status:** Option B filter bar is live. Directory data comes from Worker APIs over D1 (with `profiles.json` fallback). Auth MVP, member editor (`/editar/` including R2 cover/avatar/gallery), and admin queue (`/admin/`) are working. Real email for magic links is next — see [docs/roadmap.md](docs/roadmap.md).

## Stack

| Layer | Choice |
|-------|--------|
| Site | Astro 7 (`output: "static"`) |
| CSS | Tailwind CSS v4 (`@tailwindcss/vite`) + Outpact VF |
| Deploy | `astro build` → `dist/` → Cloudflare Worker `[assets]` |
| Data | Cloudflare D1 (`dimela-mx`) · `profiles.json` fallback |
| Media | R2 `MEDIA` → `dimela-mx-media` (cover/avatar; Worker `/media/*`) |
| Auth | Magic-link OTP → `dm_session` (link in JSON until email provider) |
| Planned pay | Stripe Checkout (Pro) |

## Setup

```bash
npm install
npm run dev:all          # Worker API :8787 + Astro (recommended)
# or two terminals:
#   npm run dev:api      # wrangler + D1 on :8787
#   npm run dev          # Astro; Vite proxies /api → :8787
```

Open the URL Astro prints (usually `http://localhost:4321`).

**Node:** `>=22.12.0`

Demo logins (after D1 seed): member `romina@tortilla.studio` → `/editar/` · admin `hola@dimela.mx` → `/admin/`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Astro dev (+ emit profiles); `/api` proxied to `:8787` |
| `npm run dev:api` | Wrangler Worker + local D1 on `:8787` |
| `npm run dev:all` | API + Astro together |
| `npm run build` | Emit profiles + build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build + `wrangler deploy` |
| `npm run db:migrate:local` / `:remote` | Apply D1 schema |
| `npm run db:migrate:media:local` / `:remote` | Apply media quota tables |
| `npm run db:migrate:tags:local` / `:remote` | Add searchable `tags` columns |
| `npm run db:seed:local` / `:remote` | Seed profiles + auth demos |
| `npm run astro` | Astro CLI passthrough |

## Repo layout

```
DIMELA.mx/
├── src/
│   ├── pages/                 # FILE = URL
│   │   ├── index.astro        # → /  (Option B filter bar)
│   │   ├── editar/            # → /editar/  (member editor)
│   │   ├── admin/             # → /admin/   (approval queue)
│   │   ├── brand/             # → /brand/   (design playground)
│   │   ├── directorio/        # → /directorio/ + [slug] + ver
│   │   ├── estado/            # → /estado/
│   │   └── servicios/         # → /servicios/
│   ├── layouts/BaseLayout.astro
│   ├── components/            # Header, FilterBar, ProfileCard, …
│   └── styles/global.css      # Tailwind entry + theme tokens
├── public/                    # fonts, favicon, emitted profiles.json
├── worker.js                  # Cloudflare entry (API + assets)
├── worker/                    # auth, admin, media (R2)
├── db/                        # D1 schema + seeds
├── wrangler.toml
└── docs/                      # Product & architecture notes
```

**Mental model:** Astro builds HTML/CSS/JS into `dist/`. The Worker serves those files and handles `/api/*` (+ `/media/*`). Client pages hydrate directory/profile data from the API.

### Location search aliases

The **Ubicación** autocomplete in `src/components/DirectoryFilterBar.astro` uses the central alias map in `src/data/locationAliases.ts`. Matching ignores accents and case; for example, `cdmx` → Ciudad de México, `edomex` → Estado de México, `guadalajara` → Jalisco, and `monterrey` → Nuevo León.

To add an alias, edit `LOCATION_ALIASES` with `alias: "Canonical estado"`, using the exact estado string from `MEXICO_ESTADOS` in `src/data/taxonomy.ts`. URL slugs such as `cdmx` and `edomex` are configured separately in `src/lib/slugs.ts`; location aliases only affect filter text search.

### Profile tags (searchable)

Curated subespecialidades live in `src/data/tags.ts` (keep `worker/tags.js` in sync). They are editable in `/editar/`, shown as dashed pills on cards/detail, and matched by directory search `q` — they are **not** filter chips. Cap is 8 per profile. Local migrate: `npm run db:migrate:tags:local` (also included in `db:sync:local`).

## Docs

| Doc | What’s in it |
|-----|----------------|
| [docs/architecture.md](docs/architecture.md) | Worker routes, D1/R2, local vs prod |
| [docs/beta-launch.md](docs/beta-launch.md) | Dev/beta toggles — turn off at public launch |
| [docs/brand.md](docs/brand.md) | Colors + Outpact type tokens |
| [docs/product.md](docs/product.md) | Free/Pro, approval, discovery UI |
| [docs/roadmap.md](docs/roadmap.md) | Done / in progress / next |
| [docs/ui-prototypes.md](docs/ui-prototypes.md) | Filter UI A–D; B is live |
| [docs/hugo-legacy.md](docs/hugo-legacy.md) | Pre-Astro static site notes (tree removed) |

## Deploy (Cloudflare)

Requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged in (`npx wrangler login`).

```bash
npm run deploy
```

Worker name: `dimela-mx` (see `wrangler.toml`). Custom domain and secrets land later with email/billing.

## Branching

| Branch | Role |
|--------|------|
| `filter-bar-mobile` (typical) | Active Astro work |
| `Netlify` | Retired Netlify deploy (see [cutover.md](docs/cutover.md)) |

## License / contact

Site contact: [hola@dimela.mx](mailto:hola@dimela.mx)  
Built with care at [tortilla.studio](https://tortilla.studio)
