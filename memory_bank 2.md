# Project Memory Bank

## Project Overview
A web application that allows users to paste a YouTube video URL and receive an AI-generated summary of the video content. The application extracts audio from the video, transcribes it, and generates a concise summary.

## Architecture

### Frontend (Next.js + Tailwind CSS)
- Single page application with a clean, responsive UI
- Built with Next.js 14 and TypeScript
- Uses Tailwind CSS for styling
- React Query for data fetching and state management
- Axios for API requests

### Backend Services
1. Node.js/Express Service (Port 3001)
   - Handles frontend requests and orchestration
   - Integrates with Supabase for data storage
   - Communicates with Python service for processing

2. Python FastAPI Service (Port 8000)
   - Handles video processing
   - Uses Whisper for transcription
   - Uses OpenAI GPT-3.5 for summarization
   - Downloads and processes YouTube videos

### Database (Supabase)
- PostgreSQL database with the following tables:
  - videos (stores video metadata)
  - transcripts (stores video transcripts)
  - summaries (stores generated summaries)
  - users (for future authentication)
  - user_videos (for user history)

## Current Implementation Status

### Frontend
- Main page component (`frontend/src/app/page.tsx`) implemented with:
  - URL input form
  - Video processing status display
  - Summary and transcript display
  - Loading states and error handling
- React Query provider set up for data fetching
- Environment variables configured for API URL

### Backend (Node.js)
- Express server running on port 3001
- API endpoints implemented:
  - POST `/api/process-video` - Start video processing
  - GET `/api/summary/:videoId` - Get video details
- Supabase integration for data storage
- YouTube video metadata extraction

### Backend (Python)
- FastAPI server running on port 8000
- Video processing pipeline:
  1. Download audio from YouTube
  2. Transcribe using Whisper
  3. Generate summary using GPT-3.5
- Error handling and cleanup implemented

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (Node.js) (.env)
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
PYTHON_SERVICE_URL=http://localhost:8000
```

### Backend (Python) (.env)
```
OPENAI_API_KEY=your_openai_key
```

## Recent Changes
1. Implemented frontend main page component with:
   - URL input and form submission
   - Video processing status display
   - Summary and transcript display
   - Loading states and error handling
2. Set up React Query provider for data fetching
3. Configured environment variables for API communication
4. Added TypeScript interfaces for type safety

## Next Steps
1. Add URL validation for YouTube links
2. Implement error handling for failed video processing
3. Add loading state components
4. Improve UI styling and responsiveness
5. Set up development servers for both frontend and backend

## Known Issues
1. TypeScript linter errors in frontend components:
   - Property 'video' does not exist on type 'Query<VideoDetails, Error, VideoDetails, readonly unknown[]>'
   - Property 'isLoading' does not exist on type 'UseMutationResult'
2. SQL linter errors in database schema (PostgreSQL specific syntax)

## Dependencies

### Frontend
- Next.js 14
- React Query
- Axios
- Tailwind CSS

### Backend (Node.js)
- Express
- Supabase Client
- ytdl-core
- Axios

### Backend (Python)
- FastAPI
- Whisper
- OpenAI
- pytube 