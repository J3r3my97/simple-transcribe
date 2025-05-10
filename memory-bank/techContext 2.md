# Technical Context

## Technologies Used

### Frontend
- Next.js 14
- React Query
- TypeScript
- Tailwind CSS
- Axios

### Backend (Node.js)
- Express.js
- TypeScript
- Supabase Client
- ytdl-core
- youtube-dl-exec

### Backend (Python)
- FastAPI
- yt-dlp
- Anthropic Claude API
- python-dotenv
- httpx

### Database
- Supabase (PostgreSQL)
- UUID for primary keys
- Timestamps for tracking
- Foreign key relationships

## Development Setup

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Node.js Backend
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
PYTHON_SERVICE_URL=http://python-backend:8000

# Python Backend
ANTHROPIC_API_KEY=your_anthropic_key
```

### Docker Configuration
- Multi-container setup
- Development and production configurations
- Volume mounting for hot reloading
- Network configuration for service communication

### Database Schema
```sql
-- Videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY,
    youtube_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Transcripts table
CREATE TABLE transcripts (
    id UUID PRIMARY KEY,
    video_id UUID REFERENCES videos(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP
);

-- Summaries table
CREATE TABLE summaries (
    id UUID PRIMARY KEY,
    video_id UUID REFERENCES videos(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP
);
```

## Dependencies

### Frontend
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@tanstack/react-query": "5.x",
    "axios": "1.x",
    "tailwindcss": "3.x"
  }
}
```

### Node.js Backend
```json
{
  "dependencies": {
    "express": "4.x",
    "@supabase/supabase-js": "2.x",
    "ytdl-core": "4.x",
    "youtube-dl-exec": "2.x",
    "axios": "1.x"
  }
}
```

### Python Backend
```txt
fastapi==0.109.0
uvicorn==0.27.0
anthropic==0.51.0
python-dotenv==1.0.0
httpx==0.26.0
yt-dlp==2024.3.10
```

## Technical Constraints
1. **API Rate Limits**
   - YouTube API quotas
   - Claude API rate limits
   - Supabase connection limits

2. **Processing Time**
   - Video download time
   - Transcription time
   - Summary generation time

3. **Resource Usage**
   - Memory usage for video processing
   - CPU usage for transcription
   - Database connection pool

4. **Security Requirements**
   - API key protection
   - Input validation
   - Rate limiting
   - CORS configuration

## Development Tools
1. **Version Control**: Git
2. **Package Management**: npm, pip
3. **Code Quality**: ESLint, Prettier
4. **Testing**: Jest, Pytest
5. **API Testing**: Postman/Insomnia

## Performance Requirements
1. Response time < 2s for API calls
2. Processing time < 5min for videos
3. Concurrent user support
4. Efficient resource usage
5. Scalable architecture 