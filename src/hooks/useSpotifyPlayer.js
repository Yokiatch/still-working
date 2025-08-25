import { useEffect, useState } from "react"

export function useSpotifyPlayer(token) {
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!token) return

    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: "Music Clone Player",
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      })

      // Error handling
      newPlayer.addListener("initialization_error", ({ message }) =>
        console.error("Initialization error:", message)
      )
      newPlayer.addListener("authentication_error", ({ message }) =>
        console.error("Authentication error:", message)
      )
      newPlayer.addListener("account_error", ({ message }) =>
        console.error("Account error:", message)
      )
      newPlayer.addListener("playback_error", ({ message }) =>
        console.error("Playback error:", message)
      )

      // Ready
      newPlayer.addListener("ready", async ({ device_id }) => {
        console.log("🎧 Ready with Device ID:", device_id)
        setDeviceId(device_id)
        setIsReady(true)

        // Transfer playback to this device
        try {
          const res = await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            body: JSON.stringify({ device_ids: [device_id], play: false }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          if (!res.ok) {
            console.error("❌ Failed to transfer playback:", res.status, res.statusText)
          } else {
            console.log("✅ Playback transferred to this device")
          }
        } catch (err) {
          console.error("❌ Error transferring playback:", err)
        }
      })

      newPlayer.connect()
      setPlayer(newPlayer)
    }
  }, [token])

  return { player, deviceId, isReady }
}
