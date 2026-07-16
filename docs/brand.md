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

## Colors

| Token | Hex | Tailwind | Role |
|-------|-----|----------|------|
| **Off-white** | `#e9ebee` | `dm-offwhite` | Page background; soft surfaces |
| **Off-black** | `#383636` | `dm-offblack` | Primary text; header/footer chrome; strong borders / active chips |
| **Pink** | `#f5c1df` | `dm-pink` | Accent — Pro badge, filter count badge, active **Limpiar** |
| **Blue** | `#e8f2fb` | `dm-blue` | Soft fill — card cover fallback, ubicación control |
| **Blue strong** | `#cde7fe` | `dm-blue-strong` | Stronger blue in gradients / covers |
| **Green** | `#d9f7d9` | `dm-green` | Accent (available; use sparingly) |

### Surfaces in practice

| Surface | Treatment |
|---------|-----------|
| Page | `bg-dm-offwhite` + `text-dm-offblack` |
| Header / footer | `bg-dm-offblack` + `text-dm-offwhite` (and `/70`–`/80` for muted links) |
| Cards / filter shell | White (`bg-white`) on off-white page; borders `border-dm-offblack/15`–`/35` |
| Selected filter chips | `bg-dm-offblack` + `text-dm-offwhite` |
| Interactive accent | Pink fill + off-black text; hover often flips to off-black + white |

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
}
```

Update this doc when tokens change.
