# UI prototypes (A–D)

During discovery UX work we compared four homepage filter patterns. **Option B is live** on `/`.

The others remain in the repo as clickable references (footer of those pages has a prototype strip):

| | Route | Idea |
|---|--------|------|
| **B (chosen)** | `/` | Simple header + filter bar; sticky stack; mobile Filtros + header crumbs; pink Limpiar when active |
| A | `/path/` | Path in dark header: `DIMELA › ubicación › servicio` |
| C | `/labeled/` | Explicit `Ubicación:` / `Servicio:` labels in header |
| D | `/trail/` | Second-row crumb trail with per-crumb × |

`/bar/` redirects to `/` for old links.

**Data:** prototypes share the same client grid pattern as `/` — prefer `/api/search` (D1), fall back to emitted `/data/profiles.json` from `src/data/mockProfiles.ts`.
