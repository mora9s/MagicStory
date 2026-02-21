-- Ajout du système de notation (rating) pour les histoires
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter la colonne rating à la table stories
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 2. Ajouter une colonne pour la date de notation (optionnel mais utile)
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMPTZ;

-- 3. Index pour optimiser les requêtes par note
CREATE INDEX IF NOT EXISTS idx_stories_rating ON stories(rating) WHERE rating IS NOT NULL;

-- 4. Vérification
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stories' AND column_name IN ('rating', 'rated_at');
