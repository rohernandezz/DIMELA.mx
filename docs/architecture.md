# Architecture

## Current (scaffold)

```
Browser → Cloudflare Worker (worker.js)
              │
              ├─ /api/*  → JSON stub (501) for now
              └─ other   → env.ASSETS → Astro dist/
```

1. `astro build` writes static HTML/CSS/JS to `dist/`
2. `wrangler deploy` uploads the Worker + binds `dist/` as `[assets]`
3. `not_found_handling = "404-page"` serves Astro’s `404.html`
4. `run_worker_first = true` so API routes never get shadowed by static files

This matches the [sitioCelest](https://github.com/rohernandezz/sitioCelest) pattern: **no `@astrojs/cloudflare` adapter yet** — the Worker only serves files (and will grow API handlers).

### Key files

| File | Role |
|------|------|
| `astro.config.mjs` | `site`, `output: "static"`, Tailwind Vite plugin |
| `wrangler.toml` | Worker name, assets dir, `run_worker_first` |
| `worker.js` | Fetch handler: assets + `/api/*` placeholder |
| `src/styles/global.css` | `@import "tailwindcss"` + `@theme` tokens |
| `src/layouts/BaseLayout.astro` | Shared shell, imports global CSS |

### Styling

- **Tailwind v4** via `@tailwindcss/vite` (no separate PostCSS config)
- Brand color + type: [docs/brand.md](brand.md) — tokens in `src/styles/global.css` `@theme`
- Font file: `public/fonts/Outpact-VF.woff2`

## Planned (platform)

When profiles become editable and paid tiers exist, the edge stack grows:

| Piece | Role |
|-------|------|
| **D1** | Users, profiles, galleries, subscriptions, approval status |
| **R2** | Avatars, featured images, gallery uploads |
| **Worker `/api/*`** | Search/facets, magic-link auth, profile CRUD, Stripe webhooks |
| **Astro** | Public pages; directory listing may move to live data (SSR/hybrid) so approvals and Pro CSS appear without a full rebuild |

```
Create / edit profile  →  D1 + R2
Submit for approval    →  status = pending_review
Admin approve          →  status = published  →  visible in /api/search
Stripe Pro checkout    →  webhook  →  tier = pro (+ entitlements)
```

Exact hybrid vs static cut for profile pages will be decided when CMS work starts; discovery will use `/api/search` either way so filtering stays shareable and scalable (~200 profiles).

## Local vs production

| | Local | Production |
|---|--------|------------|
| UI | `npm run dev` (Astro) | Worker + assets |
| API | Not wired yet | Worker routes |
| Secrets | `.env` (gitignored) | `wrangler secret put …` |

See `.env.example` for planned secret names as they appear.
