-- IMPORTANT: Sécurité des photos des enfants
-- Le bucket 'avatars' doit être créé en PRIVÉ via l'interface Supabase
-- 
-- Instructions:
-- 1. Aller sur https://supabase.com/dashboard/project/okoatevvkruiaveffudp/storage
-- 2. Cliquer sur "New bucket"
-- 3. Nom: 'avatars'
-- 4. DÉCOCHER "Public bucket" (laisser privé)
-- 5. Cliquer sur "Create bucket"
--
-- 6. Ensuite, configurer les RLS policies:
--    - Aller dans "Policies" du bucket
--    - Ajouter une policy pour permettre l'upload (INSERT) à tous (ou authenticated)
--    - Ajouter une policy pour permettre la lecture (SELECT) avec une condition appropriée
--
-- 7. Pour les avatars générés (images DALL-E publiques), elles sont stockées dans
--    la table 'profiles' sous forme d'URL, pas dans le bucket.

-- Vérifier que la colonne avatar_url existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Note: Le bucket doit être créé manuellement via l'interface avec les bons paramètres de sécurité
