-- Fix RLS policies pour la suppression des profils (héros)

-- ============================================================
-- VÉRIFIER et FIXER les policies pour PROFILES
-- ============================================================

-- S'assurer que la policy DELETE existe et est correcte
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own child profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own hero profiles" ON profiles;

-- Créer la policy DELETE
CREATE POLICY "Users can delete own profiles" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Vérifier les autres policies critiques
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
CREATE POLICY "Users can view own profiles" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT 'Profile delete policy created' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
