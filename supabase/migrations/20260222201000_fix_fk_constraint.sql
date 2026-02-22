-- Fix: Modifier la contrainte FK pour permettre SET NULL à la suppression

-- 1. Supprimer l'ancienne contrainte FK
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_profile_id_fkey;

-- 2. Recréer la contrainte avec ON DELETE SET NULL
ALTER TABLE stories 
ADD CONSTRAINT stories_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES profiles(id) 
ON DELETE SET NULL;

-- Vérification
SELECT '✅ Contrainte FK modifiée - ON DELETE SET NULL' as status;
