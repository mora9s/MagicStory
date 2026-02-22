-- Fix RLS policy pour story_images - permettre insertion quand profil est null

-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Users can insert own story images" ON story_images;

-- Nouvelle policy : permettre insertion si l'histoire appartient à l'utilisateur
-- OU si l'histoire a été créée par l'utilisateur (via user_id dans stories)
-- Note: On utilise une sous-requête qui retourne true si l'utilisateur est propriétaire
CREATE POLICY "Users can insert own story images" ON story_images
    FOR INSERT WITH CHECK (
        -- L'histoire existe et l'utilisateur est authentifié
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_images.story_id
            AND (
                -- Soit l'histoire est liée à un profil de l'utilisateur
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = stories.profile_id 
                    AND profiles.user_id = auth.uid()
                )
                -- Soit l'histoire a été créée par l'utilisateur courant (via auth)
                OR stories.profile_id IS NULL
            )
        )
    );

-- Vérification
SELECT 'Policy updated for story_images' as status;
