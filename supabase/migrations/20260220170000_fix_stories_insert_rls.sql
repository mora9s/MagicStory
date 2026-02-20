-- FIX RLS POLICY FOR STORIES INSERT
-- Permet l'insertion si le profil appartient à l'utilisateur OU si profile_id est NULL (création temporaire)

-- Supprimer l'ancienne policy INSERT trop stricte
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;

-- Nouvelle policy INSERT plus permissive
-- Accepte: profile_id NULL (histoire sans profil lié) OU profil appartenant à l'utilisateur
CREATE POLICY "Users can insert own stories" ON stories
    FOR INSERT WITH CHECK (
        profile_id IS NULL 
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = stories.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Vérifier les policies actuelles
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'stories';
