import ytdl from 'ytdl-core';
import axios from 'axios';
import youtubeDl from 'youtube-dl-exec';
import { VideoRepository } from '../repositories/videoRepository';
import { Video } from '../types/database';

interface PythonServiceResponse {
    status: 'completed' | 'failed';
    transcript?: string;
    summary?: string;
}

interface YouTubeDlOutput {
    id: string;
    title: string;
    thumbnail?: string;
    [key: string]: any;
}

export class VideoService {
    private pythonServiceUrl: string;

    constructor(
        private videoRepository: VideoRepository,
        pythonServiceUrl: string
    ) {
        this.pythonServiceUrl = pythonServiceUrl;
        console.log('[VideoService] Initialized with Python service URL:', pythonServiceUrl);
    }

    async processVideo(url: string): Promise<Video> {
        console.log('[VideoService] Starting to process video:', url);
        try {
            // Extract video ID from URL
            const videoId = this.extractVideoId(url);
            console.log('[VideoService] Extracted video ID:', videoId);

            if (!videoId) {
                console.error('[VideoService] Invalid YouTube URL - no video ID found');
                throw new Error('Invalid YouTube URL');
            }

            // Check if video already exists
            try {
                console.log('[VideoService] Checking if video exists in database:', videoId);
                const existingVideo = await this.videoRepository.getVideoByYoutubeId(videoId);
                if (existingVideo) {
                    console.log('[VideoService] Found existing video:', existingVideo.id);

                    // Check if video needs processing
                    const details = await this.videoRepository.getVideoWithDetails(existingVideo.id);
                    if (!details.transcript || !details.summary) {
                        console.log('[VideoService] Existing video needs processing, starting background task');
                        this.processVideoInBackground(existingVideo).catch(error => {
                            console.error('[VideoService] Background processing failed:', error);
                        });
                    } else {
                        console.log('[VideoService] Existing video already has transcript and summary');
                    }

                    return existingVideo;
                }
                console.log('[VideoService] No existing video found, proceeding with processing');
            } catch (error: any) {
                console.log('[VideoService] Error checking existing video:', error.message);
                // If no video found, continue with processing
                if (error.code !== 'PGRST116') {
                    throw error;
                }
            }

            // Try youtube-dl-exec first as it's more reliable
            try {
                console.log('[VideoService] Attempting to process with youtube-dl-exec');
                return await this.processWithYoutubeDl(url, videoId);
            } catch (error) {
                console.log('[VideoService] youtube-dl-exec failed:', error);
                console.log('[VideoService] Falling back to ytdl-core');
                return await this.processWithYtdl(url, videoId);
            }
        } catch (error) {
            console.error('[VideoService] Failed to process video:', error);
            throw new Error('Failed to process video. Please try again.');
        }
    }

    private extractVideoId(url: string): string | null {
        console.log('[VideoService] Extracting video ID from URL:', url);
        const patterns = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
            /^[a-zA-Z0-9_-]{11}$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                console.log('[VideoService] Found video ID:', match[1]);
                return match[1];
            }
        }

        console.log('[VideoService] No video ID found in URL');
        return null;
    }

    private async processWithYtdl(url: string, videoId: string): Promise<Video> {
        console.log('[VideoService] Processing with ytdl-core:', url);
        const videoInfo = await ytdl.getInfo(url);
        console.log('[VideoService] Got video info from ytdl-core:', {
            title: videoInfo.videoDetails.title,
            thumbnail: videoInfo.videoDetails.thumbnails[0]?.url
        });

        // Create video record
        const video = await this.videoRepository.createVideo({
            youtube_id: videoId,
            title: videoInfo.videoDetails.title,
            url,
            thumbnail: videoInfo.videoDetails.thumbnails[0]?.url || null,
            status: 'processing',
        });
        console.log('[VideoService] Created video record:', video.id);

        // Start processing in background
        this.processVideoInBackground(video).catch(error => {
            console.error('[VideoService] Background processing failed:', error);
        });

        return video;
    }

    private async processWithYoutubeDl(url: string, videoId: string): Promise<Video> {
        console.log('[VideoService] Processing with youtube-dl-exec:', url);
        const videoInfo = await youtubeDl(url, {
            dumpJson: true,
            skipDownload: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        }) as YouTubeDlOutput;
        console.log('[VideoService] Got video info from youtube-dl-exec:', {
            title: videoInfo.title,
            thumbnail: videoInfo.thumbnail
        });

        if (!videoInfo.title) {
            console.error('[VideoService] Failed to get video info from youtube-dl-exec');
            throw new Error('Failed to get video info');
        }

        // Create video record
        const video = await this.videoRepository.createVideo({
            youtube_id: videoId,
            title: videoInfo.title,
            url,
            thumbnail: videoInfo.thumbnail || null,
            status: 'processing',
        });
        console.log('[VideoService] Created video record:', video.id);

        // Start processing in background
        this.processVideoInBackground(video).catch(error => {
            console.error('[VideoService] Background processing failed:', error);
        });

        return video;
    }

    private async processVideoInBackground(video: Video): Promise<void> {
        console.log('[VideoService] Starting background processing for video:', video.id);
        try {
            // Send to Python service for processing
            console.log('[VideoService] Sending to Python service:', this.pythonServiceUrl);
            const response = await axios.post<PythonServiceResponse>(`${this.pythonServiceUrl}/process`, {
                video_id: video.id,
                url: video.url,
            });
            console.log('[VideoService] Got response from Python service:', response.data.status);

            if (response.data.status === 'completed') {
                console.log('[VideoService] Processing completed, updating video status');
                // Update video status
                await this.videoRepository.updateVideoStatus(video.id, 'completed');

                // Save transcript
                if (response.data.transcript) {
                    console.log('[VideoService] Saving transcript');
                    await this.videoRepository.createTranscript({
                        video_id: video.id,
                        text: response.data.transcript,
                    });
                }

                // Save summary
                if (response.data.summary) {
                    console.log('[VideoService] Saving summary');
                    await this.videoRepository.createSummary({
                        video_id: video.id,
                        text: response.data.summary,
                    });
                }
            } else {
                console.error('[VideoService] Processing failed in Python service');
                throw new Error('Processing failed');
            }
        } catch (error) {
            console.error('[VideoService] Error in background processing:', error);
            await this.videoRepository.updateVideoStatus(video.id, 'failed');
        }
    }

    async getVideoDetails(id: string) {
        console.log('[VideoService] Getting video details:', id);
        return this.videoRepository.getVideoWithDetails(id);
    }
} 