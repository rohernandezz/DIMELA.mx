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

## In progress (working tree)

- [ ] **Local / unpublished profile preview** — owner/admin can load draft|pending|rejected via `/api/profile` (`preview: true`); Worker rewrites missing `/directorio/{slug}/` → `/directorio/ver/` client shell. Landing on this branch; verify on `:8787` for new slugs (e.g. `try1`).

## Recently landed (working tree)

- [x] **R2 cover / avatar** — `POST /api/me/profile/upload`, `GET /media/*`, binding `MEDIA` → `dimela-mx-media`, `/editar/` Medios wired. Gallery not started. Remote bucket needs R2 enabled in Dashboard then `wrangler r2 bucket create dimela-mx-media`.

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

1. **Gallery uploads** (R2 + schema; Free/Pro caps)
2. **Email provider** for magic links (stop returning `verifyUrl` in JSON)
3. Finish / harden unpublished profile preview locally + on deploy
4. **Pro / Stripe** → cutover from Hugo
5. Homepage **Destacados** (admin-curated among Pro; deferred)

## Notes

- Filters: `?q=&servicio=&estado=` (FilterBar → `/api/search`; falls back to `/data/profiles.json` when API unavailable)
- Profile: `GET /api/profile?slug=` (published; owner/admin may get unpublished + `preview`)
- Local: `npm run dev:api` + `npm run dev`, or `npm run dev:all` (Vite proxies `/api` + `/media` → `:8787`)
- D1: `dimela-mx` · R2: `dimela-mx-media` (`MEDIA`) · scripts in [architecture.md](architecture.md)
- Hugo `content/` remains in-repo as legacy reference only
