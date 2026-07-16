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

## UI prototypes (kept for reference)

| Route | Option |
|-------|--------|
| `/` | **B · Filter bar (live)** |
| `/path/` | A · Path in header |
| `/labeled/` | C · Labeled path |
| `/trail/` | D · Crumb trail |
| `/bar/` | Redirects → `/` |

## Next (build)

1. **Taxonomy pages** — `/estado/`, `/servicios/` browse indexes over mock data
2. **D1 + `/api/search`** when ready for real persistence (still mock-first until then)
3. Auth → approval → Pro/Stripe → cutover

Profile cards link to `/directorio/[slug]/` (mock detail pages).

## Notes

- Filters: `?q=&servicio=&estado=` (client-side on mocks until API)
- Destacados deferred
- Hugo `content/` remains in-repo as legacy reference only
