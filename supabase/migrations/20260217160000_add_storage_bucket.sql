-- Créer le bucket pour les avatars si nécessaire
-- Note: Cette opération doit être faite via l'interface Supabase Storage ou l'API
-- Car les buckets sont gérés via l'API Storage, pas via SQL

-- Vérifier que la table profiles a bien la colonne avatar_url
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Note: Pour créer le bucket 'avatars', utilisez :
-- 1. L'interface Supabase Dashboard → Storage → New bucket
-- 2. Ou l'API JavaScript: supabase.storage.createBucket('avatars', { public: true })
