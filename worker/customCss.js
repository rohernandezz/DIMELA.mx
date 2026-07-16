/**
 * Pro custom CSS — sanitize + scope to profile card/detail.
 */

const MAX_CSS_BYTES = 8 * 1024;

export function sanitizeCustomCss(raw) {
  let css = String(raw || "").trim();
  if (!css) return "";
  if (css.length > MAX_CSS_BYTES) {
    css = css.slice(0, MAX_CSS_BYTES);
  }
  return css
    .replace(/<[^>]+>/g, "")
    .replace(/@import[\s\S]*?;/gi, "")
    .replace(/@font-face[\s\S]*?\}/gi, "")
    .replace(/@charset[\s\S]*?;/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/behavior\s*:/gi, "")
    .replace(/-moz-binding\s*:/gi, "")
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, "url(blocked:");
}

/** Prefix selectors so rules only apply under [data-profile-theme="slug"]. */
export function scopeCustomCss(slug, css) {
  const safe = sanitizeCustomCss(css);
  if (!safe.trim()) return "";

  const scope = `[data-profile-theme="${String(slug).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`;

  return safe.replace(/(^|})\s*([^@/{][^{]*)\{/g, (match, brace, selectors) => {
    const trimmed = selectors.trim();
    if (!trimmed) return match;
    const scoped = trimmed
      .split(",")
      .map((sel) => {
        const s = sel.trim();
        if (!s) return s;
        if (!/\.profile-(card|detail)/.test(s)) return s;
        return `${scope} ${s}`;
      })
      .join(", ");
    return `${brace} ${scoped} {`;
  });
}

export function buildFontFaceCss(fonts) {
  if (!Array.isArray(fonts) || !fonts.length) return "";
  return fonts
    .map((font) => {
      const family = String(font.family || "").replace(/'/g, "\\'");
      const url = String(font.url || "");
      const format = String(font.format || "woff2");
      if (!family || !url.startsWith("/media/")) return "";
      const formatMap = {
        woff2: "woff2",
        woff: "woff",
        ttf: "truetype",
        otf: "opentype",
      };
      const fmt = formatMap[format] || format;
      return `@font-face{font-family:'${family}';src:url('${url}') format('${fmt}');font-display:swap;}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function buildProfileThemeCss(slug, customCss, fonts) {
  const faces = buildFontFaceCss(fonts);
  const scoped = scopeCustomCss(slug, customCss);
  const parts = [faces, scoped].filter(Boolean);
  return parts.length ? parts.join("\n") : "";
}
