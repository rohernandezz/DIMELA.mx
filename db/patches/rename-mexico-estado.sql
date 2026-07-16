-- Rename ambiguous "México" label to "Estado de México".
UPDATE profiles SET estado = 'Estado de México' WHERE estado = 'México';
