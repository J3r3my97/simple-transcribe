import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import logger, { stream } from './services/logger';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream }));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});

// Routes
app.get('/health', (req, res) => {
    logger.info('Health check requested');
    res.json({ status: 'ok' });
});

// ... existing code ...

export default app; 