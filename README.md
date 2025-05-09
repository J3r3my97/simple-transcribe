# YouTube Summary App

A web application that allows users to paste a YouTube video URL and receive an AI-generated summary of the video content.

## Project Structure

```
simple-transcribe/
├── frontend/                 # Next.js frontend
├── backend/
│   ├── node-service/        # Express backend
│   └── python-service/      # FastAPI backend
├── docker/                  # Docker configurations
└── docs/                    # Documentation
```

## Prerequisites

- Node.js 18+
- Python 3.9+
- Docker and Docker Compose
- Supabase account
- OpenAI API key
- fly.io account

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your environment variables
3. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Node.js Backend
   cd backend/node-service
   npm install

   # Python Backend
   cd backend/python-service
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

## Development

### Local Development

1. Start all services using Docker Compose:
   ```bash
   docker-compose up
   ```

2. Access the services:
   - Frontend: http://localhost:3000
   - Node.js Backend: http://localhost:3001
   - Python Backend: http://localhost:8000

### Manual Development

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Start the Node.js backend:
   ```bash
   cd backend/node-service
   npm run dev
   ```

3. Start the Python backend:
   ```bash
   cd backend/python-service
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   uvicorn main:app --reload
   ```

## API Documentation

### Node.js Backend

- `GET /health` - Health check endpoint
- `POST /api/process-video` - Process a YouTube video
- `GET /api/summary/:videoId` - Get video summary

### Python Backend

- `GET /health` - Health check endpoint
- `POST /process` - Process video and generate summary

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

ISC
