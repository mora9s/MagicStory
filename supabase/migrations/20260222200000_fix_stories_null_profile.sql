-- Fix: Permettre NULL dans stories.profile_id pour suppression des héros

-- 1. Supprimer la contrainte NOT NULL si elle existe
ALTER TABLE stories ALTER COLUMN profile_id DROP NOT NULL;

-- 2. Mettre à jour les histoires existantes sans profil
UPDATE stories SET profile_id = NULL WHERE profile_id NOT IN (SELECT id FROM profiles);

-- Vérification
SELECT '✅ La colonne profile_id accepte maintenant NULL' as status;
SELECT COUNT(*) as stories_with_null_profile 
FROM stories 
WHERE profile_id IS NULL;
