# Architecture

## Current

```
Browser → Cloudflare Worker (worker.js)
              │
              ├─ GET /api/search  → D1 published profiles (fallback: profiles.json)
              ├─ /api/*           → JSON 501 stubs
              └─ other            → env.ASSETS → Astro dist/
```

1. `astro build` writes static HTML/CSS/JS to `dist/` (+ emits `public/data/profiles.json`)
2. `wrangler deploy` uploads the Worker + binds `dist/` as `[assets]` + D1 `DB`
3. `not_found_handling = "404-page"` serves Astro’s `404.html`
4. `run_worker_first = true` so API routes never get shadowed by static files

This matches the [sitioCelest](https://github.com/rohernandezz/sitioCelest) pattern: **no `@astrojs/cloudflare` adapter yet** — the Worker serves files and API handlers.

### Key files

| File | Role |
|------|------|
| `astro.config.mjs` | `site`, `output: "static"`, Tailwind Vite plugin |
| `wrangler.toml` | Worker name, assets dir, D1 binding, `run_worker_first` |
| `worker.js` | Fetch handler: `/api/search` + assets |
| `db/schema.sql` | D1 `profiles` table |
| `db/seed.sql` | Generated from mocks (`npm run emit:seed`) |
| `src/styles/global.css` | `@import "tailwindcss"` + `@theme` tokens |
| `src/layouts/BaseLayout.astro` | Shared shell, imports global CSS |

### Styling

- **Tailwind v4** via `@tailwindcss/vite` (no separate PostCSS config)
- Brand color + type: [docs/brand.md](brand.md) — tokens in `src/styles/global.css` `@theme`
- Font file: `public/fonts/Outpact-VF.woff2`

### Search API

- `GET /api/search?q=&servicio=&estado=`
- Prefers **D1** published rows (`source: "d1"`); falls back to `public/data/profiles.json` (`source: "mock"`)
- Live directory grids (`/`, `/directorio/`, taxonomy detail) are empty in HTML and filled client-side from this endpoint (one source of truth with filters)
- FilterBar falls back to filtering `/data/profiles.json` when the Worker API is unavailable (`astro dev`)
- Response: `{ ok, source, total, query, results }`

### D1

```bash
npm run db:migrate:remote   # schema
npm run db:seed:remote      # emit seed.sql + insert mocks as published
npm run db:migrate:local    # local wrangler D1
npm run db:seed:local
```

Database: `dimela-mx` bound as `DB` in `wrangler.toml`.

## Planned (platform)

When profiles become editable and paid tiers exist:

| Piece | Role |
|-------|------|
| **D1** | Users, profiles, galleries, subscriptions, approval status *(profiles table live)* |
| **R2** | Avatars, featured images, gallery uploads |
| **Worker `/api/*`** | Auth, profile CRUD, Stripe webhooks |
| **Astro** | Public pages; directory SSR may move to live data so approvals and Pro CSS appear without a full rebuild |

```
Create / edit profile  →  D1 + R2
Submit for approval    →  status = pending_review
Admin approve          →  status = published  →  visible in /api/search
Stripe Pro checkout    →  webhook  →  tier = pro (+ entitlements)
```

## Local vs production

| | Local | Production |
|---|--------|------------|
| UI | `npm run dev` (Astro; FilterBar falls back to client filter) | Worker + assets |
| API | `wrangler dev` (D1 local + assets) | Worker + D1 remote |
| Secrets | `.env` (gitignored) | `wrangler secret put …` |

See `.env.example` for planned secret names as they appear.
