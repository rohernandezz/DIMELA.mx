# Roadmap

Phased delivery on branch `AstroPort`. Commit and push each meaningful step.

## Done

- [x] Branch `AstroPort` from legacy Hugo/`Netlify`
- [x] Astro 7 scaffold + Tailwind v4 + Outpact
- [x] Cloudflare Worker + `wrangler.toml` (assets + `/api/*` stub)
- [x] Placeholder routes: home, directorio, estado, servicios, acerca-de, 404
- [x] README + docs
- [x] Homepage profile card mockup (Free / Pro / Destacados)

## Next

1. **FilterBar visual prototype** — homepage search + servicio/ubicación chips with mock data (for design review)
2. **Iterate card UI** from mockup feedback
3. **Content migration** — normalize Hugo `content/Directorio` → seed data / D1; preserve URL slugs
4. **`/api/search`** — real faceted search over published profiles
5. **Accounts** — magic-link auth, create/edit TipTap, submit for approval, admin queue
6. **Galleries + Pro** — R2 uploads, multi-gallery, custom CSS sandbox, Stripe
7. **Cutover** — custom domain, redirects from Netlify, retire Decap/Hugo

## Notes for implementers

- Keep Hugo trees (`content/`, `layouts/`, `config/`, `themes/`) until migration is verified, then delete.
- Prefer shareable filter URLs early — even the prototype can sync chips to `?q=&servicio=&estado=`.
- Destacados on the homepage are **admin-curated among Pro**, not automatic for every paid account.
