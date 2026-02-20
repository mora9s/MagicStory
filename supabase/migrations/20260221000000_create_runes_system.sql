-- Système de Runes - Tables et RLS
-- À exécuter dans Supabase SQL Editor

-- ============================================================
-- TABLE: user_runes (Solde de runes par utilisateur)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_runes (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour user_runes
ALTER TABLE user_runes ENABLE ROW LEVEL SECURITY;

-- Policy: Un utilisateur ne voit que SON solde
CREATE POLICY "Users can view own runes" ON user_runes
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Mise à jour via function/trigger uniquement (pas direct)
CREATE POLICY "Users can update own runes" ON user_runes
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: rune_transactions (Historique des transactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS rune_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positif = gain, négatif = dépense
    type VARCHAR(50) NOT NULL CHECK (type IN ('story_creation', 'purchase', 'bonus', 'refund', 'admin_adjust')),
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_rune_transactions_user_id ON rune_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_rune_transactions_created_at ON rune_transactions(created_at DESC);

-- RLS pour rune_transactions
ALTER TABLE rune_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Un utilisateur ne voit que SES transactions
CREATE POLICY "Users can view own transactions" ON rune_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Insertion via function/trigger uniquement
CREATE POLICY "Users can insert own transactions" ON rune_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: spend_runes (Dépenser des runes)
-- ============================================================
CREATE OR REPLACE FUNCTION spend_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR,
    p_story_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Vérifier le solde
    SELECT balance INTO v_current_balance 
    FROM user_runes 
    WHERE user_id = p_user_id 
    FOR UPDATE; -- Lock la ligne
    
    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RETURN FALSE; -- Pas assez de runes
    END IF;
    
    -- Débiter les runes
    UPDATE user_runes 
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Enregistrer la transaction
    INSERT INTO rune_transactions (user_id, amount, type, story_id, description)
    VALUES (p_user_id, -p_amount, p_type, p_story_id, p_description);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: add_runes (Ajouter des runes - achat/bonus)
-- ============================================================
CREATE OR REPLACE FUNCTION add_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR,
    p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insérer ou mettre à jour le solde
    INSERT INTO user_runes (user_id, balance, total_earned)
    VALUES (p_user_id, p_amount, p_amount)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        balance = user_runes.balance + p_amount,
        total_earned = user_runes.total_earned + p_amount,
        updated_at = NOW();
    
    -- Enregistrer la transaction
    INSERT INTO rune_transactions (user_id, amount, type, description)
    VALUES (p_user_id, p_amount, p_type, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: refund_runes (Rembourser si échec)
-- ============================================================
CREATE OR REPLACE FUNCTION refund_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_story_id UUID,
    p_reason TEXT DEFAULT 'Remboursement automatique'
)
RETURNS VOID AS $$
BEGIN
    -- Créditer les runes
    UPDATE user_runes 
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Enregistrer le remboursement
    INSERT INTO rune_transactions (user_id, amount, type, story_id, description)
    VALUES (p_user_id, p_amount, 'refund', p_story_id, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Donner 3 runes à la création de compte
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user_with_runes()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer le profil par défaut
    INSERT INTO public.profiles (user_id, first_name, age)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        5
    );
    
    -- Donner 3 runes de bienvenue
    INSERT INTO user_runes (user_id, balance, total_earned)
    VALUES (NEW.id, 3, 3);
    
    -- Enregistrer la transaction de bienvenue
    INSERT INTO rune_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Runes de bienvenue 🎁');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour le trigger existant ou en créer un nouveau
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_with_runes();

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT 'Tables créées:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_runes', 'rune_transactions');

SELECT 'Policies sur user_runes:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_runes';

SELECT 'Policies sur rune_transactions:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'rune_transactions';

SELECT 'Fonctions créées:' as info;
SELECT proname FROM pg_proc WHERE proname IN ('spend_runes', 'add_runes', 'refund_runes', 'handle_new_user_with_runes');
