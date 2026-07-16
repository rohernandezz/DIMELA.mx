-- Profile claim invites: admin sets invite_email on ownerless seeded profiles.

ALTER TABLE profiles ADD COLUMN invite_email TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_invite_email ON profiles (invite_email);
