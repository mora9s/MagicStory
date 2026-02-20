-- SÉCURISATION RLS - Les données sont privées par utilisateur
-- À exécuter dans Supabase SQL Editor

-- ============================================================
-- PROFILES (Héros enfants)
-- ============================================================

-- Supprimer policies existantes trop permissives
DROP POLICY IF EXISTS "Allow all select" ON profiles;
DROP POLICY IF EXISTS "Allow all insert" ON profiles;
DROP POLICY IF EXISTS "Allow all update" ON profiles;
DROP POLICY IF EXISTS "Allow all delete" ON profiles;

-- Policy SELECT : voir seulement SES propres profils
CREATE POLICY "Users can view own profiles" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy INSERT : créer seulement pour SOI
CREATE POLICY "Users can insert own profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE : modifier seulement SES profils
CREATE POLICY "Users can update own profiles" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy DELETE : supprimer seulement SES profils
CREATE POLICY "Users can delete own profiles" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STORIES (Histoires)
-- ============================================================

-- Supprimer policies trop permissives
DROP POLICY IF EXISTS "Allow all select" ON stories;
DROP POLICY IF EXISTS "Allow all insert" ON stories;
DROP POLICY IF EXISTS "Allow all update" ON stories;
DROP POLICY IF EXISTS "Allow all delete" ON stories;

-- Policy SELECT : voir seulement SES propres histoires
-- (via la jointure avec profiles qui a user_id)
CREATE POLICY "Users can view own stories" ON stories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = stories.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy INSERT : créer seulement pour SES profils
CREATE POLICY "Users can insert own stories" ON stories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = stories.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy UPDATE : modifier seulement SES histoires
CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = stories.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy DELETE : supprimer seulement SES histoires
CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = stories.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- ============================================================
-- HERO_RELATIONSHIPS (Relations entre héros)
-- ============================================================

-- Supprimer policies existantes
DROP POLICY IF EXISTS "Allow all select" ON hero_relationships;
DROP POLICY IF EXISTS "Allow all insert" ON hero_relationships;
DROP POLICY IF EXISTS "Allow all delete" ON hero_relationships;

-- Policy SELECT : voir relations où le héros appartient à l'utilisateur
CREATE POLICY "Users can view own relationships" ON hero_relationships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = hero_relationships.from_hero_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy INSERT : créer seulement entre SES héros
CREATE POLICY "Users can insert own relationships" ON hero_relationships
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = hero_relationships.from_hero_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy DELETE : supprimer seulement SES relations
CREATE POLICY "Users can delete own relationships" ON hero_relationships
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = hero_relationships.from_hero_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('profiles', 'stories', 'hero_relationships')
ORDER BY tablename, cmd;
