-- Run once on DBs created before owner/css columns existed

ALTER TABLE profiles ADD COLUMN user_id TEXT;
ALTER TABLE profiles ADD COLUMN custom_css TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles (user_id);
