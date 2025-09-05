import { useEffect, useState } from "react"

export default function useSpotifyPlayer() {
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("spotifyToken")

    if (!token) {
      console.warn("⚠️ No Spotify token found. Please login first.")
      return
    }

    const init = () => {
      if (!window.Spotify) {
        console.error("Spotify SDK not loaded.")
        return
      }

      const newPlayer = new window.Spotify.Player({
        name: "My Spotify Clone",
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      })

      // --- Player Event Listeners ---
      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("✅ Ready with Device ID", device_id)
        setDeviceId(device_id)
        setIsReady(true)
      })

      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.warn("⚠️ Device ID has gone offline", device_id)
        setIsReady(false)
      })

      newPlayer.addListener("initialization_error", ({ message }) => {
        console.error("❌ Initialization Error:", message)
      })

      newPlayer.addListener("authentication_error", ({ message }) => {
        console.error("❌ Authentication Error:", message)
        localStorage.removeItem("spotifyToken") // token invalid, clear it
      })

      newPlayer.addListener("account_error", ({ message }) => {
        console.error("❌ Account Error:", message)
      })

      newPlayer.connect()
      setPlayer(newPlayer)
    }

    // If SDK script isn’t loaded yet, wait
    if (!window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        init()
      }
    } else {
      init()
    }

    // Cleanup on unmount
    return () => {
      if (player) player.disconnect()
    }
  }, [])

  return { player, deviceId, isReady }
}
