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

## Next

1. **Iterate FilterBar + cards** from visual feedback
2. **Content migration** — normalize Hugo `content/Directorio` → seed data / D1; preserve URL slugs
3. **`/api/search`** — real faceted search over published profiles
4. **Accounts** — magic-link auth, create/edit TipTap, submit for approval, admin queue
5. **Galleries + Pro** — R2 uploads, multi-gallery, custom CSS sandbox, Stripe
6. **Cutover** — custom domain, redirects from Netlify, retire Decap/Hugo

## Notes for implementers

- Keep Hugo trees (`content/`, `layouts/`, `config/`, `themes/`) until migration is verified, then delete.
- Prefer shareable filter URLs early — even the prototype can sync chips to `?q=&servicio=&estado=`.
- Homepage Destacados section is deferred; Pro is marked on cards for now.
