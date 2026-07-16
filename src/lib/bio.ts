/**
 * Bio HTML from TipTap — sanitize for display, plain text for cards/search.
 */

export function sanitizeBioHtml(html: string): string {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Strip tags for card previews, search, and data attributes. */
export function bioPlainText(html: string): string {
  const sanitized = sanitizeBioHtml(html);
  return sanitized
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>\s*/gi, " ")
    .replace(/<\/h[1-6]>\s*/gi, " ")
    .replace(/<li>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Safe HTML block for profile detail (legacy plain-text bios still work). */
export function renderBioHtml(html: string): string {
  const raw = String(html || "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeBioHtml(raw);
  return `<p>${escapeHtml(raw)}</p>`;
}
