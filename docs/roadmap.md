# Roadmap

Phased delivery on branch `AstroPort`. Commit and push each meaningful step.

## Done

- [x] Branch `AstroPort` from legacy Hugo/`Netlify`
- [x] Astro 7 scaffold + Tailwind v4 + Outpact
- [x] Cloudflare Worker + `wrangler.toml` (assets + `/api/*` stub)
- [x] Placeholder routes: home, directorio, estado, servicios, acerca-de, 404
- [x] README + docs
- [x] Homepage profile card mockup (Free / Pro / Destacados)
- [x] Single simple card grid (no Destacados section)
- [x] FilterBar mock (search + servicio/ubicación chips, URL sync)
- [x] Header path filter (logo › ubicación ▾ › servicio ▾ + search)
- [x] Compare homes A–D; develop **B (filter bar)** on `filter-bar-mobile`
- [x] Option B mobile: Filtros bottom sheet + compact header Menú

## Next

1. **Iterate Option B mobile/desktop** from feedback
2. **Promote B** to default `/` when locked in
3. **Content migration** — normalize Hugo `content/Directorio` → seed data / D1
4. **`/api/search`**, accounts, Pro/billing, cutover

## Notes

- Active UI work: branch `filter-bar-mobile`, review at `/bar/`
- Compare strip still links A–D on mock homes
- Shareable filters: `?q=&servicio=&estado=`
