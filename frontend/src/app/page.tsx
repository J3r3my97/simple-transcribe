'use client';

import { useState } from 'react';
import { useQuery, useMutation, Query } from '@tanstack/react-query';
import axios from 'axios';

interface VideoDetails {
  videoId: string;
  hasTranscript: boolean;
  hasSummary: boolean;
  transcript?: {
    id: string;
    video_id: string;
    text: string;
    created_at: string;
  };
  summary?: {
    id: string;
    video_id: string;
    text: string;
    created_at: string;
  };
}

const isValidYoutubeUrl = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url);
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processVideo = useMutation({
    mutationFn: async (url: string) => {
      if (!isValidYoutubeUrl(url)) {
        throw new Error('Please enter a valid YouTube URL');
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/process-video`, { url });
      return response.data;
    },
    onSuccess: (data) => {
      setVideoId(data.id);
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to process video');
    },
  });

  const { data: videoDetails, isLoading } = useQuery<VideoDetails>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/summary/${videoId}`);
      console.log('Received video details:', response.data);
      return response.data;
    },
    enabled: !!videoId,
    refetchInterval: (query: Query<VideoDetails>) => {
      const data = query.state.data;
      if (!data) return false;
      return !(data.hasTranscript && data.hasSummary) ? 2000 : false;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (url) {
      processVideo.mutate(url);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">YouTube Video Summarizer</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube URL"
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={processVideo.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {processVideo.isPending ? 'Processing...' : 'Summarize'}
              </button>
            </div>
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>
        </form>

        {videoDetails && (
          <div className="space-y-6">
            <div className="p-4 border rounded shadow-sm">
              <h2 className="text-2xl font-semibold mb-2">Video Details</h2>
              <p className="text-gray-600">
                Status: <span className="font-medium">
                  {videoDetails.hasTranscript && videoDetails.hasSummary ? 'Completed' : 'Processing'}
                </span>
              </p>
            </div>

            {videoDetails.hasTranscript && videoDetails.hasSummary && (
              <>
                {videoDetails.summary && (
                  <div className="p-4 border rounded shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Summary</h3>
                    <p className="whitespace-pre-wrap text-gray-700">{videoDetails.summary.text}</p>
                  </div>
                )}

                {videoDetails.transcript && (
                  <div className="p-4 border rounded shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Transcript</h3>
                    <p className="whitespace-pre-wrap text-gray-700">{videoDetails.transcript.text}</p>
                  </div>
                )}
              </>
            )}

            {!videoDetails.hasTranscript && !videoDetails.hasSummary && (
              <div className="p-4 border rounded bg-yellow-50 text-yellow-600">
                Processing video... This may take a few minutes.
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing video...</p>
          </div>
        )}
      </div>
    </main>
  );
}
