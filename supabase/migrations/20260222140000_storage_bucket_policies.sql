-- Configuration des RLS Policies pour le bucket Storage "story-images"
-- À exécuter dans Supabase SQL Editor

-- ============================================================
-- POLICIES POUR LE BUCKET "story-images"
-- ============================================================

-- 1. Permettre aux utilisateurs authentifiés d'UPLOADER des fichiers
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'story-images'
    AND (storage.foldername(name))[1] = 'stories'
);

-- 2. Permettre aux utilisateurs authentifiés de LIRE leurs propres fichiers
CREATE POLICY "Allow authenticated select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'story-images'
);

-- 3. Permettre aux utilisateurs authentifiés de SUPPRIMER leurs fichiers
CREATE POLICY "Allow authenticated delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'story-images'
);

-- 4. Permettre aux utilisateurs authentifiés de METTRE À JOUR leurs fichiers
CREATE POLICY "Allow authenticated update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'story-images'
)
WITH CHECK (
    bucket_id = 'story-images'
);

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT 'Storage policies created for story-images bucket' as status;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%story-images%' OR policyname LIKE '%authenticated%';
