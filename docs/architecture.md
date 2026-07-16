# Architecture

## Current

```
Browser → Cloudflare Worker (worker.js)
              │
              ├─ GET  /api/search                 → D1 published profiles
              ├─ GET  /api/profile?slug=          → published (+ owner/admin preview)
              ├─ POST /api/auth/request           → magic link (D1)
              ├─ GET  /api/auth/verify            → session cookie dm_session
              ├─ GET  /api/auth/me                → user + owned profile
              ├─ POST /api/auth/logout
              ├─ PUT  /api/me/profile             → save draft to D1
              ├─ POST /api/me/profile/submit      → pending_review
              ├─ POST /api/me/profile/upload      → R2 cover|avatar + D1 URL
              ├─ POST /api/me/profile/gallery/upload   → R2 gallery image
              ├─ POST|PUT|DELETE /api/me/profile/gallery → manage galleries
              ├─ DELETE /api/me/profile/gallery/image
              ├─ GET  /api/me/media/quota         → storage + Class A usage vs cap
              ├─ GET  /media/*                    → serve R2 objects
              ├─ GET  /api/admin/queue
              ├─ POST /api/admin/profiles/:slug/approve|reject
              └─ other → env.ASSETS → Astro dist/
                   (404 on /directorio/{slug}/ → rewrite to /directorio/ver/ shell)
```

1. `astro build` writes static HTML/CSS/JS to `dist/` (+ emits `public/data/profiles.json`)
2. `wrangler deploy` uploads the Worker + binds `dist/` as `[assets]` + D1 `DB` + R2 `MEDIA`
3. `not_found_handling = "404-page"` serves Astro’s `404.html`
4. `run_worker_first = true` so API / media routes never get shadowed by static files

This matches the [sitioCelest](https://github.com/rohernandezz/sitioCelest) pattern: **no `@astrojs/cloudflare` adapter yet** — the Worker serves files and API handlers.

### Key files

| File | Role |
|------|------|
| `astro.config.mjs` | `site`, `output: "static"`, Tailwind Vite plugin, `/api` + `/media` → `:8787` |
| `wrangler.toml` | Worker name, assets, D1 `DB`, R2 `MEDIA`, `run_worker_first` |
| `worker.js` | Fetch router + search/profile + asset rewrite |
| `worker/auth.js` | Magic link, session, member profile put/submit |
| `worker/admin.js` | Admin queue / approve / reject |
| `worker/media.js` | Cover/avatar upload + quota guard + `/media/*` serve |
| `worker/gallery.js` | Gallery upload + CRUD (Free/Pro caps) |
| `db/schema.sql` | D1 users, sessions, magic_links, profiles, media quota |
| `db/migrations/004_media_quota.sql` | `media_objects` + `media_quota` tables |
| `db/seed.sql` / `seed-auth.sql` | Mock profiles + demo member/admin |
| `src/styles/global.css` | `@import "tailwindcss"` + `@theme` tokens (`--max-width-dm-page: 96rem`) |
| `src/layouts/BaseLayout.astro` | Shared shell |

### Styling

- **Tailwind v4** via `@tailwindcss/vite` (no separate PostCSS config)
- Brand color + type: [docs/brand.md](brand.md) — tokens in `src/styles/global.css` `@theme`
- Font file: `public/fonts/Outpact-VF.woff2`

### Search + profiles

- `GET /api/search?q=&servicio=&estado=` — published only; prefers D1 (`source: "d1"`), else `profiles.json` (`source: "mock"`)
- Live grids (`/`, `/directorio/`, taxonomy detail) hydrate client-side from this endpoint
- Taxonomy indexes (`/estado/`, `/servicios/`) count from the same results
- `GET /api/profile?slug=` — published row (or mock); owner/admin may receive unpublished + `preview: true`
- Static detail paths from emitted `profiles.json` at build; D1-only slugs use Worker rewrite → `/directorio/ver/`
- FilterBar falls back to `/data/profiles.json` when the Worker API is unavailable (`astro dev` without `dev:api`)
- Response (search): `{ ok, source, total, query, results }`
- Response (profile): `{ ok, source, profile }` · optional `preview: true`

### Auth + editor (MVP)

- Magic link: `POST /api/auth/request` `{ email }` → D1 token, returns `verifyUrl` (email provider later)
- **Beta demo login:** `GET /api/auth/beta?demo=<key>` → session cookie, redirect (`/entrar/` UI). Keys: featured profile demos + `admin` (see `shared/demoAccounts.js`). Localhost always; remote needs `BETA_LOGIN=true` (+ optional `BETA_LOGIN_SECRET`, pass as `?key=` on `/entrar/`)
- `GET /api/auth/verify?token=` → sets `dm_session` HttpOnly cookie, redirects to `/editar/`
- `GET /api/auth/me` → session user + owned profile (any status)
- `PUT /api/me/profile` → create/update owned profile in D1
- `POST /api/me/profile/submit` → `status = pending_review`
- `POST /api/me/profile/upload` → multipart `kind` + `file` → R2; writes `/media/...` on `cover`/`avatar`
- `GET /api/me/media/quota` → platform storage + monthly Class A ops vs ~60% free-tier cap
- Demo: `romina@tortilla.studio` owns `romina-hernandez`; admin `hola@dimela.mx` (`db/seed-auth.sql`)

### R2 media

- Binding: `MEDIA` → bucket `dimela-mx-media` (`wrangler.toml`)
- `/editar/` Medios: cover + avatar file pickers (session required; profile row must exist)
- Allowed: JPEG/PNG/WebP/GIF · cover ≤ 5 MB · avatar ≤ 2 MB
- Keys: `profiles/{userId}/{cover|avatar}/{uuid}.{ext}`
- `GET /media/profiles/...` serves public bytes (relative URLs in D1)
- **Quota guard:** D1 `media_objects` tracks bytes per key; `media_quota` tracks monthly Class A ops. Uploads rejected at ~60% of R2 free tier (6 GB storage, 600k ops/month).
- Local `wrangler dev` simulates R2; remote deploy needs R2 enabled + bucket created
- Gallery: JSON on `profiles.galleries` — Free 1×12 imgs (3 MB); Pro 5×24 (5 MB); shown on profile detail

### D1

```bash
npm run db:migrate:local          # schema
npm run db:migrate:remote
npm run db:migrate:auth:local     # users / magic_links / sessions (+ owner columns)
npm run db:migrate:auth:remote
npm run db:migrate:media:local    # media_objects + media_quota
npm run db:migrate:media:remote
npm run db:migrate:gallery:local    # profiles.galleries + gallery media kind
npm run db:migrate:gallery:remote
npm run db:seed:remote
npm run db:seed:auth:local        # auth demo only
npm run db:seed:auth:remote
```

Database: `dimela-mx` bound as `DB` in `wrangler.toml`.

## Planned (platform)

| Piece | Role |
|-------|------|
| **D1** | Users, profiles, galleries, subscriptions *(core tables live)* |
| **R2** | Cover/avatar *(API live)*; gallery uploads next |
| **Email** | Send magic links (stop JSON `verifyUrl`) |
| **Stripe** | Pro checkout + webhooks → `tier = pro` |
| **Astro** | Public pages; optional live SSR later so Pro CSS / approvals need no rebuild |

```
Create / edit profile  →  D1 (+ R2 images)
Submit for approval    →  status = pending_review
Admin approve          →  status = published  →  visible in /api/search
Stripe Pro checkout    →  webhook  →  tier = pro (+ entitlements)
```

## Local vs production

| | Local | Production |
|---|--------|------------|
| UI | `npm run dev` (Astro; FilterBar falls back to client filter if no API) | Worker + assets |
| API | `npm run dev:api` (`wrangler` `:8787`) or `npm run dev:all` | Worker + D1 + R2 |
| Proxy | Vite proxies `/api` + `/media` → `:8787` | n/a |
| Secrets | `.env` (gitignored) | `wrangler secret put …` |

See `.env.example` for local stack notes and demo emails.
