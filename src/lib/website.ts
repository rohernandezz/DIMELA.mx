/** Normalize profile website URLs for href + display label. */

export const websiteCapsuleClass =
  "relative z-10 inline-flex max-w-full items-center gap-1 rounded-full border border-dm-offblack/20 bg-dm-offwhite px-2.5 py-0.5 text-[11px] text-dm-offblack/75 transition hover:border-dm-offblack/35 hover:bg-white";

export const websiteCapsuleClassLg =
  "inline-flex max-w-full items-center gap-1.5 rounded-full border border-dm-offblack/20 bg-dm-offwhite px-3 py-1 text-xs text-dm-offblack/80 transition hover:border-dm-offblack/35 hover:bg-white";

/** Profile extra tags — same pill chrome as website links, slightly smaller type. */
export const profileTagPillClass =
  "relative z-10 inline-flex items-center rounded-full border border-dm-offblack/20 bg-dm-offwhite px-2 py-0.5 text-[10px] text-dm-offblack/75 transition hover:border-dm-offblack/35 hover:bg-white";

export const profileTagPillClassLg =
  "inline-flex items-center rounded-full border border-dm-offblack/20 bg-dm-offwhite px-2.5 py-0.5 text-xs text-dm-offblack/75 transition hover:border-dm-offblack/35 hover:bg-white";

export function websiteHref(url: string): string {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function websiteLabel(url: string): string {
  const href = websiteHref(url);
  if (!href) return "";
  try {
    const u = new URL(href);
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    return `${u.host}${path}`;
  } catch {
    return trimmedWithoutProtocol(url);
  }
}

function trimmedWithoutProtocol(url: string): string {
  return String(url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

/** Pre-escaped href + label for innerHTML renderers. */
export function websiteCapsuleHtml(
  href: string,
  label: string,
  size: "sm" | "lg" = "sm",
): string {
  const cls = size === "lg" ? websiteCapsuleClassLg : websiteCapsuleClass;
  return `<a href="${href}" class="${cls}" rel="noopener noreferrer" target="_blank"><span class="truncate">${label}</span><span aria-hidden="true" class="shrink-0 opacity-60">↗</span></a>`;
}
