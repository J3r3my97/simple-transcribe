import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '../../lib/supabase'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createSupabaseClient()

    // Verify Supabase client initialization
    useEffect(() => {
        if (!supabase) {
            console.error('Supabase client is not initialized')
            return
        }
        console.log('Supabase client initialized successfully')
    }, [])

    useEffect(() => {
        try {
            console.log('Setting up auth state listener')
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    console.log('Auth state changed:', event, 'Session:', {
                        hasSession: !!session,
                        user: session?.user?.email,
                        accessToken: session?.access_token ? 'Present' : 'Not present'
                    })
                    if (event === 'SIGNED_IN' && session) {
                        console.log('User signed in, setting user state:', session.user.email)
                        setUser(session.user)
                        // Force a state update to ensure the change is propagated
                        setLoading(false)
                    } else if (event === 'SIGNED_OUT') {
                        console.log('User signed out, clearing user state')
                        setUser(null)
                        setLoading(false)
                    }
                }
            )

            // Check for existing session
            const checkSession = async () => {
                try {
                    console.log('Checking for existing session')
                    const { data: { session }, error } = await supabase.auth.getSession()
                    if (error) {
                        console.error('Error checking session:', error)
                        return
                    }
                    console.log('Existing session found:', {
                        hasSession: !!session,
                        user: session?.user?.email,
                        accessToken: session?.access_token ? 'Present' : 'Not present'
                    })
                    if (session) {
                        console.log('Setting user from existing session:', session.user.email)
                        setUser(session.user)
                        setLoading(false)
                    }
                } catch (err) {
                    console.error('Error in checkSession:', err)
                }
            }
            checkSession()

            return () => {
                console.log('Cleaning up auth state listener')
                subscription.unsubscribe()
            }
        } catch (err) {
            console.error('Error in auth setup:', err)
            setLoading(false)
        }
    }, [])

    const signIn = async (email: string, password: string): Promise<void> => {
        try {
            console.log('AuthContext: Attempting to sign in with email:', email)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            console.log('AuthContext: Sign in response:', {
                success: !!data?.session,
                error: error?.message,
                user: data?.user?.email
            })
            if (error) {
                console.error('AuthContext: Sign in error:', error)
                throw error
            }
            if (data?.session) {
                console.log('AuthContext: Setting user after successful sign in:', data.session.user.email)
                setUser(data.session.user)
                console.log('AuthContext: User state updated:', data.session.user.email)
                // Force a state update to ensure the change is propagated
                setLoading(false)
            } else {
                console.error('AuthContext: No session in sign in response')
                throw new Error('No session created after sign in')
            }
        } catch (err) {
            console.error('AuthContext: Error in signIn:', err)
            throw err
        }
    }

    const signUp = async (email: string, password: string): Promise<void> => {
        try {
            console.log('Attempting to sign up with email:', email)
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) {
                console.error('Sign up error:', error)
                throw error
            }
        } catch (err) {
            console.error('Error in signUp:', err)
            throw err
        }
    }

    const signOut = async (): Promise<void> => {
        try {
            console.log('Attempting to sign out')
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Sign out error:', error)
                throw error
            }
            setUser(null)
        } catch (err) {
            console.error('Error in signOut:', err)
            throw err
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 