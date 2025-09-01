// src/pages/AuthCallback.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState("Processing authentication...")

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event, "Session:", !!session)

        // Only proceed when we have a valid session
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          const token = session.provider_token
          
          if (token) {
            // Store and redirect
            localStorage.setItem("spotify_token", token)
            setStatus("✅ Authentication successful! Redirecting…")
            navigate("/", { replace: true })
          } else {
            setStatus("❌ No Spotify token received")
            navigate("/login", { replace: true })
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">{status}</p>
    </div>
  )
}
