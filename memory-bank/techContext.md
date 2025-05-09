# Technical Context

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **HTTP Client**: Axios
- **Development**: Node.js 18+

### Backend (Node.js)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Video Processing**: ytdl-core
- **HTTP Client**: Axios
- **Development**: Node.js 18+

### Backend (Python)
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **AI Models**: 
  - Whisper (transcription)
  - GPT-3.5 (summarization)
- **Video Processing**: pytube
- **Development**: Python 3.9+

## Development Setup

### Prerequisites
1. Node.js 18+
2. Python 3.9+
3. Supabase account
4. OpenAI API key

### Environment Variables
1. **Frontend** (.env.local)
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. **Node.js Backend** (.env)
   ```
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_key
   PYTHON_SERVICE_URL=http://localhost:8000
   ```

3. **Python Backend** (.env)
   ```
   OPENAI_API_KEY=your_openai_key
   ```

### Installation Steps
1. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Node.js Backend**
   ```bash
   cd backend/node-service
   npm install
   npm run dev
   ```

3. **Python Backend**
   ```bash
   cd backend/python-service
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

## Database Schema

### Tables
1. **videos**
   - id (UUID)
   - youtube_id (TEXT)
   - title (TEXT)
   - url (TEXT)
   - thumbnail (TEXT)
   - status (TEXT)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **transcripts**
   - id (UUID)
   - video_id (UUID)
   - text (TEXT)
   - created_at (TIMESTAMP)

3. **summaries**
   - id (UUID)
   - video_id (UUID)
   - text (TEXT)
   - created_at (TIMESTAMP)

## API Endpoints

### Node.js Backend
1. **POST /api/process-video**
   - Input: `{ url: string }`
   - Output: Video metadata

2. **GET /api/summary/:videoId**
   - Output: Video details with transcript and summary

### Python Backend
1. **POST /process**
   - Input: `{ video_id: string, url: string }`
   - Output: Processing results

2. **GET /health**
   - Output: Service status

## Dependencies

### Frontend
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

### Node.js Backend
```json
{
  "dependencies": {
    "express": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "ytdl-core": "^4.0.0",
    "axios": "^1.0.0"
  }
}
```

### Python Backend
```txt
fastapi==0.100.0
uvicorn==0.23.0
openai==1.0.0
whisper==1.0.0
pytube==12.0.0
python-dotenv==1.0.0
```

## Development Tools
1. **Version Control**: Git
2. **Package Management**: npm, pip
3. **Code Quality**: ESLint, Prettier
4. **Testing**: Jest, Pytest
5. **API Testing**: Postman/Insomnia

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