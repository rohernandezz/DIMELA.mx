-- Demo member for editor testing (magic-link login)
INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_romina', 'romina@tortilla.studio', 'member');

UPDATE profiles
SET user_id = 'user_romina'
WHERE slug = 'romina-hernandez';
