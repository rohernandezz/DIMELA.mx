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

## Next (build)

1. **Auth** — magic-link / email OTP
2. **Approval** — draft → pending_review → published
3. **Pro / Stripe** → cutover from Hugo

Profile **detail** pages and taxonomy **indexes** load from `/api/profile` and `/api/search` (D1). Static paths for details are generated from emitted `profiles.json` at build time.

## Notes

- Filters: `?q=&servicio=&estado=` (FilterBar → `/api/search`; falls back to `/data/profiles.json` in `astro dev`)
- Profile: `GET /api/profile?slug=`
- Destacados deferred
- Hugo `content/` remains in-repo as legacy reference only
- D1 scripts: `npm run db:migrate:remote` / `db:seed:remote` (see [architecture.md](architecture.md))
