-- Demo accounts for beta one-click login (see shared/demoAccounts.js)

-- Romina — primary editor demo (real email)
INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_romina', 'romina@tortilla.studio', 'member');

UPDATE profiles
SET user_id = 'user_romina'
WHERE slug = 'romina-hernandez';

-- Featured realistic profiles (example cards)
INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_cristobal', 'demo.cristobal@dimela.mx', 'member');

UPDATE profiles
SET user_id = 'user_cristobal'
WHERE slug = 'cristobal-henestrosa';

INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_miguel', 'demo.miguel@dimela.mx', 'member');

UPDATE profiles
SET user_id = 'user_miguel'
WHERE slug = 'miguel-contreras';

INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_cecilia', 'demo.cecilia@dimela.mx', 'member');

UPDATE profiles
SET user_id = 'user_cecilia'
WHERE slug = 'cecilia-del-castillo';

INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_antonio', 'demo.antonio@dimela.mx', 'member');

UPDATE profiles
SET user_id = 'user_antonio'
WHERE slug = 'antonio-mejia-lechuga';

INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_giovanni', 'demo.giovanni@dimela.mx', 'member');

UPDATE profiles
SET user_id = 'user_giovanni'
WHERE slug = 'giovanni-bautista';

INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_mara', 'demo.mara@dimela.mx', 'member');

UPDATE profiles
SET user_id = 'user_mara'
WHERE slug = 'mara-osman';

INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_sandra', 'demo.sandra@dimela.mx', 'member');

UPDATE profiles
SET user_id = 'user_sandra'
WHERE slug = 'sandra-morales';

-- Admin — approval queue
INSERT OR IGNORE INTO users (id, email, role)
VALUES ('user_admin', 'hola@dimela.mx', 'admin');

UPDATE users SET role = 'admin' WHERE email = 'hola@dimela.mx';
