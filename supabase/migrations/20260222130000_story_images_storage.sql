-- Migration: Story Images Storage
-- Création du bucket et de la table pour stocker les images privées

-- ============================================================
-- 1. SUPPRIMER L'ANCIENNE COLONNE image_url de stories
-- ============================================================
ALTER TABLE stories DROP COLUMN IF EXISTS image_url;
ALTER TABLE stories DROP COLUMN IF EXISTS ending_image_url;

-- ============================================================
-- 2. TABLE: story_images (images privées par histoire)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- chemin dans le bucket: stories/{story_id}/{filename}.png
    image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('cover', 'page', 'ending')),
    page_number INTEGER, -- NULL pour cover/ending, 1,2,3... pour les pages
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_story_images_story_id ON story_images(story_id);
CREATE INDEX IF NOT EXISTS idx_story_images_type ON story_images(image_type, page_number);

-- ============================================================
-- 3. RLS POLICIES pour story_images
-- ============================================================
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;

-- Voir seulement SES images (via jointure stories → profiles)
CREATE POLICY "Users can view own story images" ON story_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            JOIN profiles ON profiles.id = stories.profile_id
            WHERE stories.id = story_images.story_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Insertion seulement pour SES histoires
CREATE POLICY "Users can insert own story images" ON story_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stories 
            JOIN profiles ON profiles.id = stories.profile_id
            WHERE stories.id = story_images.story_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Suppression seulement pour SES histoires
CREATE POLICY "Users can delete own story images" ON story_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM stories 
            JOIN profiles ON profiles.id = stories.profile_id
            WHERE stories.id = story_images.story_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- ============================================================
-- 4. CONFIGURATION DU BUCKET (à faire via l'UI Supabase ou API)
-- Note: Le bucket doit être créé via l'interface Supabase Storage
-- Nom: story-images
-- Public: false (privé)
-- Allowed MIME types: image/png, image/jpeg, image/webp
-- ============================================================

-- ============================================================
-- 5. VÉRIFICATION
-- ============================================================
SELECT 'story_images table created' as status;
SELECT COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'stories' AND column_name IN ('image_url', 'ending_image_url');
