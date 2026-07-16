# Cutover: Netlify / Hugo → Cloudflare

`dimela.mx` serves the Astro Worker site. The old Hugo + Decap stack on Netlify was a test deploy — **no legacy URL redirects needed**.

## Done in repo (main)

- **Removed:** `netlify.toml` (Hugo build), Decap `static/admin/`, GitHub Pages Hugo workflow
- **Removed:** Hugo tree (`content/`, `layouts/`, `config/`, theme submodule, etc.) — see [hugo-legacy.md](hugo-legacy.md)
- **Admin:** `/admin/` is the Astro approval queue (magic-link auth), not Decap

## Manual steps (Netlify dashboard)

1. **Disable or delete** the Netlify site (`dimela.netlify.app`) — optional; it was test-only
2. **Netlify Identity** — disable if still enabled (was for Decap CMS)

No redirect rules required on Cloudflare unless you later point an old URL somewhere specific.

## Deploy

```bash
npm run deploy
```
