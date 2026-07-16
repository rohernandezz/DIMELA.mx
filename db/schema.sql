-- DIMELA.mx D1 schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS magic_links (
  token TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  slug TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  estado TEXT NOT NULL,
  servicios TEXT NOT NULL, -- JSON array of service labels
  description TEXT NOT NULL DEFAULT '',
  website TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  featured INTEGER NOT NULL DEFAULT 0,
  cover TEXT,
  avatar TEXT,
  custom_css TEXT,
  custom_fonts TEXT NOT NULL DEFAULT '[]',
  galleries TEXT NOT NULL DEFAULT '[]',
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  invite_email TEXT,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON profiles (estado);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles (tier);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_magic_email ON magic_links (email);

-- Last approved profile versions. Public directory reads use this table while
-- `profiles` remains the owner's editable working copy.
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

CREATE TABLE IF NOT EXISTS media_objects (
  key TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('cover', 'avatar', 'gallery', 'font')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_objects_user ON media_objects (user_id);

CREATE TABLE IF NOT EXISTS media_quota (
  id TEXT PRIMARY KEY NOT NULL DEFAULT 'platform',
  month_key TEXT NOT NULL,
  class_a_ops INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO media_quota (id, month_key, class_a_ops)
VALUES ('platform', strftime('%Y-%m', 'now'), 0);
