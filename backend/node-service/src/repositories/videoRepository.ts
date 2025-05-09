import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Video, Transcript, Summary } from '../types/database';

export class VideoRepository {
    constructor(private supabase: SupabaseClient<Database>) { }

    async createVideo(video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> {
        const { data, error } = await this.supabase
            .from('videos')
            .insert(video)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getVideoById(id: string): Promise<Video | null> {
        const { data, error } = await this.supabase
            .from('videos')
            .select()
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async getVideoByYoutubeId(youtubeId: string): Promise<Video | null> {
        const { data, error } = await this.supabase
            .from('videos')
            .select()
            .eq('youtube_id', youtubeId)
            .single();

        if (error) throw error;
        return data;
    }

    async updateVideoStatus(id: string, status: Video['status']): Promise<Video> {
        const { data, error } = await this.supabase
            .from('videos')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createTranscript(transcript: Omit<Transcript, 'id' | 'created_at'>): Promise<Transcript> {
        const { data, error } = await this.supabase
            .from('transcripts')
            .insert(transcript)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createSummary(summary: Omit<Summary, 'id' | 'created_at'>): Promise<Summary> {
        const { data, error } = await this.supabase
            .from('summaries')
            .insert(summary)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getVideoWithDetails(id: string): Promise<{
        video: Video;
        transcript: Transcript | null;
        summary: Summary | null;
    }> {
        const { data: video, error: videoError } = await this.supabase
            .from('videos')
            .select()
            .eq('id', id)
            .single();

        if (videoError) throw videoError;

        const { data: transcript, error: transcriptError } = await this.supabase
            .from('transcripts')
            .select()
            .eq('video_id', id)
            .single();

        if (transcriptError && transcriptError.code !== 'PGRST116') throw transcriptError;

        const { data: summary, error: summaryError } = await this.supabase
            .from('summaries')
            .select()
            .eq('video_id', id)
            .single();

        if (summaryError && summaryError.code !== 'PGRST116') throw summaryError;

        return {
            video,
            transcript: transcript || null,
            summary: summary || null,
        };
    }
} 