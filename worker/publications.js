/**
 * Approved profile snapshots.
 *
 * `profiles` is the owner's working copy. `profile_publications` is the last
 * admin-approved version and is the only D1 source used by public reads.
 */

export const PUBLICATION_COLUMNS = `slug, name, estado, servicios, tags, description, website,
  tier, featured, cover, avatar, custom_css, custom_fonts,
  'published' AS status, NULL AS user_id, galleries`;

/** Mark the working copy as a draft when an approved profile starts changing. */
export async function markProfileDraftForEdit(env, userId) {
  await env.DB.prepare(
    `UPDATE profiles
     SET status = 'draft', updated_at = datetime('now')
     WHERE user_id = ?
       AND status IN ('published', 'rejected')
       AND EXISTS (
         SELECT 1 FROM profile_publications pp WHERE pp.slug = profiles.slug
       )`,
  )
    .bind(userId)
    .run();
}

/** Atomically replace the public snapshot with the current working copy. */
export async function publishProfile(env, slug) {
  return env.DB.batch([
    env.DB.prepare(
      `INSERT INTO profile_publications (
         slug, name, estado, servicios, tags, description, website, tier, featured,
         cover, avatar, custom_css, custom_fonts, galleries, published_at
       )
       SELECT
         slug, name, estado, servicios, tags, description, website, tier, featured,
         cover, avatar, custom_css, custom_fonts, galleries, datetime('now')
       FROM profiles
       WHERE slug = ?
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         estado = excluded.estado,
         servicios = excluded.servicios,
         tags = excluded.tags,
         description = excluded.description,
         website = excluded.website,
         tier = excluded.tier,
         featured = excluded.featured,
         cover = excluded.cover,
         avatar = excluded.avatar,
         custom_css = excluded.custom_css,
         custom_fonts = excluded.custom_fonts,
         galleries = excluded.galleries,
         published_at = excluded.published_at`,
    ).bind(slug),
    env.DB.prepare(
      `UPDATE profiles
       SET status = 'published', updated_at = datetime('now')
       WHERE slug = ?`,
    ).bind(slug),
  ]);
}

/**
 * Discard a published profile's working changes while retaining a rejected
 * review state for the owner. The approved snapshot remains public throughout.
 */
export async function rejectPublishedRevision(env, slug) {
  return env.DB.prepare(
    `UPDATE profiles
     SET name = (SELECT name FROM profile_publications WHERE slug = ?),
         estado = (SELECT estado FROM profile_publications WHERE slug = ?),
         servicios = (SELECT servicios FROM profile_publications WHERE slug = ?),
         tags = (SELECT tags FROM profile_publications WHERE slug = ?),
         description = (SELECT description FROM profile_publications WHERE slug = ?),
         website = (SELECT website FROM profile_publications WHERE slug = ?),
         tier = (SELECT tier FROM profile_publications WHERE slug = ?),
         featured = (SELECT featured FROM profile_publications WHERE slug = ?),
         cover = (SELECT cover FROM profile_publications WHERE slug = ?),
         avatar = (SELECT avatar FROM profile_publications WHERE slug = ?),
         custom_css = (SELECT custom_css FROM profile_publications WHERE slug = ?),
         custom_fonts = (SELECT custom_fonts FROM profile_publications WHERE slug = ?),
         galleries = (SELECT galleries FROM profile_publications WHERE slug = ?),
         status = 'rejected',
         updated_at = datetime('now')
     WHERE slug = ?
       AND EXISTS (
         SELECT 1 FROM profile_publications WHERE slug = ?
       )`,
  )
    .bind(...Array(13).fill(slug), slug, slug)
    .run();
}

/** Keep R2 objects that are still referenced by the approved public version. */
export async function publicationReferencesMedia(env, slug, url) {
  if (!slug || !url) return false;
  const row = await env.DB.prepare(
    `SELECT 1 AS referenced
     FROM profile_publications
     WHERE slug = ?
       AND (
         cover = ? OR avatar = ?
         OR instr(COALESCE(custom_fonts, '[]'), ?) > 0
         OR instr(COALESCE(galleries, '[]'), ?) > 0
       )
     LIMIT 1`,
  )
    .bind(slug, url, url, url, url)
    .first();
  return Boolean(row?.referenced);
}
