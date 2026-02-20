-- Corrige les policies RLS pour permettre la création de profils enfants

-- Supprime les anciennes policies INSERT
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Nouvelle policy INSERT : permet d'insérer un profil où user_id = l'utilisateur connecté
-- (ou si user_id est NULL, pour la compatibilité temporaire)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        OR user_id IS NULL
    );

-- Policy UPDATE : permet de modifier uniquement ses propres profils
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy DELETE : permet de supprimer uniquement ses propres profils  
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Vérifie que la fonction handle_new_user existe et fonctionne
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Crée un profil par défaut pour le nouvel utilisateur
    INSERT INTO public.profiles (user_id, first_name, age, favorite_hero)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        5,
        'Magicien'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assure que le trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
