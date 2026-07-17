/**
 * Bio HTML from TipTap — sanitize for display, plain text for cards/search.
 * Strip strong/em/b/i: never rely on synthesized bold/italic (docs/brand.md).
 */

export function sanitizeBioHtml(html: string): string {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?(?:strong|b|em|i)(?:\s[^>]*)?>/gi, "")
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

/** First paragraph/block — used as the card lead / highlight. */
export function bioLeadHtml(html: string): string {
  const raw = String(html || "").trim();
  if (!raw) return "";

  const sanitized = sanitizeBioHtml(raw);
  const paragraph = sanitized.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (paragraph) return `<p>${paragraph[1]}</p>`;

  const heading = sanitized.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (heading) return `<h2>${heading[1]}</h2>`;

  if (/<[a-z][\s\S]*>/i.test(sanitized)) return sanitized;

  const first = raw.split(/\n\s*\n/).find((part) => part.trim())?.trim() || raw;
  return `<p>${escapeHtml(first)}</p>`;
}

export function bioLeadPlainText(html: string): string {
  return bioPlainText(bioLeadHtml(html));
}

/** Safe HTML block for profile detail (legacy plain-text bios still work). */
export function renderBioHtml(html: string): string {
  const raw = String(html || "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeBioHtml(raw);
  return `<p>${escapeHtml(raw)}</p>`;
}
