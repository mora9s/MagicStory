-- Ajouter la colonne theme à la table stories si elle n'existe pas
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS theme TEXT;
