# Hugo legacy (removed from tree)

The pre-Astro static site (Hugo + Blowfish + Netlify/Decap) was removed from this repo. Directory data is D1 (seeded from mocks). Live stack: Astro → Cloudflare Worker.

## What was removed

| Path | Was |
|------|-----|
| `content/` | Hugo markdown (Directorio + Acerca de) |
| `layouts/` | Blowfish overrides |
| `config/` | Hugo + Blowfish params, menus, taxonomies |
| `themes/blowfish` | Git submodule |
| `assets/`, `static/` | Theme CSS/JS, fonts (fonts live in `public/fonts/`) |
| `archetypes/`, `data/`, `resources/` | Hugo scaffold + image cache |
| `tailwind.config.js`, `.gitmodules` | Blowfish Tailwind v3 + submodule pointer |
| `netlify.toml` | Netlify Hugo build — removed earlier; see [cutover.md](cutover.md) |
| `.github/workflows/hugo.yaml` | GitHub Pages Hugo build — removed earlier |

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

That discovery model (filter vs explore) informs the current `DirectoryFilterBar` — see [product.md](product.md).

## Remaining cutover notes

- [x] Delete Hugo tree from this repo
- [x] Remove `netlify.toml`, Decap `static/admin/`, Hugo workflow — see [cutover.md](cutover.md)
- [x] Point DNS to Cloudflare Worker (`dimela.mx` live)
- [ ] Disable Netlify test site (optional) — [cutover.md](cutover.md)
