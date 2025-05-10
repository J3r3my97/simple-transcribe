import { createBrowserClient } from '@supabase/ssr'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

// Create and export the Supabase client instance
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Export for client components
export const createSupabaseClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
} 