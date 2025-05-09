# YouTube Summary App - Technical Specification

## Overview
A web application that allows users to paste a YouTube video URL and receive an AI-generated summary of the video content. The application will extract the audio from the video, transcribe it, and then generate a concise summary.

## Architecture

### Frontend (Tailwind CSS + shadcn/ui + Vercel)
- Single page application with a clean, responsive UI
- Input field for YouTube URL
- Status indicators for processing stages
- Summary display area with copy functionality
- History of previously summarized videos (optional)

### Backend (Node.js + Express + Python FastAPI + fly.io)
- Node.js/Express service for handling frontend requests and orchestration
- Python FastAPI service for AI processing (transcription and summarization)
- API endpoints for video processing and summary generation
- YouTube data extraction service

### Storage (Supabase)
- Store video metadata (title, URL, thumbnail)
- Store generated transcripts and summaries
- User authentication and history (optional)

## Data Flow
1. User inputs YouTube URL in frontend
2. Frontend sends URL to Node.js backend
3. Node.js backend:
   - Validates YouTube URL
   - Extracts video metadata via YouTube API
   - Sends request to Python FastAPI service
4. Python FastAPI service:
   - Downloads audio from YouTube video
   - Transcribes audio to text
   - Generates summary from transcript
   - Returns transcript and summary
5. Node.js backend stores data in Supabase
6. Frontend displays summary to user

## API Endpoints

### Node.js/Express Backend

#### `POST /api/process-video`
- Request: `{ url: "https://www.youtube.com/watch?v=..." }`
- Response: 
  ```json
  {
    "videoId": "unique-id",
    "title": "Video Title",
    "thumbnail": "thumbnail-url",
    "status": "processing"
  }
  ```

#### `GET /api/summary/:videoId`
- Response:
  ```json
  {
    "videoId": "unique-id",
    "title": "Video Title",
    "thumbnail": "thumbnail-url",
    "transcript": "Full transcript text...",
    "summary": "Concise summary text...",
    "status": "completed",
    "createdAt": "timestamp"
  }
  ```

### Python FastAPI Backend

#### `POST /process`
- Request:
  ```json
  {
    "videoId": "unique-id",
    "url": "https://www.youtube.com/watch?v=..."
  }
  ```
- Response:
  ```json
  {
    "videoId": "unique-id",
    "transcript": "Full transcript text...",
    "summary": "Concise summary text..."
  }
  ```

## Technical Components & Libraries

### Frontend
- Next.js for React framework
- Tailwind CSS for styling
- shadcn/ui for UI components
- Axios for API requests
- React Query for data fetching and caching

### Backend (Node.js)
- Express.js for API routing
- youtube-dl or ytdl-core for video metadata
- Axios for internal API requests
- Supabase client for database operations
- JWT for authentication (optional)

### Backend (Python)
- FastAPI for API framework
- pytube or youtube-dl for video download
- Whisper or other ASR model for transcription
- Transformers or OpenAI API for summarization
- pydantic for data validation

### Storage
- Supabase PostgreSQL for structured data
- Supabase Storage for audio files (optional)

## Database Schema (Supabase)

### videos
- id (UUID, primary key)
- youtube_id (string)
- title (string)
- url (string)
- thumbnail (string)
- status (enum: 'processing', 'completed', 'failed')
- created_at (timestamp)

### transcripts
- id (UUID, primary key)
- video_id (UUID, foreign key -> videos.id)
- text (text)
- created_at (timestamp)

### summaries
- id (UUID, primary key)
- video_id (UUID, foreign key -> videos.id)
- text (text)
- created_at (timestamp)

### users (optional)
- id (UUID, primary key)
- auth_id (string)
- email (string)
- created_at (timestamp)

### user_videos (optional)
- id (UUID, primary key)
- user_id (UUID, foreign key -> users.id)
- video_id (UUID, foreign key -> videos.id)
- created_at (timestamp)

## Deployment

### Frontend (Vercel)
- Setup environment variables for backend API URL
- Configure build process for Next.js
- Set up automatic deployments from GitHub

### Backend (fly.io)
- Separate deployments for Node.js and Python services
- Docker containers for each service
- Environment variables for API keys and database connections

### Database (Supabase)
- Setup database tables and indexes
- Configure row-level security policies
- Create API keys with appropriate permissions

## Security Considerations
- Rate limiting for API endpoints
- Input validation for YouTube URLs
- API key protection
- CORS configuration
- Secure environment variables

## Future Enhancements
- User authentication and saved summaries
- Different summary lengths (short, medium, detailed)
- Support for additional video platforms
- Keyword extraction and tagging
- Topic categorization
- Language translation options
- Share summary functionality

## Development Roadmap

### Phase 1: MVP
- Basic frontend with URL input and summary display
- Node.js backend with YouTube metadata extraction
- Python backend with basic transcription and summarization
- Minimal Supabase integration for storage

### Phase 2: Enhanced Features
- Improved UI with loading states and error handling
- Enhanced summary quality with better AI models
- User history without authentication
- Performance optimizations

### Phase 3: Full Feature Set
- User authentication and accounts
- Customization options for summaries
- Additional platform support
- Advanced analytics and processing
