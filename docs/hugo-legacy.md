# Hugo legacy (still in this repo)

Until DNS cutover, several Hugo/Netlify artifacts remain. They are **not** used by `npm run dev` / `npm run build` on the Astro Worker site. Directory content today is D1 (seeded from mocks), not Hugo markdown.

## What remains

| Path | Was | Status |
|------|-----|--------|
| `content/` | Hugo markdown (Directorio + Acerca de) | Legacy reference; claim/migrate later |
| `layouts/` | Blowfish overrides (cards, avatars, home) | Reference for UI port; do not edit for production |
| `config/` | Hugo + Blowfish params, menus, taxonomies | Reference for servicios/estado lists and nav |
| `themes/blowfish` | Git submodule | Often uninitialized locally; CI used to fetch it |
| `assets/`, `static/` | Theme CSS/JS, Decap `/admin`, fonts | Fonts copied to `public/fonts/`; Decap admin retired by Astro `/admin/` |
| `netlify.toml` | Netlify Hugo build | Legacy deploy |
| `.github/workflows/hugo.yaml` | GitHub Pages Hugo build | Legacy |

## Old production

- Branch: `Netlify`
- Host: Netlify (`dimela.netlify.app`)
- CMS: Decap + Netlify Identity (`static/admin/`)
- Search: Fuse.js + `/index.json` (Blowfish)
- CSS: Tailwind via Blowfish CLI → `assets/css/compiled/main.css`

## Pre-Blowfish prototype

Tree around `53e2c0d` had a custom filter UI:

- Chip filters for servicios (`filter-and.js`)
- Separate “explorar” link bars for servicio / estado
- Estado chip filter unfinished

That discovery model (filter vs explore) informs the new `DirectoryFilterBar` — see [product.md](product.md).

## Removal checklist (after cutover)

- [ ] Delete Hugo `layouts/`, `config/`, `themes/`, `archetypes/`, `data/`, `resources/`
- [ ] Delete or archive `content/` (D1 is already live source; claim/import from Hugo TBD)
- [ ] Remove `netlify.toml`, Decap `static/admin/`, Hugo workflow
- [ ] Remove `.gitmodules` / Blowfish submodule
- [ ] Point DNS to Cloudflare Worker; shut down Netlify site
