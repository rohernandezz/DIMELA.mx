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
- [x] Wire FilterBar to `GET /api/search` (client fallback when API unavailable)
- [x] D1 `profiles` table + seed from mocks; `/api/search` prefers D1 (`source: "d1"`)

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

Profile cards still SSR from mocks; search visibility is D1 (seeded). SSR pages can switch to D1/API later.

## Notes

- Filters: `?q=&servicio=&estado=` (FilterBar → `/api/search`; client filter fallback in `astro dev`)
- Destacados deferred
- Hugo `content/` remains in-repo as legacy reference only
- D1 scripts: `npm run db:migrate:remote` / `db:seed:remote` (see [architecture.md](architecture.md))
