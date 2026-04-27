-- P0/P1 hardening: admin role checks and secure rune RPC ownership
-- Run this migration from a privileged Supabase context.

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;
CREATE POLICY "Admins can read admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only privileged SQL/service role should manage admin_users rows.
REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM anon, authenticated;

-- Recreate rune functions with caller ownership checks and no anon execution.
DROP FUNCTION IF EXISTS public.spend_runes(UUID, INTEGER, VARCHAR, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.spend_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR,
    p_story_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'not_allowed';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'invalid_amount';
    END IF;

    SELECT balance INTO v_current_balance
    FROM public.user_runes
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    UPDATE public.user_runes
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    INSERT INTO public.rune_transactions (user_id, amount, type, story_id, description)
    VALUES (p_user_id, -p_amount, p_type, p_story_id, p_description);

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_runes(UUID, INTEGER, VARCHAR, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.spend_runes(UUID, INTEGER, VARCHAR, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.spend_runes(UUID, INTEGER, VARCHAR, UUID, TEXT) TO authenticated;

DROP FUNCTION IF EXISTS public.add_runes(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.add_runes(UUID, INTEGER, VARCHAR, TEXT);

CREATE OR REPLACE FUNCTION public.add_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR DEFAULT 'admin_grant',
    p_description TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'admin_required';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 10000 THEN
        RAISE EXCEPTION 'invalid_amount';
    END IF;

    INSERT INTO public.user_runes (user_id, balance, total_earned)
    VALUES (p_user_id, p_amount, p_amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        balance = public.user_runes.balance + p_amount,
        total_earned = public.user_runes.total_earned + p_amount,
        updated_at = NOW();

    INSERT INTO public.rune_transactions (user_id, amount, type, description)
    VALUES (p_user_id, p_amount, p_type, p_description);
END;
$$;

REVOKE ALL ON FUNCTION public.add_runes(UUID, INTEGER, VARCHAR, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_runes(UUID, INTEGER, VARCHAR, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_runes(UUID, INTEGER, VARCHAR, TEXT) TO authenticated;

DROP FUNCTION IF EXISTS public.refund_runes(UUID, INTEGER, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.refund_runes(
    p_user_id UUID,
    p_amount INTEGER,
    p_story_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'not_allowed';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'invalid_amount';
    END IF;

    UPDATE public.user_runes
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    INSERT INTO public.rune_transactions (user_id, amount, type, story_id, description)
    VALUES (p_user_id, p_amount, 'refund', p_story_id, p_reason);
END;
$$;

REVOKE ALL ON FUNCTION public.refund_runes(UUID, INTEGER, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_runes(UUID, INTEGER, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.refund_runes(UUID, INTEGER, UUID, TEXT) TO authenticated;
