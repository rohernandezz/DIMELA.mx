-- Approved/public profile snapshots.
--
-- `profiles` is the owner's working copy. Once a profile has been approved,
-- public reads come from this table so later edits can wait for review without
-- taking the last approved version offline.
CREATE TABLE IF NOT EXISTS profile_publications (
  slug TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  estado TEXT NOT NULL,
  servicios TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  website TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  featured INTEGER NOT NULL DEFAULT 0,
  cover TEXT,
  avatar TEXT,
  custom_css TEXT,
  custom_fonts TEXT NOT NULL DEFAULT '[]',
  galleries TEXT NOT NULL DEFAULT '[]',
  published_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_profile_publications_estado
  ON profile_publications (estado);
CREATE INDEX IF NOT EXISTS idx_profile_publications_tier
  ON profile_publications (tier);

-- Preserve every profile that is currently public as its approved version.
-- Re-running the migration also refreshes seeded development data.
INSERT INTO profile_publications (
  slug, name, estado, servicios, description, website, tier, featured,
  cover, avatar, custom_css, custom_fonts, galleries
)
SELECT
  slug, name, estado, servicios, description, website, tier, featured,
  cover, avatar, custom_css, custom_fonts, galleries
FROM profiles
WHERE status = 'published'
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  estado = excluded.estado,
  servicios = excluded.servicios,
  description = excluded.description,
  website = excluded.website,
  tier = excluded.tier,
  featured = excluded.featured,
  cover = excluded.cover,
  avatar = excluded.avatar,
  custom_css = excluded.custom_css,
  custom_fonts = excluded.custom_fonts,
  galleries = excluded.galleries,
  published_at = datetime('now');
