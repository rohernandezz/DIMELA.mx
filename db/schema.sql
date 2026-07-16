-- DIMELA.mx D1 schema (published profiles for /api/search)

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
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON profiles (estado);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles (tier);
