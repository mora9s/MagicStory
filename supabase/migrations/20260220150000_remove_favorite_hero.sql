-- Suppression de la colonne favorite_hero (type de héros)
-- Cette colonne complexifiait la création de personnage

-- 1. Supprimer la valeur par défaut si elle existe
ALTER TABLE profiles ALTER COLUMN favorite_hero DROP DEFAULT;

-- 2. Supprimer la contrainte NOT NULL si elle existe
ALTER TABLE profiles ALTER COLUMN favorite_hero DROP NOT NULL;

-- 3. Supprimer la colonne
ALTER TABLE profiles DROP COLUMN IF EXISTS favorite_hero;

-- Vérification
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' ORDER BY ordinal_position;
