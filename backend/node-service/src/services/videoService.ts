import ytdl from 'ytdl-core';
import axios from 'axios';
import { VideoRepository } from '../repositories/videoRepository';
import { Video } from '../types/database';

export class VideoService {
    private pythonServiceUrl: string;

    constructor(
        private videoRepository: VideoRepository,
        pythonServiceUrl: string
    ) {
        this.pythonServiceUrl = pythonServiceUrl;
    }

    async processVideo(url: string): Promise<Video> {
        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            throw new Error('Invalid YouTube URL');
        }

        // Get video info
        const videoInfo = await ytdl.getInfo(url);
        const youtubeId = videoInfo.videoDetails.videoId;

        // Check if video already exists
        const existingVideo = await this.videoRepository.getVideoByYoutubeId(youtubeId);
        if (existingVideo) {
            return existingVideo;
        }

        // Create video record
        const video = await this.videoRepository.createVideo({
            youtube_id: youtubeId,
            title: videoInfo.videoDetails.title,
            url,
            thumbnail: videoInfo.videoDetails.thumbnails[0]?.url || null,
            status: 'processing',
        });

        // Start processing in background
        this.processVideoInBackground(video).catch(console.error);

        return video;
    }

    private async processVideoInBackground(video: Video): Promise<void> {
        try {
            // Send to Python service for processing
            const response = await axios.post(`${this.pythonServiceUrl}/process`, {
                video_id: video.id,
                url: video.url,
            });

            if (response.data.status === 'completed') {
                // Update video status
                await this.videoRepository.updateVideoStatus(video.id, 'completed');

                // Save transcript
                if (response.data.transcript) {
                    await this.videoRepository.createTranscript({
                        video_id: video.id,
                        text: response.data.transcript,
                    });
                }

                // Save summary
                if (response.data.summary) {
                    await this.videoRepository.createSummary({
                        video_id: video.id,
                        text: response.data.summary,
                    });
                }
            } else {
                throw new Error('Processing failed');
            }
        } catch (error) {
            console.error('Error processing video:', error);
            await this.videoRepository.updateVideoStatus(video.id, 'failed');
        }
    }

    async getVideoDetails(id: string) {
        return this.videoRepository.getVideoWithDetails(id);
    }
} 