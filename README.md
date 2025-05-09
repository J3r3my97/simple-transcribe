# YouTube Video Summarizer

A web application that allows users to paste a YouTube video URL and receive an AI-generated summary of the video content. The application extracts audio from the video, transcribes it, and generates a concise summary.

## Features

- YouTube video URL processing
- Audio extraction and transcription
- AI-powered summary generation
- Real-time processing status updates
- Clean, responsive UI
- Comprehensive logging and monitoring

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- React Query
- Axios

### Backend
- Node.js/Express
- Python FastAPI
- Winston (Logging)
- Morgan (HTTP Request Logging)

### Storage
- Supabase (PostgreSQL)

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn
- Docker (for deployment)
- Supabase account

## Local Development

### 1. Clone the Repository
```bash
git clone <repository-url>
cd simple-transcribe
```

### 2. Backend Setup

#### Node.js Service
```bash
cd backend/node-service

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

#### Python Service
```bash
cd backend/python-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start development server
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

### 4. Environment Variables

#### Backend (Node.js)
```env
PORT=3001
PYTHON_SERVICE_URL=http://localhost:8000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
LOG_LEVEL=info
```

#### Backend (Python)
```env
PORT=8000
OPENAI_API_KEY=your_openai_api_key
MODEL_PATH=path_to_whisper_model
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Deployment

### 1. Backend Deployment (fly.io)

#### Node.js Service
```bash
cd backend/node-service

# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login to fly.io
flyctl auth login

# Launch the app
flyctl launch

# Deploy
flyctl deploy
```

#### Python Service
```bash
cd backend/python-service

# Launch the app
flyctl launch

# Deploy
flyctl deploy
```

### 2. Frontend Deployment (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Database Setup (Supabase)

1. Create a new project in Supabase
2. Run the database migrations:
```sql
-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    youtube_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transcripts table
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create summaries table
CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Monitoring and Logs

### Node.js Service
- Logs are stored in `backend/node-service/logs/`
- Access logs: `combined.log`
- Error logs: `error.log`

### Python Service
- Logs are available through the FastAPI logging system
- Access logs through the service's stdout/stderr

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
