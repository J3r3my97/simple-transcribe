export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            transcripts: {
                Row: {
                    id: string
                    video_id: string
                    text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    video_id: string
                    text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    video_id?: string
                    text?: string
                    created_at?: string
                }
            }
            summaries: {
                Row: {
                    id: string
                    video_id: string
                    text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    video_id: string
                    text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    video_id?: string
                    text?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
} 