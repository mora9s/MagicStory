-- Ajout des colonnes pour les caractéristiques et traits des enfants
-- et support pour les relations entre héros

-- Ajouter colonne traits (JSONB pour stocker un tableau de caractéristiques)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS traits JSONB DEFAULT '[]'::jsonb;

-- Ajouter colonne relation_type (pour liens de parenté quand 2 héros)
-- Ex: 'frere', 'soeur', 'ami', 'cousin', 'jumeau', etc.
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS hero_relation TEXT DEFAULT NULL;

-- Mise à jour des commentaires
COMMENT ON COLUMN public.profiles.traits IS 'Caractéristiques de l''enfant (danse, sportif, rigolo, etc.)';
COMMENT ON COLUMN public.stories.hero_relation IS 'Lien de parenté entre les héros (frere, soeur, ami, cousin, etc.)';
