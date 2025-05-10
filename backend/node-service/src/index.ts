import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { VideoRepository } from './repositories/videoRepository';
import { VideoService } from './services/videoService';
import { Database } from './types/database';

dotenv.config();

// Detailed debug logging
console.log('==== Environment Debug Info ====');
console.log('SUPABASE_URL length:', process.env.SUPABASE_URL?.length || 0);
console.log('SUPABASE_SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY?.length || 0);
console.log('SUPABASE_SERVICE_KEY prefix:', process.env.SUPABASE_SERVICE_KEY?.substring(0, 20) + '...');
console.log('PYTHON_SERVICE_URL:', process.env.PYTHON_SERVICE_URL);
console.log('============================');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
    });
    throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
// Add debug log for key format
console.log('Service key format check:', {
    startsWithEyJ: supabaseKey.startsWith('eyJ'),
    containsBearer: supabaseKey.toLowerCase().includes('bearer'),
    length: supabaseKey.length
});

// Initialize Supabase client with apiKey
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    },
    global: {
        headers: {
            'apikey': supabaseKey
        }
    }
});

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
        const { url, userId } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const video = await videoService.processVideo(url, userId);
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