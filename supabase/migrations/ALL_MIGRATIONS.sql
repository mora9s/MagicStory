-- ============================================================
-- MIGRATIONS COMPLÈTES - MagicStory
-- Copie ce fichier entier dans Supabase SQL Editor et exécute
-- ============================================================

-- ============================================================
-- 1. SUPPRIMER LES ANCIENNES COLONNES image_url
-- ============================================================
ALTER TABLE stories DROP COLUMN IF EXISTS image_url;
ALTER TABLE stories DROP COLUMN IF EXISTS ending_image_url;

-- ============================================================
-- 2. TABLE: story_images (stockage des images)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('cover', 'page', 'ending')),
    page_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_images_story_id ON story_images(story_id);
CREATE INDEX IF NOT EXISTS idx_story_images_type ON story_images(image_type, page_number);

ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;

-- Policy INSERT (permettre aux utilisateurs authentifiés d'insérer)
DROP POLICY IF EXISTS "Allow authenticated insert" ON story_images;
CREATE POLICY "Allow authenticated insert" ON story_images
    FOR INSERT TO authenticated WITH CHECK (true);

-- Policy SELECT
DROP POLICY IF EXISTS "Users can view own story images" ON story_images;
CREATE POLICY "Users can view own story images" ON story_images
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_images.story_id 
            AND (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = stories.profile_id 
                    AND profiles.user_id = auth.uid()
                )
                OR stories.profile_id IS NULL
            )
        )
    );

-- Policy DELETE
DROP POLICY IF EXISTS "Users can delete own story images" ON story_images;
CREATE POLICY "Users can delete own story images" ON story_images
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_images.story_id 
            AND (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = stories.profile_id 
                    AND profiles.user_id = auth.uid()
                )
                OR stories.profile_id IS NULL
            )
        )
    );

-- ============================================================
-- 3. STORAGE POLICIES (bucket story-images)
-- ============================================================
-- Créer le bucket d'abord dans l'UI si pas déjà fait !

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated select" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'story-images');
    
CREATE POLICY "Allow authenticated select" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'story-images');
    
CREATE POLICY "Allow authenticated delete" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'story-images');

-- ============================================================
-- 4. FIX STORIES RLS (suppression)
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = stories.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- ============================================================
-- 5. FIX PROFILES RLS (suppression des héros)
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;
CREATE POLICY "Users can delete own profiles" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT '✅ Migrations exécutées avec succès !' as status;
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('stories', 'profiles', 'story_images') OR (tablename = 'objects' AND schemaname = 'storage')
ORDER BY tablename, cmd;
