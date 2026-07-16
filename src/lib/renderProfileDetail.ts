/**
 * Client-side profile detail HTML (matches directorio/[slug] layout).
 */
import { toSlug } from "./slugs";
import type { SearchableProfile } from "./search";
import { escapeHtml } from "./renderProfileCard";

export function renderProfileDetailHtml(profile: SearchableProfile): string {
  const isPro = profile.tier === "pro";
  const name = escapeHtml(profile.name);
  const estado = escapeHtml(profile.estado);
  const estadoHref = `/estado/${toSlug(profile.estado)}/`;
  const description = escapeHtml(profile.description || "");
  const website = profile.website ? escapeHtml(profile.website) : "";
  const websiteLabel = profile.website
    ? escapeHtml(profile.website.replace(/^https?:\/\//, ""))
    : "";

  const cover = profile.cover
    ? `<div class="mb-6 aspect-[16/9] overflow-hidden rounded-md bg-dm-blue"><img src="${escapeHtml(profile.cover)}" alt="" class="h-full w-full object-cover" decoding="async" /></div>`
    : "";

  const avatar = profile.avatar
    ? `<img src="${escapeHtml(profile.avatar)}" alt="" class="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-md" width="64" height="64" decoding="async" />`
    : `<div class="flex h-16 w-16 items-center justify-center rounded-full bg-dm-offblack/10 text-dm-offblack/40 shadow-md ring-2 ring-white" aria-hidden="true"><svg class="h-9 w-9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"></circle><path d="M4 22c0-5 4-8 8-8s8 3 8 8v2H4v-2z"></path></svg></div>`;

  const proBadge = isPro
    ? `<span class="rounded bg-dm-pink px-2 py-0.5 text-[10px] font-semibold tracking-wide text-dm-offblack uppercase">Pro</span>`
    : "";

  const chips = (profile.servicios || [])
    .map((servicio) => {
      const href = `/servicios/${toSlug(servicio)}/`;
      return `<a href="${href}" class="rounded border border-dm-offblack/20 bg-white px-2.5 py-1 text-sm text-dm-offblack/80 hover:border-dm-offblack/40">${escapeHtml(servicio)}</a>`;
    })
    .join("");

  const site = website
    ? `<p class="mb-8"><a href="${website}" class="text-dm-offblack underline underline-offset-2 hover:opacity-70" rel="noopener noreferrer" target="_blank">${websiteLabel}</a></p>`
    : "";

  return `<p class="mb-4 text-sm text-dm-offblack/50">
      <a href="/" class="hover:underline">Inicio</a>
      <span class="mx-1.5" aria-hidden="true">›</span>
      <a href="/directorio/" class="hover:underline">Directorio</a>
      <span class="mx-1.5" aria-hidden="true">›</span>
      <span class="text-dm-offblack/70">${name}</span>
    </p>
    ${cover}
    <header class="mb-6 flex flex-wrap items-start gap-4">
      ${avatar}
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-3xl font-bold tracking-tight">${name}</h1>
          ${proBadge}
        </div>
        <p class="mt-1"><a href="${estadoHref}" class="text-dm-offblack/60 hover:underline">${estado}</a></p>
      </div>
    </header>
    <p class="mb-6 text-base leading-relaxed text-dm-offblack/80">${description}</p>
    <div class="mb-8 flex flex-wrap gap-2">${chips}</div>
    ${site}
    <p class="text-sm text-dm-offblack/45">
      <a href="/directorio/" class="hover:underline">← Volver al directorio</a>
    </p>`;
}
