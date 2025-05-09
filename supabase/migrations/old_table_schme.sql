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
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT timezone
('utc'::text, now
()) NOT NULL,
    updated_at TIMESTAMP
WITH TIME ZONE DEFAULT timezone
('utc'::text, now
()) NOT NULL
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
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT timezone
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
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT timezone
('utc'::text, now
()) NOT NULL
);

-- Create indexes
CREATE INDEX
IF NOT EXISTS idx_videos_youtube_id ON public.videos
(youtube_id);
CREATE INDEX
IF NOT EXISTS idx_transcripts_video_id ON public.transcripts
(video_id);
CREATE INDEX
IF NOT EXISTS idx_summaries_video_id ON public.summaries
(video_id);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.videos
    FOR
SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.videos
    FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Enable update for all users" ON public.videos
    FOR
UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.transcripts
    FOR
SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.transcripts
    FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Enable read access for all users" ON public.summaries
    FOR
SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.summaries
    FOR
INSERT WITH CHECK
    (true)
; 