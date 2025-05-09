import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

interface VideoStatus {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url: string;
    title?: string;
    transcript?: string;
    summary?: string;
    error?: string;
}

// In-memory storage for demo purposes
const videos = new Map<string, VideoStatus>();

export async function processVideo(url: string): Promise<string> {
    const videoId = uuidv4();

    // Store initial video status
    videos.set(videoId, {
        id: videoId,
        status: 'pending',
        url
    });

    // Simulate async processing
    setTimeout(async () => {
        try {
            logger.info('Starting video processing', { videoId });

            // Update status to processing
            videos.set(videoId, {
                ...videos.get(videoId)!,
                status: 'processing'
            });

            // TODO: Implement actual video processing
            // 1. Download video
            // 2. Extract audio
            // 3. Send to Python service for transcription
            // 4. Generate summary

            // Simulate completion
            videos.set(videoId, {
                ...videos.get(videoId)!,
                status: 'completed',
                title: 'Sample Video Title',
                transcript: 'Sample transcript...',
                summary: 'Sample summary...'
            });

            logger.info('Video processing completed', { videoId });
        } catch (error) {
            logger.error('Video processing failed', {
                videoId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            videos.set(videoId, {
                ...videos.get(videoId)!,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }, 0);

    return videoId;
}

export async function getVideoStatus(videoId: string): Promise<VideoStatus> {
    const video = videos.get(videoId);
    if (!video) {
        throw new Error('Video not found');
    }
    return video;
} 