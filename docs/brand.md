# Brand — color & type

Canonical tokens live in `src/styles/global.css` (`@theme`). Use Tailwind classes like `bg-dm-pink` / `text-dm-offblack` — do not hardcode hex in components unless extending the theme.

## Type

| | |
|---|---|
| **Family** | **Outpact** (variable font) |
| **CSS name** | `OutpactVF` |
| **File** | `public/fonts/Outpact-VF.woff2` |
| **Weights** | 100–900 (single VF file) |
| **Stack** | `"OutpactVF", ui-sans-serif, system-ui, sans-serif` |
| **Default** | Site-wide via `--font-sans` / `font-sans` on `html` |

Outpact is the Tortilla / DIMELA display-sans used across the product — brand lockups, UI chrome, and body. Prefer weight + tracking (e.g. logo `tracking-wide`, facet labels `uppercase` + `tracking-wide`) over introducing a second family.

### Never synthesize missing faces

Browsers must **not** fake bold or italic when a font does not provide that face.

| Rule | Implementation |
|------|----------------|
| No synthetic bold / italic | `font-synthesis: none` on `html` in `global.css` |
| No italic presentation by default | `em, i { font-style: normal; }` until a real italic face exists |
| Bio editor | TipTap `bold` / `italic` marks disabled; sanitize strips `<strong>` / `<b>` / `<em>` / `<i>` tags (keeps text) |
| Italics (later) | Toolbar **Itálicas** button stays in `/editar/` but **disabled** until we ship a real italic face + re-enable TipTap italic |

**Do not** use browser-faked bold for hierarchy on custom / Pro fonts. Use a weight the file actually contains (Outpact VF exposes 100–900), or size / color / tracking.

When italics return: load an italic face (or VF italic axis), then re-enable TipTap italic and the toolbar button — still keep `font-synthesis: none`.

## Colors

| Token | Hex | Tailwind | Role |
|-------|-----|----------|------|
| **Off-white** | `#e9ebee` | `dm-offwhite` | Page background; soft surfaces |
| **Off-black** | `#383636` | `dm-offblack` | Primary text; header/footer chrome; strong borders / active chips |
| **Pink** | `#f5c1df` | `dm-pink` | Accent — Pro badge, filter count badge, active **Limpiar** |
| **Blue** | `#e8f2fb` | `dm-blue` | Soft fill — card cover fallback, ubicación control |
| **Blue strong** | `#cde7fe` | `dm-blue-strong` | Stronger blue in gradients / covers |
| **Green** | `#d9f7d9` | `dm-green` | Accent (available; use sparingly) |
| **Red** | `#e82525` | `dm-red` | Errors — validation, required fields |

### Surfaces in practice

| Surface | Treatment |
|---------|-----------|
| Page | `bg-dm-offwhite` + `text-dm-offblack` |
| Header / footer | `bg-dm-offblack` + `text-dm-offwhite` (and `/70`–`/80` for muted links) |
| Cards / filter shell | White (`bg-white`) on off-white page; borders `border-dm-offblack/15`–`/35` |
| Selected filter chips | `bg-dm-offblack` + `text-dm-offwhite` |
| Interactive accent | Pink fill + off-black text; hover often flips to off-black + white |
| Errors | `text-dm-red`, invalid borders `border-dm-red`, banners `bg-dm-red/10` |

Opacity modifiers (`/15`, `/45`, `/60`, …) are part of the system for hierarchy — prefer those over new greys.

## Source of truth

```css
/* src/styles/global.css */
@theme {
  --font-sans: "OutpactVF", ui-sans-serif, system-ui, sans-serif;
  --color-dm-offwhite: #e9ebee;
  --color-dm-offblack: #383636;
  --color-dm-pink: #f5c1df;
  --color-dm-blue: #e8f2fb;
  --color-dm-blue-strong: #cde7fe;
  --color-dm-green: #d9f7d9;
  --color-dm-red: #e82525;
}

html {
  font-synthesis: none; /* never fake bold/italic */
}
```

Update this doc when tokens or type rules change.
