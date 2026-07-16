# UI prototypes (A–D)

During discovery UX work we compared four homepage filter patterns. **Option B is live** on `/`.

The others remain in the repo as clickable references (footer of those pages has a prototype strip):

| | Route | Idea |
|---|--------|------|
| **B (chosen)** | `/` | Simple header + filter bar; mobile Filtros + header crumbs |
| A | `/path/` | Path in dark header: `DIMELA › ubicación › servicio` |
| C | `/labeled/` | Explicit `Ubicación:` / `Servicio:` labels in header |
| D | `/trail/` | Second-row crumb trail with per-crumb × |

`/bar/` redirects to `/` for old links.

**Data:** all of these use `src/data/mockProfiles.ts` — intentional dummy set (richer than the old Blowfish placeholders). Hugo `content/Directorio` is not imported yet.
