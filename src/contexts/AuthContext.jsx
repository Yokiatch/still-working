import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [spotifyToken, setSpotifyToken] = useState(null)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.provider_token) {
          setSpotifyToken(session.provider_token)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.provider_token) {
          setSpotifyToken(session.provider_token)
          // Store in localStorage for SDK access
          localStorage.setItem('spotify_token', session.provider_token)
        } else {
          setSpotifyToken(null)
          localStorage.removeItem('spotify_token')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Get fresh Spotify token with automatic refresh
  const getFreshSpotifyToken = async () => {
    try {
      if (!session) {
        throw new Error('No active session')
      }

      // Check if current token is still valid (basic check)
      if (spotifyToken) {
        const tokenExpiry = session.expires_at * 1000
        const now = Date.now()
        const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
        
        if (now < tokenExpiry - bufferTime) {
          return spotifyToken
        }
      }

      // Refresh the session to get a new token
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Token refresh failed:', error)
        // If refresh fails, redirect to login
        await signOut()
        throw new Error('Token refresh failed. Please log in again.')
      }

      if (refreshedSession?.provider_token) {
        setSpotifyToken(refreshedSession.provider_token)
        localStorage.setItem('spotify_token', refreshedSession.provider_token)
        return refreshedSession.provider_token
      }

      throw new Error('No Spotify token in refreshed session')
    } catch (error) {
      console.error('Error getting fresh token:', error)
      throw error
    }
  }

  const signInWithSpotify = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative user-library-read user-library-modify',
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Spotify:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local storage
      localStorage.removeItem('spotify_token')
      setSpotifyToken(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    spotifyToken,
    loading,
    signInWithSpotify,
    signOut,
    getFreshSpotifyToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
