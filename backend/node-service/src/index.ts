import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { VideoRepository } from './repositories/videoRepository';
import { VideoService } from './services/videoService';
import { Database } from './types/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Initialize services
const videoRepository = new VideoRepository(supabase);
const videoService = new VideoService(
    videoRepository,
    process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'
);

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/process-video', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const video = await videoService.processVideo(url);
        res.json(video);
    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).json({ error: 'Failed to process video' });
    }
});

app.get('/api/summary/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const details = await videoService.getVideoDetails(videoId);
        res.json(details);
    } catch (error) {
        console.error('Error getting video details:', error);
        res.status(500).json({ error: 'Failed to get video details' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 