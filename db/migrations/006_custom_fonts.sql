-- Pro profile custom fonts (JSON array on profile row)

ALTER TABLE profiles ADD COLUMN custom_fonts TEXT NOT NULL DEFAULT '[]';
