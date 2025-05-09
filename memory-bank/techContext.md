# Technical Context

## Technology Stack

### Frontend
- Next.js 14
- Tailwind CSS
- shadcn/ui
- React Query
- Axios

### Backend (Node.js)
- Express.js
- youtube-dl/ytdl-core
- Supabase Client
- JWT

### Backend (Python)
- FastAPI
- pytube/youtube-dl
- Whisper (transcription)
- OpenAI API (summarization)
- pydantic

### Database
- Supabase (PostgreSQL)
- Row-level security
- JWT authentication

### Development Tools
- Docker
- Docker Compose
- Git
- VS Code/Cursor

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker
- Git
- Supabase account
- OpenAI API key
- fly.io account

### Local Environment
1. Clone repository
2. Install dependencies
3. Set up environment variables
4. Start Docker containers
5. Run development servers

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Node.js Backend
PORT=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
PYTHON_SERVICE_URL=

# Python Backend
OPENAI_API_KEY=
MODEL_TYPE=
```

## Dependencies

### Frontend
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0"
  }
}
```

### Node.js Backend
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "ytdl-core": "^4.11.0",
    "@supabase/supabase-js": "^2.0.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

### Python Backend
```txt
fastapi==0.104.0
uvicorn==0.24.0
pytube==15.0.0
openai==1.3.0
whisper==1.1.10
pydantic==2.4.0
```

## Technical Constraints
1. API rate limits
2. File size limitations
3. Processing time constraints
4. Memory usage limits
5. Network bandwidth considerations

## Performance Requirements
1. Response time < 2s for API calls
2. Processing time < 5min for videos
3. Concurrent user support
4. Efficient resource usage
5. Scalable architecture 