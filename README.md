# DIMELA.mx

**Directorio Mexicano de Letristas** — directory of Mexican lettering, type, calligraphy, and related practices.

This branch (`AstroPort`) ports the site from Hugo/Blowfish to **Astro + Tailwind**, deployed on **Cloudflare Workers** (same pattern as [sitioCelest](https://github.com/rohernandezz/sitioCelest)).

> **Status:** Option B filter bar is the live homepage on Cloudflare Workers. Directory still uses mock profiles (`src/data/mockProfiles.ts`). Auth, D1, and Pro come next — see [docs/roadmap.md](docs/roadmap.md). UI A/C/D kept as prototypes ([docs/ui-prototypes.md](docs/ui-prototypes.md)).

## Stack

| Layer | Choice |
|-------|--------|
| Site | Astro 7 (`output: "static"` for now) |
| CSS | Tailwind CSS v4 (`@tailwindcss/vite`) + Outpact VF |
| Deploy | `astro build` → `dist/` → Cloudflare Worker `[assets]` |
| Directory data (now) | `src/data/mockProfiles.ts` + taxonomy constants |
| Planned data | Cloudflare D1 (profiles), R2 (images) |
| Planned auth / pay | Magic-link OTP, Stripe Checkout (Pro) |

Hugo content under `content/` is still in the repo as legacy reference. Do not rely on Hugo scripts.

## Setup

```bash
npm install
npm run dev
```

Open the URL Astro prints (usually `http://localhost:4321`).

**Node:** `>=22.12.0`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local Astro dev server |
| `npm run build` | Build static site → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build + `wrangler deploy` |
| `npm run astro` | Astro CLI passthrough |

## Repo layout

```
DIMELA.mx/
├── src/
│   ├── pages/                 # FILE = URL
│   │   ├── index.astro        # → /
│   │   ├── acerca-de.astro    # → /acerca-de/
│   │   ├── 404.astro
│   │   ├── directorio/        # → /directorio/
│   │   ├── estado/            # → /estado/
│   │   └── servicios/         # → /servicios/
│   ├── layouts/BaseLayout.astro
│   ├── components/            # Header, Footer, … (FilterBar next)
│   └── styles/global.css      # Tailwind entry + theme tokens
├── public/                    # Copied as-is into dist/ (fonts, favicon)
├── worker.js                  # Cloudflare entry (assets + /api/* stubs)
├── wrangler.toml
├── content/                   # Legacy Hugo markdown (to migrate)
├── layouts/                   # Legacy Hugo overrides (to remove later)
├── config/                    # Legacy Hugo config (to remove later)
└── docs/                      # Product & architecture notes
```

**Mental model:** Astro builds HTML/CSS/JS into `dist/` at compile time. The Worker serves those files. `/api/*` is reserved on the Worker for search, auth, and billing later — it does not render pages today.

## Docs

| Doc | What’s in it |
|-----|----------------|
| [docs/architecture.md](docs/architecture.md) | Astro + Worker deploy, planned D1/R2 |
| [docs/product.md](docs/product.md) | Free/Pro tiers, approval flow, discovery UI |
| [docs/roadmap.md](docs/roadmap.md) | Phased delivery / what’s next |
| [docs/ui-prototypes.md](docs/ui-prototypes.md) | Filter UI A–D; B is live |
| [docs/hugo-legacy.md](docs/hugo-legacy.md) | Old Hugo/Netlify/Decap bits still in-tree |

## Deploy (Cloudflare)

Requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged in (`npx wrangler login`).

```bash
npm run deploy
```

Worker name: `dimela-mx` (see `wrangler.toml`). Custom domain and secrets land later with auth/billing.

## Branching

| Branch | Role |
|--------|------|
| `AstroPort` | Active Astro rewrite |
| `Netlify` | Legacy Hugo site (production until cutover) |

## License / contact

Site contact: [hola@dimela.mx](mailto:hola@dimela.mx)  
Built with care at [tortilla.studio](https://tortilla.studio)
