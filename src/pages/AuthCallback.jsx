import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const spotifyToken = session.provider_token
          if (spotifyToken) {
            localStorage.setItem("spotify_token", spotifyToken)
            console.log("✅ Spotify token saved to localStorage:", spotifyToken)
          } else {
            console.warn("⚠️ No Spotify provider_token in session")
          }
          navigate("/")
        } else {
          navigate("/login")
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">Finishing up authentication...</p>
    </div>
  )
}
