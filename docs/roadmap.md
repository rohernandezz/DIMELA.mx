# Roadmap

Phased delivery. Canonical discovery UI is **Option B (filter bar)** on `/`.

## Done

- [x] Astro 7 + Tailwind + Outpact + Cloudflare Worker assets
- [x] Placeholder routes + docs
- [x] Profile cards (Free / Pro), mock directory grid
- [x] UI exploration A–D; **chose B**
- [x] Option B as default `/` (mobile crumbs, desktop chips)
- [x] Deploy preview: `dimela-mx.*.workers.dev`
- [x] Decision: keep `src/data/mockProfiles.ts` (better than old Blowfish dummy set); skip Hugo content import for now
- [x] Taxonomy browse — `/estado/`, `/servicios/` (+ `[slug]` detail) over mock data
- [x] Mock-first `/api/search` on the Worker (reads `public/data/profiles.json`)
- [x] Directory grid filled from `/api/search` (D1); same source as filters
- [x] D1 `profiles` table + seed from mocks; `/api/search` prefers D1 (`source: "d1"`)
- [x] Profile detail + taxonomy indexes from `/api/profile` and `/api/search`
- [x] Random grid order per page load (stable while filtering)

## UI prototypes (kept for reference)

| Route | Option |
|-------|--------|
| `/` | **B · Filter bar (live)** |
| `/path/` | A · Path in header |
| `/labeled/` | C · Labeled path |
| `/trail/` | D · Crumb trail |
| `/bar/` | Redirects → `/` |
| `/brand/` | Design playground (colors, type, UI samples) |
| `/editar/` | Draft member profile editor (no auth/save yet) |

## Next (build)

1. **Email provider** for magic links (stop returning `verifyUrl` in JSON)
2. **Admin approval UI** — pending_review → published / rejected
3. **R2 uploads** — cover / avatar / gallery
4. **Pro / Stripe** → cutover from Hugo

## Auth / editor

- [x] Magic-link auth (D1 sessions) + `/editar/` login
- [x] TipTap bio
- [x] `PUT /api/me/profile` + submit for review
- Demo: sign in as `romina@tortilla.studio`, open the magic link, edit & save

Profile **detail** pages and taxonomy **indexes** load from `/api/profile` and `/api/search` (D1). Static paths for details are generated from emitted `profiles.json` at build time.

## Notes

- Filters: `?q=&servicio=&estado=` (FilterBar → `/api/search`; falls back to `/data/profiles.json` in `astro dev`)
- Profile: `GET /api/profile?slug=`
- Destacados deferred
- Hugo `content/` remains in-repo as legacy reference only
- D1 scripts: `npm run db:migrate:remote` / `db:seed:remote` (see [architecture.md](architecture.md))
