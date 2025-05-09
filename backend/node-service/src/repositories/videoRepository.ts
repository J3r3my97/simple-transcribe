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
        console.log('[VideoRepository] Creating transcript for video:', transcript.video_id);
        const { data, error } = await this.supabase
            .from('transcripts')
            .insert(transcript)
            .select()
            .single();

        if (error) {
            console.error('[VideoRepository] Error creating transcript:', error);
            throw error;
        }
        console.log('[VideoRepository] Successfully created transcript:', data.id);
        return data;
    }

    async createSummary(summary: Omit<Summary, 'id' | 'created_at'>): Promise<Summary> {
        console.log('[VideoRepository] Creating summary for video:', summary.video_id);
        const { data, error } = await this.supabase
            .from('summaries')
            .insert(summary)
            .select()
            .single();

        if (error) {
            console.error('[VideoRepository] Error creating summary:', error);
            throw error;
        }
        console.log('[VideoRepository] Successfully created summary:', data.id);
        return data;
    }

    async getVideoWithDetails(id: string): Promise<{
        video: Video;
        transcript: Transcript | null;
        summary: Summary | null;
    }> {
        console.log('[VideoRepository] Getting video details for ID:', id);

        const { data: video, error: videoError } = await this.supabase
            .from('videos')
            .select()
            .eq('id', id)
            .single();

        if (videoError) {
            console.error('[VideoRepository] Error fetching video:', videoError);
            throw videoError;
        }
        console.log('[VideoRepository] Found video:', video.id);

        let transcript = null;
        let summary = null;

        try {
            const { data: transcriptData, error: transcriptError } = await this.supabase
                .from('transcripts')
                .select()
                .eq('video_id', id)
                .single();

            if (transcriptError) {
                if (transcriptError.code === 'PGRST116') {
                    console.log('[VideoRepository] No transcript found for video:', id);
                } else {
                    console.error('[VideoRepository] Error fetching transcript:', transcriptError);
                    throw transcriptError;
                }
            } else {
                console.log('[VideoRepository] Found transcript for video:', id);
                transcript = transcriptData;
            }
        } catch (error) {
            console.error('[VideoRepository] Unexpected error fetching transcript:', error);
            // Don't throw here, we want to continue and try to get the summary
        }

        try {
            const { data: summaryData, error: summaryError } = await this.supabase
                .from('summaries')
                .select()
                .eq('video_id', id)
                .single();

            if (summaryError) {
                if (summaryError.code === 'PGRST116') {
                    console.log('[VideoRepository] No summary found for video:', id);
                } else {
                    console.error('[VideoRepository] Error fetching summary:', summaryError);
                    throw summaryError;
                }
            } else {
                console.log('[VideoRepository] Found summary for video:', id);
                summary = summaryData;
            }
        } catch (error) {
            console.error('[VideoRepository] Unexpected error fetching summary:', error);
            // Don't throw here, we want to return what we have
        }

        console.log('[VideoRepository] Returning video details:', {
            videoId: video.id,
            hasTranscript: !!transcript,
            hasSummary: !!summary
        });

        return {
            video,
            transcript,
            summary,
        };
    }
} 