-- Demo member for editor testing (magic-link login)
INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_romina', 'romina@tortilla.studio', 'member');

UPDATE profiles
SET user_id = 'user_romina'
WHERE slug = 'romina-hernandez';

-- Demo admin for approval queue
INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_admin', 'hola@dimela.mx', 'admin');

UPDATE users SET role = 'admin' WHERE email = 'hola@dimela.mx';
