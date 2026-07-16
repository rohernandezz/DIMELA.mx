-- Allow font kind in media_objects (run after 006_custom_fonts.sql)

CREATE TABLE IF NOT EXISTS media_objects_new (
  key TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('cover', 'avatar', 'gallery', 'font')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO media_objects_new SELECT * FROM media_objects;

DROP TABLE media_objects;
ALTER TABLE media_objects_new RENAME TO media_objects;

CREATE INDEX IF NOT EXISTS idx_media_objects_user ON media_objects (user_id);
