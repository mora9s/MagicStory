-- Migration: Ajout du support des histoires interactives (Choose Your Adventure)
-- Date: 2026-02-17

-- 1. Ajouter le type d'histoire à la table stories
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS story_type TEXT DEFAULT 'linear' CHECK (story_type IN ('linear', 'interactive'));

-- 2. Créer la table des chapitres pour les histoires interactives
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    has_choice BOOLEAN DEFAULT FALSE,
    choice_question TEXT,
    choice_option_a TEXT,
    choice_option_a_next_chapter INTEGER,
    choice_option_b TEXT,
    choice_option_b_next_chapter INTEGER,
    is_ending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, chapter_number)
);

-- 3. Activer RLS sur la table chapters
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- 4. Créer les policies pour chapters
CREATE POLICY "Allow anonymous chapter creation" 
ON public.chapters 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public chapter reading" 
ON public.chapters 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anonymous chapter update" 
ON public.chapters 
FOR UPDATE 
WITH CHECK (true);

CREATE POLICY "Allow anonymous chapter deletion" 
ON public.chapters 
FOR DELETE 
USING (true);

-- 5. Créer un index pour optimiser les requêtes par story_id
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON public.chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_story_number ON public.chapters(story_id, chapter_number);
