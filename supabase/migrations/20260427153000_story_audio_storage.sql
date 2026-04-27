-- Story narration audio generated with Gemini TTS
-- Private bucket + metadata table linked to stories.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-audio',
  'story-audio',
  false,
  52428800,
  ARRAY['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/l16']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS public.story_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'audio/wav',
  voice_model TEXT NOT NULL DEFAULT 'gemini-3.1-flash-tts-preview',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id)
);

CREATE INDEX IF NOT EXISTS idx_story_audio_story_id ON public.story_audio(story_id);

ALTER TABLE public.story_audio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own story audio" ON public.story_audio;
CREATE POLICY "Users can view own story audio" ON public.story_audio
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.stories s
      LEFT JOIN public.profiles p ON p.id = s.profile_id
      WHERE s.id = story_audio.story_id
        AND (
          p.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Users can insert own story audio" ON public.story_audio;
CREATE POLICY "Users can insert own story audio" ON public.story_audio
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.stories s
      LEFT JOIN public.profiles p ON p.id = s.profile_id
      WHERE s.id = story_audio.story_id
        AND (
          p.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Users can update own story audio" ON public.story_audio;
CREATE POLICY "Users can update own story audio" ON public.story_audio
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.stories s
      LEFT JOIN public.profiles p ON p.id = s.profile_id
      WHERE s.id = story_audio.story_id
        AND (
          p.user_id = auth.uid()
        )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.stories s
      LEFT JOIN public.profiles p ON p.id = s.profile_id
      WHERE s.id = story_audio.story_id
        AND (
          p.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Users can delete own story audio" ON public.story_audio;
CREATE POLICY "Users can delete own story audio" ON public.story_audio
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.stories s
      LEFT JOIN public.profiles p ON p.id = s.profile_id
      WHERE s.id = story_audio.story_id
        AND (
          p.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Users can read own story audio files" ON storage.objects;
CREATE POLICY "Users can read own story audio files" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'story-audio'
    AND EXISTS (
      SELECT 1
      FROM public.story_audio sa
      JOIN public.stories s ON s.id = sa.story_id
      LEFT JOIN public.profiles p ON p.id = s.profile_id
      WHERE sa.storage_path = name
        AND (
          p.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Users can upload own story audio files" ON storage.objects;
CREATE POLICY "Users can upload own story audio files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'story-audio'
    AND (storage.foldername(name))[1] = 'stories'
  );

DROP POLICY IF EXISTS "Users can update own story audio files" ON storage.objects;
CREATE POLICY "Users can update own story audio files" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'story-audio'
    AND (storage.foldername(name))[1] = 'stories'
  ) WITH CHECK (
    bucket_id = 'story-audio'
    AND (storage.foldername(name))[1] = 'stories'
  );
