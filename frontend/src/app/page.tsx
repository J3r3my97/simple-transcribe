'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface VideoDetails {
  video: {
    id: string;
    title: string;
    status: 'processing' | 'completed' | 'failed';
  };
  transcript: string | null;
  summary: string | null;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const processVideo = useMutation({
    mutationFn: async (url: string) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/process-video`, { url });
      return response.data;
    },
    onSuccess: (data) => {
      setVideoId(data.id);
    },
  });

  const { data: videoDetails, isLoading } = useQuery<VideoDetails>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/summary/${videoId}`);
      return response.data;
    },
    enabled: !!videoId,
    refetchInterval: (data) => (data?.video.status === 'processing' ? 2000 : false),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      processVideo.mutate(url);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">YouTube Video Summarizer</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              disabled={processVideo.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {processVideo.isLoading ? 'Processing...' : 'Summarize'}
            </button>
          </div>
        </form>

        {videoDetails && (
          <div className="space-y-6">
            <div className="p-4 border rounded">
              <h2 className="text-2xl font-semibold mb-2">{videoDetails.video.title}</h2>
              <p className="text-gray-600">
                Status: {videoDetails.video.status}
              </p>
            </div>

            {videoDetails.video.status === 'completed' && (
              <>
                {videoDetails.summary && (
                  <div className="p-4 border rounded">
                    <h3 className="text-xl font-semibold mb-2">Summary</h3>
                    <p className="whitespace-pre-wrap">{videoDetails.summary}</p>
                  </div>
                )}

                {videoDetails.transcript && (
                  <div className="p-4 border rounded">
                    <h3 className="text-xl font-semibold mb-2">Transcript</h3>
                    <p className="whitespace-pre-wrap">{videoDetails.transcript}</p>
                  </div>
                )}
              </>
            )}

            {videoDetails.video.status === 'failed' && (
              <div className="p-4 border rounded bg-red-50 text-red-600">
                Failed to process video. Please try again.
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Processing video...</p>
          </div>
        )}
      </div>
    </main>
  );
}
