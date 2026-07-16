# Roadmap

Phased delivery. Canonical discovery UI is **Option B (filter bar)** on `/`.  
Preview: `https://dimela-mx.ro-88c.workers.dev` · branch often `filter-bar-mobile`.

## Done

- [x] Astro 7 + Tailwind v4 + Outpact + Cloudflare Worker assets
- [x] Option B as default `/` — sticky header+search; desktop full-bleed sticky; pink **Limpiar** when filters active
- [x] Profile cards — Pro full cell + badge; Free scaled (~98%×96%); `auto-fill` grid; page max `96rem`
- [x] UI exploration A–D; **chose B** (A/C/D kept as prototype routes)
- [x] Taxonomy browse — `/estado/`, `/servicios/` (+ `[slug]` detail with facet locks)
- [x] D1 `profiles` (+ auth tables) · seed from mocks · `/api/search` prefers D1 (`source: "d1"`)
- [x] Grids / indexes / details from Worker APIs; `/data/profiles.json` fallback
- [x] `GET /api/search`, `GET /api/profile?slug=`
- [x] Random grid order once per page load (stable while filtering)
- [x] `/brand/` design playground
- [x] Magic-link auth MVP → `dm_session` cookie; D1 `users` / `magic_links` / `sessions`
- [x] Profile ownership + statuses `draft` | `pending_review` | `published` | `rejected`
- [x] Member APIs: auth request/verify/me/logout; `PUT /api/me/profile`; `POST /api/me/profile/submit`
- [x] TipTap bio on `/editar/`
- [x] Admin queue `/admin/` — approve / reject
- [x] Demo users: member `romina@tortilla.studio` → `romina-hernandez`; admin `hola@dimela.mx`
- [x] Magic link returned in JSON (no email provider yet)
- [x] **Unpublished profile preview** — owner/admin via `/api/profile` (`preview: true`); Worker rewrites missing `/directorio/{slug}/` → `/directorio/ver/` shell
- [x] **R2 cover / avatar** — `POST /api/me/profile/upload`, `GET /media/*`, binding `MEDIA` → `dimela-mx-media`, `/editar/` Medios wired
- [x] **R2 free-tier quota guard** — D1 tracks storage + Class A ops; uploads blocked at ~60% of free tier; `GET /api/me/media/quota`
- [x] **Gallery uploads** — Free: 1 galería × 12 imgs; Pro: 5 galerías × 24 imgs; R2 + JSON on `profiles.galleries`

## UI prototypes (kept for reference)

| Route | Option |
|-------|--------|
| `/` | **B · Filter bar (live)** |
| `/path/` | A · Path in header |
| `/labeled/` | C · Labeled path |
| `/trail/` | D · Crumb trail |
| `/bar/` | Redirects → `/` |
| `/brand/` | Design playground |
| `/editar/` | Member editor (auth + save + R2 cover/avatar) |
| `/admin/` | Approval queue |

## Next

1. **Email Sending** — paused (needs Workers Paid). Using beta magic links in UI for now.
2. **Pro / Stripe**
3. Homepage **Destacados** (admin-curated among Pro; deferred)

## Auth / accounts (done)

- [x] `/cuenta/` hub — magic link, claim, create
- [x] Profile claim via `invite_email` + `POST /api/me/profile/claim`
- [~] Production email — deferred until Workers Paid; API returns verify link when email unavailable
- [x] Beta `/entrar/` + Dev menu on staging (`BETA_LOGIN`) — turn off at launch: [beta-launch.md](beta-launch.md)

## Cutover (in progress)

- [x] Remove Decap `static/admin/`, `netlify.toml`, GitHub Pages workflow
- [ ] Netlify dashboard: disable test site if still running — [cutover.md](cutover.md)
- [ ] Public launch: disable Dev/beta toggles — [beta-launch.md](beta-launch.md)

## WIP / open questions

- **Profile tags** (subespecialidades under services) — in trial: searchable via `q`, not filter chips; UI may change or be removed. See README “Profile tags”.

## Notes

- Filters: `?q=&servicio=&estado=` (FilterBar → `/api/search`; falls back to `/data/profiles.json` when API unavailable)
- Profile: `GET /api/profile?slug=` (published; owner/admin may get unpublished + `preview`)
- Local: `npm run dev:api` + `npm run dev`, or `npm run dev:all` (Vite proxies `/api` + `/media` → `:8787`)
- D1: `dimela-mx` · R2: `dimela-mx-media` (`MEDIA`) · scripts in [architecture.md](architecture.md)
- [x] Remove legacy static site tree — see [hugo-legacy.md](hugo-legacy.md)
