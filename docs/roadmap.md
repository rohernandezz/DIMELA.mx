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

## UI prototypes (kept for reference)

| Route | Option |
|-------|--------|
| `/` | **B · Filter bar (live)** |
| `/path/` | A · Path in header |
| `/labeled/` | C · Labeled path |
| `/trail/` | D · Crumb trail |
| `/bar/` | Redirects → `/` |

## Next (build)

1. **Wire homepage filters to `/api/search`** (optional; client mock still works)
2. **D1** — persist published profiles; point `/api/search` at SQL (`source: "d1"`)
3. Auth → approval → Pro/Stripe → cutover

Profile cards link to `/directorio/[slug]/` (mock detail pages).

## Notes

- Filters: `?q=&servicio=&estado=` (client-side on mocks; same shape on `/api/search`)
- Destacados deferred
- Hugo `content/` remains in-repo as legacy reference only
