/**
 * Client-side profile card HTML (matches ProfileCard.astro).
 * Used when the directory grid is filled from /api/search.
 */
import { toSlug } from "./slugs";
import type { SearchableProfile } from "./search";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderProfileCardHtml(profile: SearchableProfile): string {
  const isPro = profile.tier === "pro";
  const href = `/directorio/${encodeURIComponent(profile.slug)}/`;
  const estadoHref = `/estado/${toSlug(profile.estado)}/`;
  const name = escapeHtml(profile.name);
  const estado = escapeHtml(profile.estado);
  const description = escapeHtml(profile.description || "");
  const serviciosJson = escapeHtml(JSON.stringify(profile.servicios || []));
  const shell = isPro
    ? "border-dm-offblack/35 shadow-lg"
    : "origin-center scale-x-[0.98] scale-y-[0.96] border-dm-offblack/15";

  const proBadge = isPro
    ? `<span class="absolute top-3 right-3 z-10 rounded bg-dm-pink px-2 py-0.5 text-[10px] font-semibold tracking-wide text-dm-offblack uppercase">Pro</span>`
    : "";

  const cover = profile.cover
    ? `<img src="${escapeHtml(profile.cover)}" alt="" class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" decoding="async" />`
    : `<div class="absolute inset-0 flex items-end bg-gradient-to-br from-dm-blue-strong via-dm-blue to-dm-offwhite p-4" aria-hidden="true"><span class="text-3xl font-bold text-dm-offblack/25 select-none">Aa</span></div>`;

  const avatar = profile.avatar
    ? `<img src="${escapeHtml(profile.avatar)}" alt="" class="h-12 w-12 shrink-0 rounded-full object-cover shadow-md ring-2 ring-white" width="48" height="48" loading="lazy" decoding="async" />`
    : `<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dm-offblack/10 text-dm-offblack/50 shadow-md ring-2 ring-white" aria-hidden="true"><svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"></circle><path d="M4 22c0-5 4-8 8-8s8 3 8 8v2H4v-2z"></path></svg></div>`;

  const chips = (profile.servicios || [])
    .map(
      (servicio) =>
        `<span class="rounded border border-dm-offblack/20 bg-dm-offwhite px-2 py-0.5 text-[11px] text-dm-offblack/80">${escapeHtml(servicio)}</span>`,
    )
    .join("");

  return `<article class="profile-card group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border-2 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${shell}" data-profile-card data-slug="${escapeHtml(profile.slug)}" data-name="${name}" data-description="${description}" data-estado="${estado}" data-servicios="${serviciosJson}">
  ${proBadge}
  <div class="relative aspect-[16/10] shrink-0 overflow-hidden bg-dm-blue">${cover}</div>
  <div class="flex min-h-0 flex-1 flex-col gap-3 p-4">
    <header class="flex shrink-0 items-center gap-3">
      ${avatar}
      <div class="min-w-0">
        <a href="${href}" class="block truncate text-lg font-bold text-dm-offblack underline-offset-2 hover:underline">${name}</a>
        <a href="${estadoHref}" class="relative z-10 truncate text-sm text-dm-offblack/60 hover:underline">${estado}</a>
      </div>
    </header>
    <p class="line-clamp-2 shrink-0 text-sm leading-relaxed text-dm-offblack/75">${description}</p>
    <div class="mt-auto flex h-12 shrink-0 flex-wrap content-start gap-1.5 overflow-hidden pt-1">${chips}</div>
  </div>
  <a href="${href}" class="absolute inset-0 z-0" aria-hidden="true" tabindex="-1"></a>
</article>`;
}
