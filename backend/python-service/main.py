from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import whisper
import openai
from pytube import YouTube
import tempfile
import asyncio
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

app = FastAPI()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Whisper model
model = whisper.load_model("base")

class VideoRequest(BaseModel):
    url: str
    video_id: Optional[str] = None

class VideoResponse(BaseModel):
    video_id: str
    status: str
    transcript: Optional[str] = None
    summary: Optional[str] = None

def download_audio(url: str) -> str:
    """Download audio from YouTube video and return the file path."""
    try:
        yt = YouTube(url)
        audio_stream = yt.streams.filter(only_audio=True).first()
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        temp_file.close()
        
        # Download audio
        audio_stream.download(filename=temp_file.name)
        return temp_file.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download audio: {str(e)}")

def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio using Whisper."""
    try:
        result = model.transcribe(audio_path)
        return result["text"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")

def generate_summary(transcript: str) -> str:
    """Generate summary using OpenAI API."""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes video transcripts."},
                {"role": "user", "content": f"Please provide a concise summary of the following transcript:\n\n{transcript}"}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/process", response_model=VideoResponse)
async def process_video(request: VideoRequest):
    try:
        # Download audio
        audio_path = download_audio(request.url)
        
        try:
            # Transcribe audio
            transcript = transcribe_audio(audio_path)
            
            # Generate summary
            summary = generate_summary(transcript)
            
            return VideoResponse(
                video_id=request.video_id,
                status="completed",
                transcript=transcript,
                summary=summary
            )
        finally:
            # Clean up temporary file
            if os.path.exists(audio_path):
                os.unlink(audio_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 