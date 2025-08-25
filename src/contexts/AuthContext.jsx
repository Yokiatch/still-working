import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [spotifyToken, setSpotifyToken] = useState(null)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        setSession(data.session)

        // Spotify access token from Supabase
        setSpotifyToken(data.session.provider_token)
      }
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setSpotifyToken(s?.provider_token || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthCtx.Provider value={{ session, spotifyToken }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
