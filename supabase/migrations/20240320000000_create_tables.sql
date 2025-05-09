-- Create videos table
CREATE TABLE
IF NOT EXISTS public.videos
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    youtube_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    status TEXT NOT NULL CHECK
(status IN
('processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT timezone
('utc'::text, now
()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone
('utc'::text, now
()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users
(id) ON
DELETE CASCADE
);

-- Create transcripts table
CREATE TABLE
IF NOT EXISTS public.transcripts
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES public.videos
(id) ON
DELETE CASCADE,
    text TEXT
NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone
('utc'::text, now
()) NOT NULL
);

-- Create summaries table
CREATE TABLE
IF NOT EXISTS public.summaries
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES public.videos
(id) ON
DELETE CASCADE,
    text TEXT
NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone
('utc'::text, now
()) NOT NULL
);

-- Add user_id column to videos table if it doesn't exist
DO $$ 
DECLARE
    first_user_id UUID;
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'videos'
        AND column_name = 'user_id'
    ) THEN
    -- Get the first user ID or create one if none exists
    SELECT id
    INTO first_user_id
    FROM auth.users LIMIT
    1;

IF first_user_id IS NULL THEN
-- Create a default user
INSERT INTO auth.users
    (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'default@example.com',
        crypt('default_password', gen_salt('bf')),
        now(),
        now(),
        now()
            )
RETURNING id INTO first_user_id;
END
IF;

        -- First add the column as nullable
        ALTER TABLE public.videos 
        ADD COLUMN user_id UUID REFERENCES auth.users
(id) ON
DELETE CASCADE;

-- Update existing rows with the first user's ID
UPDATE public.videos 
        SET user_id = first_user_id
        WHERE user_id IS NULL;

-- Then make it NOT NULL
ALTER TABLE public.videos 
        ALTER COLUMN user_id
SET
NOT NULL;
END
IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX
IF NOT EXISTS idx_videos_youtube_id ON public.videos
(youtube_id);
CREATE INDEX
IF NOT EXISTS idx_transcripts_video_id ON public.transcripts
(video_id);
CREATE INDEX
IF NOT EXISTS idx_summaries_video_id ON public.summaries
(video_id);
CREATE INDEX
IF NOT EXISTS idx_videos_user_id ON public.videos
(user_id);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY
IF EXISTS "Users can view their own videos" ON public.videos;
DROP POLICY
IF EXISTS "Users can insert their own videos" ON public.videos;
DROP POLICY
IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY
IF EXISTS "Users can view transcripts of their videos" ON public.transcripts;
DROP POLICY
IF EXISTS "Users can view summaries of their videos" ON public.summaries;

-- Create policies
CREATE POLICY "Users can view their own videos"
    ON public.videos FOR
SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
    ON public.videos FOR
INSERT
    WITH CHECK (auth.uid() =
user_id);

CREATE POLICY "Users can update their own videos"
    ON public.videos FOR
UPDATE
    USING (auth.uid()
= user_id);

CREATE POLICY "Users can view transcripts of their videos"
    ON public.transcripts FOR
SELECT
    USING (EXISTS (
        SELECT 1
    FROM public.videos
    WHERE videos.id = transcripts.video_id
        AND videos.user_id = auth.uid()
    ));

CREATE POLICY "Users can view summaries of their videos"
    ON public.summaries FOR
SELECT
    USING (EXISTS (
        SELECT 1
    FROM public.videos
    WHERE videos.id = summaries.video_id
        AND videos.user_id = auth.uid()
    )); 