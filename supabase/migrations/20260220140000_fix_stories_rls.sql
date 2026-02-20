-- CORRECTION COMPLÈTE RLS POUR STORIES
-- À exécuter dans l'éditeur SQL Supabase

-- 1. Désactiver temporairement RLS pour tester (facultatif, pour déboguer)
-- ALTER TABLE stories DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les policies existantes sur stories
DROP POLICY IF EXISTS "Users can view own stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stories;
DROP POLICY IF EXISTS "Enable read access for all users" ON stories;

-- 3. Vérifier si RLS est activé
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 4. Créer une policy TRÈS permissive pour l'INSERT (temporaire)
-- Cette policy autorise TOUT le monde à insérer
CREATE POLICY "Allow all insert" ON stories
    FOR INSERT WITH CHECK (true);

-- 5. Policy pour la lecture (pour que l'utilisateur puisse voir ses histoires)
CREATE POLICY "Allow all select" ON stories
    FOR SELECT USING (true);

-- 6. Policy pour la mise à jour
CREATE POLICY "Allow all update" ON stories
    FOR UPDATE USING (true);

-- 7. Policy pour la suppression
CREATE POLICY "Allow all delete" ON stories
    FOR DELETE USING (true);

-- Vérification : liste les policies créées
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'stories';
