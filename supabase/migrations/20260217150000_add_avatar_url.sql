-- Add avatar_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update RLS policies if needed (they're already permissive)
-- No changes needed to policies as they allow all operations
