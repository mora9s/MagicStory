-- FIX: S'assurer que les fonctions RPC sont correctement configurées
-- Exécuter dans Supabase SQL Editor

-- Supprimer et recréer les fonctions avec les bonnes permissions

-- 1. spend_runes
DROP FUNCTION IF EXISTS spend_runes(UUID, INTEGER, VARCHAR, UUID, TEXT);

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
    FOR UPDATE;
    
    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RETURN FALSE;
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION spend_runes(UUID, INTEGER, VARCHAR, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION spend_runes(UUID, INTEGER, VARCHAR, UUID, TEXT) TO anon;

-- 2. add_runes
DROP FUNCTION IF EXISTS add_runes(UUID, INTEGER, VARCHAR, TEXT);

CREATE OR REPLACE FUNCTION add_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR,
    p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_runes (user_id, balance, total_earned)
    VALUES (p_user_id, p_amount, p_amount)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        balance = user_runes.balance + p_amount,
        total_earned = user_runes.total_earned + p_amount,
        updated_at = NOW();
    
    INSERT INTO rune_transactions (user_id, amount, type, description)
    VALUES (p_user_id, p_amount, p_type, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_runes(UUID, INTEGER, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_runes(UUID, INTEGER, VARCHAR, TEXT) TO anon;

-- 3. refund_runes
DROP FUNCTION IF EXISTS refund_runes(UUID, INTEGER, UUID, TEXT);

CREATE OR REPLACE FUNCTION refund_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_story_id UUID,
    p_reason TEXT DEFAULT 'Remboursement'
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_runes 
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    INSERT INTO rune_transactions (user_id, amount, type, story_id, description)
    VALUES (p_user_id, p_amount, 'refund', p_story_id, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION refund_runes(UUID, INTEGER, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_runes(UUID, INTEGER, UUID, TEXT) TO anon;

-- Vérifier les fonctions
SELECT proname, proargnames, prosrc 
FROM pg_proc 
WHERE proname IN ('spend_runes', 'add_runes', 'refund_runes');
