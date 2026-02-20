-- FIX RLS - Supprime toutes les policies et recrée une policy INSERT simple
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer TOUTES les policies existantes sur stories
DROP POLICY IF EXISTS "Allow all insert" ON stories;
DROP POLICY IF EXISTS "Allow all select" ON stories;
DROP POLICY IF EXISTS "Allow all update" ON stories;
DROP POLICY IF EXISTS "Allow all delete" ON stories;
DROP POLICY IF EXISTS "Users can view own stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stories;
DROP POLICY IF EXISTS "Enable read access for all users" ON stories;

-- 2. S'assurer que RLS est activé
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 3. Policy INSERT: Permettre aux utilisateurs authentifiés d'insérer
-- Vérifie soit que profile_id est NULL, soit que le profil appartient à l'utilisateur
CREATE POLICY "Enable insert for authenticated users" ON stories
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND (
            profile_id IS NULL 
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = stories.profile_id 
                AND profiles.user_id = auth.uid()
            )
        )
    );

-- 4. Policy SELECT: Les utilisateurs authentifiés peuvent voir leurs histoires
CREATE POLICY "Enable select for authenticated users" ON stories
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' 
        AND (
            profile_id IS NULL 
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = stories.profile_id 
                AND profiles.user_id = auth.uid()
            )
        )
    );

-- 5. Policy DELETE: Les utilisateurs peuvent supprimer leurs histoires
CREATE POLICY "Enable delete for authenticated users" ON stories
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = stories.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- 6. Vérification
SELECT policyname, cmd, qual::text
FROM pg_policies 
WHERE tablename = 'stories';
