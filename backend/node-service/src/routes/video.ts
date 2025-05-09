import express from 'express';
import { processVideo, getVideoStatus } from '../services/video';
import logger from '../services/logger';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

router.post('/process', async (req, res) => {
    try {
        const { url } = req.body;
        const userId = (req as any).user.id;
        logger.info('Processing video request received', { url, userId });

        if (!url) {
            logger.warn('Missing URL in request');
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = await processVideo(url, userId);
        logger.info('Video processing started', { videoId, userId });
        res.json({ videoId });
    } catch (error) {
        logger.error('Error processing video:', { error: error instanceof Error ? error.message : 'Unknown error' });
        res.status(500).json({ error: 'Failed to process video' });
    }
});

router.get('/status/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = (req as any).user.id;
        logger.info('Video status requested', { videoId, userId });

        const status = await getVideoStatus(videoId, userId);
        logger.info('Video status retrieved', { videoId, status, userId });
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