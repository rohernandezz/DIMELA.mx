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
4. `run_worker_first = true` so API / media routes never get shadowed by static files (also required for D1-only `/directorio/{slug}/` → `/directorio/ver/` rewrite)
5. `[cache] enabled = true` in `wrangler.toml` — [Workers Cache](https://developers.cloudflare.com/workers/cache/) sits in front of the Worker

This matches the [sitioCelest](https://github.com/rohernandezz/sitioCelest) pattern: **no `@astrojs/cloudflare` adapter yet** — the Worker serves files and API handlers.

### Caching

Workers Cache uses standard `Cache-Control` headers (no manual `caches.default` wrapper):

| Response | Cache-Control | Notes |
|----------|---------------|--------|
| Public `/api/search`, `/api/profile` (`publicJson`) | `public, max-age=60, stale-while-revalidate=300` | Edge hit skips Worker + D1; ~60s freshness |
| Auth / mutations / draft preview (`json`) | `no-store` | Never cached |
| `/_astro/*`, `/fonts/*` | `public, max-age=31536000, immutable` | Fingerprinted / static |
| HTML, `/data/*` | same short public TTL as APIs | Applied in `serveAssets` + `public/_headers` |
| Draft profile shell rewrite | `no-store` | Cookie alone does not bypass Workers Cache |

No purge-on-publish yet — short TTL is enough. Keep `run_worker_first = true` until D1-only profile URLs have another path (scoped `run_worker_first` would free most asset requests later).

### Quality / CI

| Command | Role |
|---------|------|
| `npm run lint` | ESLint flat config (`eslint.config.js`) — Astro + TS/JS |
| `npm run check` | `astro check` (strict TS) |
| `npm run test` | Vitest — pure helpers in `src/lib/*.test.ts`, `worker/slugs.test.js` |
| `npm run ci` | lint + check + test + build |

GitHub Actions: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs `npm run ci` on push/PR to `main`.

### Key files

| File | Role |
|------|------|
| `astro.config.mjs` | `site`, `output: "static"`, Tailwind Vite plugin, `/api` + `/media` → `:8787` |
| `wrangler.toml` | Worker name, assets, D1 `DB`, R2 `MEDIA`, `run_worker_first`, `[cache]` |
| `public/_headers` | Static asset Cache-Control (copied into `dist/` on build) |
| `worker.js` | Fetch router + search/profile + asset rewrite + asset cache headers |
| `worker/auth.js` | Magic link, session, member profile put/submit |
| `worker/admin.js` | Admin queue / approve / reject |
| `worker/media.js` | Cover/avatar upload + quota guard + `/media/*` serve |
| `worker/gallery.js` | Gallery upload + CRUD (Free/Pro caps) |
| `eslint.config.js` | Flat ESLint (Astro + typescript-eslint) |
| `vitest.config.ts` | Node Vitest for `src/**/*.test.ts`, `worker/**/*.test.js` |
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

### Auth + editor

- **Account hub:** `/cuenta/` — magic link, claim seeded profile, or start new profile
- Magic link: `POST /api/auth/request` `{ email, next? }` → sends email when Email Sending is configured (Workers Paid); otherwise returns `verifyUrl` in JSON for beta/local use
- Set `FORCE_EMAIL_ONLY=true` later to require real email and hide the link
- `GET /api/auth/verify?token=` → session cookie → redirects to `/cuenta/` (claim/create) or `/editar/` (has profile)
- `GET /api/auth/me` → user + owned profile + `claimable[]` (ownerless profiles with matching `invite_email`)
- `POST /api/me/profile/claim` `{ slug }` → attach seeded profile to session user
- `PUT /api/me/profile` → create/update owned profile (blocks create if claimable pending)
- **Beta demo login:** `/entrar/` + `GET /api/auth/beta` — enabled on staging via `BETA_LOGIN=true` in `wrangler.toml`. See [beta-launch.md](beta-launch.md) for the full turn-off checklist at launch.
- Admin can set `inviteEmail` on ownerless profiles via `PATCH /api/admin/profiles/:slug`
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
