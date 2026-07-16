/**
 * Client-side profile detail HTML (matches directorio/[slug] layout).
 */
import { estadoSlug, toSlug } from "./slugs";
import type { SearchableProfile } from "./search";
import { escapeHtml } from "./renderProfileCard";
import { renderBioHtml } from "./bio";
import { websiteHref, websiteLabel, websiteCapsuleHtml } from "./website";

const STATUS_PREVIEW_LABEL: Record<string, string> = {
  draft: "Borrador",
  pending_review: "En revisión",
  rejected: "Rechazado",
};

export function renderProfileDetailHtml(
  profile: SearchableProfile,
  opts: { preview?: boolean } = {},
): string {
  const isPro = profile.tier === "pro";
  const name = escapeHtml(profile.name);
  const estado = escapeHtml(profile.estado);
  const estadoHref = `/estado/${estadoSlug(profile.estado)}/`;
  const descriptionHtml = renderBioHtml(profile.description || "");
  const siteHref = profile.website ? websiteHref(profile.website) : "";
  const siteLabel = profile.website ? escapeHtml(websiteLabel(profile.website)) : "";

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

  const tagPills = (profile.tags || [])
    .map((tag) => {
      const href = `/directorio/?q=${encodeURIComponent(tag)}`;
      return `<a href="${href}" class="rounded border border-dashed border-dm-offblack/25 bg-dm-offwhite/80 px-2 py-0.5 text-xs text-dm-offblack/65 hover:border-dm-offblack/45 hover:text-dm-offblack">${escapeHtml(tag)}</a>`;
    })
    .join("");

  const site = siteHref
    ? websiteCapsuleHtml(escapeHtml(siteHref), siteLabel, "lg")
    : "";

  const tagsRow = tagPills
    ? `<div class="mt-2 flex flex-wrap gap-2">${tagPills}</div>`
    : "";
  const servicesAndTags =
    chips || tagPills
      ? `<div class="mb-6"><div class="flex flex-wrap gap-2">${chips}</div>${tagsRow}</div>`
      : "";

  const galleries = (profile.galleries || []).filter((g) => g.images?.length);
  const galleryHtml = galleries.length
    ? `<section class="mb-10 space-y-8" aria-label="Galería">
        ${galleries
          .map((gallery) => {
            const title = escapeHtml(gallery.title || "Galería");
            const items = (gallery.images || [])
              .map((img) => {
                const src = escapeHtml(img.url);
                const cap = img.caption ? escapeHtml(img.caption) : "";
                return `<figure class="overflow-hidden rounded-md border border-dm-offblack/10 bg-white">
                  <img src="${src}" alt="${cap}" class="aspect-square w-full object-cover" loading="lazy" decoding="async" />
                  ${cap ? `<figcaption class="px-2 py-1.5 text-xs text-dm-offblack/60">${cap}</figcaption>` : ""}
                </figure>`;
              })
              .join("");
            const showTitle = galleries.length > 1 || title !== "Galería";
            return `<div>
              ${showTitle ? `<h2 class="mb-3 text-lg tracking-wide">${title}</h2>` : ""}
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">${items}</div>
            </div>`;
          })
          .join("")}
      </section>`
    : "";

  const statusKey = profile.status || "";
  const previewBanner =
    opts.preview && statusKey && statusKey !== "published"
      ? `<p class="mb-4 rounded border border-dm-offblack/15 bg-dm-offblack/[0.04] px-3 py-2 text-sm text-dm-offblack/70" role="status">Vista previa · ${escapeHtml(STATUS_PREVIEW_LABEL[statusKey] || statusKey)} — no es público.</p>`
      : "";


  return `<div class="profile-detail" data-profile-theme="${escapeHtml(profile.slug)}">${previewBanner}<p class="mb-4 text-sm text-dm-offblack/50">
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
        <div class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <a href="${estadoHref}" class="text-sm text-dm-offblack/60 hover:underline">${estado}</a>
          ${site}
        </div>
      </div>
    </header>
    ${servicesAndTags}
    ${descriptionHtml ? `<div class="profile-bio mb-6 text-base leading-relaxed text-dm-offblack/80">${descriptionHtml}</div>` : ""}
    ${galleryHtml}
    <p class="text-sm text-dm-offblack/45">
      <a href="/directorio/" class="hover:underline">← Volver al directorio</a>
    </p></div>`;
}
