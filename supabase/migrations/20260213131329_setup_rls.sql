-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policies for 'profiles'
-- Allow anyone to insert a profile (for sign-up/onboarding)
CREATE POLICY "Allow anonymous profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own profile (simplified for demo: allow all for now)
CREATE POLICY "Allow public profile viewing" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Policies for 'stories'
-- Allow anyone to insert a story
CREATE POLICY "Allow anonymous story creation" 
ON public.stories 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read stories (or restrict by profile_id if needed)
CREATE POLICY "Allow public story reading" 
ON public.stories 
FOR SELECT 
USING (true);
