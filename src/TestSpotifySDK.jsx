import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

export default function TestSpotifySDK() {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    const loadToken = async () => {
      let token = localStorage.getItem("spotify_token")

      // Fallback: try Supabase session if token missing
      if (!token) {
        const { data } = await supabase.auth.getSession()
        token = data?.session?.provider_token || null

        if (token) {
          localStorage.setItem("spotify_token", token)
          console.log("✅ Retrieved Spotify token from Supabase")
        }
      }

      if (!token) {
        console.warn("⚠️ No Spotify token found, please log in again")
        return null
      }

      return token
    }

    const setupPlayer = async () => {
      const token = await loadToken()
      if (!token) return

      const playerInstance = new window.Spotify.Player({
        name: "My Spotify Player",
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      })

      playerInstance.addListener("ready", ({ device_id }) => {
        console.log("✅ Spotify Player ready with Device ID", device_id)
      })

      playerInstance.addListener("not_ready", ({ device_id }) => {
        console.log("⚠️ Device went offline", device_id)
      })

      playerInstance.addListener("initialization_error", ({ message }) => {
        console.error("Initialization Error:", message)
      })

      playerInstance.addListener("authentication_error", ({ message }) => {
        console.error("Authentication Error:", message)
      })

      playerInstance.addListener("account_error", ({ message }) => {
        console.error("Account Error:", message)
      })

      playerInstance.connect().then(success => {
        if (success) {
          console.log("Player connected successfully!")
          setPlayer(playerInstance)
        } else {
          console.error("Player connection failed")
        }
      })
    }

    if (!window.Spotify) {
      const script = document.createElement("script")
      script.src = "https://sdk.scdn.co/spotify-player.js"
      script.async = true
      script.onload = () => {
        console.log("✅ Spotify SDK script loaded")
        setupPlayer()
      }
      document.body.appendChild(script)
    } else {
      setupPlayer()
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="text-lg font-medium">
        {player ? "Spotify Player Ready" : "Loading Spotify Player..."}
      </p>
    </div>
  )
}
