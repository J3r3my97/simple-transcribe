from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import anthropic
import yt_dlp
import tempfile
import logging
import httpx
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic client
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
if not anthropic_api_key:
    logger.error("ANTHROPIC_API_KEY environment variable is not set!")
    raise ValueError("ANTHROPIC_API_KEY environment variable is not set!")

# Create a custom HTTP client without proxies
http_client = httpx.Client(timeout=30.0)
client = anthropic.Anthropic(
    api_key=anthropic_api_key,
    http_client=http_client
)

# Define request and response models
class ProcessRequest(BaseModel):
    video_id: str
    url: str

class ProcessResponse(BaseModel):
    video_id: str
    transcript: str
    summary: str
    status: str = "completed"

def get_video_info(url: str) -> dict:
    """Get video information including transcript if available."""
    logger.info(f"Getting video info for URL: {url}")
    try:
        ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'skip_download': True,
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return info
    except Exception as e:
        logger.error(f"Failed to get video info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get video info: {str(e)}")

async def generate_summary(transcript: str) -> str:
    """Generate summary using Claude."""
    logger.info("Generating summary with Claude...")
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": f"Please provide a concise summary of the following transcript:\n\n{transcript}"
                }
            ]
        )
        return response.content[0].text
    except Exception as e:
        logger.error(f"Failed to generate summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

# Process endpoint
@app.post("/process", response_model=ProcessResponse)
async def process_video(request: ProcessRequest):
    try:
        logger.info(f"Received process request for video_id: {request.video_id}")
        
        # Get video info and transcript
        video_info = get_video_info(request.url)
        
        # Try to get transcript from video info
        transcript = ""
        if 'subtitles' in video_info and 'en' in video_info['subtitles']:
            # Get the first available English subtitle
            subtitle_url = video_info['subtitles']['en'][0]['url']
            async with httpx.AsyncClient() as client:
                response = await client.get(subtitle_url)
                if response.status_code == 200:
                    # Parse the subtitle data and extract text
                    subtitle_data = response.text
                    # Simple parsing of subtitle data (you might need to adjust this based on the format)
                    transcript = subtitle_data.replace('\n', ' ').strip()
        
        if not transcript:
            # If no transcript is available, use the video description
            transcript = video_info.get('description', '')
        
        # Generate summary
        summary = await generate_summary(transcript)
        
        response = ProcessResponse(
            video_id=request.video_id,
            transcript=transcript,
            summary=summary,
            status="completed"
        )
        logger.info(f"Sending response for video_id {request.video_id}: {response}")
        return response
                
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 