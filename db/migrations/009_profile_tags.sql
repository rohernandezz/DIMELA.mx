-- Searchable profile tags (JSON array of curated labels).
-- Not filter chips — matched via directory `q` search.
ALTER TABLE profiles ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
ALTER TABLE profile_publications ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
