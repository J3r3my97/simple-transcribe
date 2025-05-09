export type VideoStatus = 'processing' | 'completed' | 'failed';

export interface Video {
    id: string;
    youtube_id: string;
    title: string;
    url: string;
    thumbnail: string | null;
    status: VideoStatus;
    created_at: string;
    updated_at: string;
}

export interface Transcript {
    id: string;
    video_id: string;
    text: string;
    created_at: string;
}

export interface Summary {
    id: string;
    video_id: string;
    text: string;
    created_at: string;
}

export interface User {
    id: string;
    auth_id: string;
    email: string;
    created_at: string;
}

export interface UserVideo {
    id: string;
    user_id: string;
    video_id: string;
    created_at: string;
}

export interface Database {
    public: {
        Tables: {
            videos: {
                Row: Video;
                Insert: Omit<Video, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Video, 'id' | 'created_at' | 'updated_at'>>;
            };
            transcripts: {
                Row: Transcript;
                Insert: Omit<Transcript, 'id' | 'created_at'>;
                Update: Partial<Omit<Transcript, 'id' | 'created_at'>>;
            };
            summaries: {
                Row: Summary;
                Insert: Omit<Summary, 'id' | 'created_at'>;
                Update: Partial<Omit<Summary, 'id' | 'created_at'>>;
            };
            users: {
                Row: User;
                Insert: Omit<User, 'id' | 'created_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at'>>;
            };
            user_videos: {
                Row: UserVideo;
                Insert: Omit<UserVideo, 'id' | 'created_at'>;
                Update: Partial<Omit<UserVideo, 'id' | 'created_at'>>;
            };
        };
    };
} 