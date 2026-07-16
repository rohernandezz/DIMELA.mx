-- R2 usage tracking (platform quota vs free tier, ~60% cap enforced in Worker)

CREATE TABLE IF NOT EXISTS media_objects (
  key TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('cover', 'avatar')),
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
