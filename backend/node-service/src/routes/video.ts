import express from 'express';
import { processVideo, getVideoStatus } from '../services/video';
import logger from '../services/logger';

const router = express.Router();

router.post('/process', async (req, res) => {
    try {
        const { url } = req.body;
        logger.info('Processing video request received', { url });

        if (!url) {
            logger.warn('Missing URL in request');
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = await processVideo(url);
        logger.info('Video processing started', { videoId });
        res.json({ videoId });
    } catch (error) {
        logger.error('Error processing video:', { error: error instanceof Error ? error.message : 'Unknown error' });
        res.status(500).json({ error: 'Failed to process video' });
    }
});

router.get('/status/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        logger.info('Video status requested', { videoId });

        const status = await getVideoStatus(videoId);
        logger.info('Video status retrieved', { videoId, status });
        res.json(status);
    } catch (error) {
        logger.error('Error getting video status:', {
            videoId: req.params.videoId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({ error: 'Failed to get video status' });
    }
});

export default router; 