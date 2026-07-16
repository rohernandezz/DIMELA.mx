-- Profile galleries JSON column

ALTER TABLE profiles ADD COLUMN galleries TEXT NOT NULL DEFAULT '[]';
