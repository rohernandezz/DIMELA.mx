/**
 * Pro profile theme — scoped CSS + @font-face (client-side render).
 */

export type ProfileFont = {
  id: string;
  family: string;
  url: string;
  format: string;
};

const MAX_CSS_BYTES = 8 * 1024;

export function sanitizeCustomCss(raw: string): string {
  let css = String(raw || "").trim();
  if (!css) return "";
  if (css.length > MAX_CSS_BYTES) css = css.slice(0, MAX_CSS_BYTES);
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

export function scopeCustomCss(slug: string, css: string): string {
  const safe = sanitizeCustomCss(css);
  if (!safe.trim()) return "";
  const scope = `[data-profile-theme="${slug.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`;
  return safe.replace(/(^|})\s*([^@/{][^{]*)\{/g, (match, brace, selectors) => {
    const trimmed = selectors.trim();
    if (!trimmed) return match;
    const scoped = trimmed
      .split(",")
      .map((sel: string) => scopeSelector(scope, sel.trim()))
      .join(", ");
    return `${brace} ${scoped} {`;
  });
}

function scopeSelector(scope: string, sel: string): string {
  if (!sel) return sel;
  if (!/\.profile-(card|detail)/.test(sel)) return sel;
  // Theme attr lives on the same node as .profile-card / .profile-detail.
  return sel.replace(/\.profile-(card|detail)\b/, (m) => `${scope}${m}`);
}

export function buildFontFaceCss(fonts: ProfileFont[] | undefined): string {
  if (!fonts?.length) return "";
  const formatMap: Record<string, string> = {
    woff2: "woff2",
    woff: "woff",
    ttf: "truetype",
    otf: "opentype",
  };
  return fonts
    .map((font) => {
      const family = String(font.family || "").replace(/'/g, "\\'");
      const url = String(font.url || "");
      const format = formatMap[font.format] || font.format || "woff2";
      if (!family || !url.startsWith("/media/")) return "";
      return `@font-face{font-family:'${family}';src:url('${url}') format('${format}');font-display:swap;}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function buildProfileThemeCss(
  slug: string,
  customCss?: string,
  fonts?: ProfileFont[],
): string {
  if (!customCss?.trim() && !fonts?.length) return "";
  const faces = buildFontFaceCss(fonts);
  const scoped = scopeCustomCss(slug, customCss || "");
  return [faces, scoped].filter(Boolean).join("\n");
}

export function buildProfileThemeStyleTag(
  slug: string,
  customCss?: string,
  fonts?: ProfileFont[],
): string {
  const css = buildProfileThemeCss(slug, customCss, fonts);
  if (!css) return "";
  return `<style data-profile-theme="${slug}">${css}</style>`;
}

/** Inject Pro theme into document.head (innerHTML style tags do not apply). */
export function injectProfileTheme(
  slug: string,
  customCss?: string,
  fonts?: ProfileFont[],
): void {
  document
    .querySelectorAll<HTMLStyleElement>(`style[data-profile-theme="${CSS.escape(slug)}"]`)
    .forEach((el) => {
      if (el.dataset.directoryThemes === "1") return;
      el.remove();
    });

  const css = buildProfileThemeCss(slug, customCss, fonts);
  if (!css) return;

  const el = document.createElement("style");
  el.dataset.profileTheme = slug;
  el.textContent = css;
  document.head.appendChild(el);
}

export function injectDirectoryThemes(
  profiles: Array<{ slug: string; tier?: string; customCss?: string; customFonts?: ProfileFont[] }>,
): void {
  const pro = profiles.filter(
    (p) => p.tier === "pro" && (p.customCss?.trim() || p.customFonts?.length),
  );
  if (!pro.length) return;

  const css = pro
    .map((p) => buildProfileThemeCss(p.slug, p.customCss, p.customFonts))
    .filter(Boolean)
    .join("\n");
  if (!css) return;

  let el = document.querySelector<HTMLStyleElement>("[data-directory-themes]");
  if (!el) {
    el = document.createElement("style");
    el.dataset.directoryThemes = "1";
    document.head.appendChild(el);
  }
  el.textContent = css;
}
