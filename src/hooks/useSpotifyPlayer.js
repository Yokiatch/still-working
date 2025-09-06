import { useEffect, useState } from "react"
import { getSpotifyToken } from "../lib/spotifyAuth" // Import your existing auth function

export default function useSpotifyPlayer() {
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [state, setState] = useState(null)

  useEffect(() => {
    let mounted = true

    const initPlayer = async () => {
      try {
        // Use the same token retrieval method as your auth system
        const token = await getSpotifyToken()

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
            if (mounted) {
              setDeviceId(device_id)
              setIsReady(true)
            }
          })

          newPlayer.addListener("not_ready", ({ device_id }) => {
            console.warn("⚠️ Device ID has gone offline", device_id)
            if (mounted) {
              setIsReady(false)
            }
          })

          newPlayer.addListener("player_state_changed", (state) => {
            console.log("🎵 Player state changed:", state)
            if (mounted) {
              setState(state)
            }
          })

          newPlayer.addListener("initialization_error", ({ message }) => {
            console.error("❌ Initialization Error:", message)
          })

          newPlayer.addListener("authentication_error", ({ message }) => {
            console.error("❌ Authentication Error:", message)
            // Clear Supabase session instead of localStorage
            // You might want to call a logout function here
          })

          newPlayer.addListener("account_error", ({ message }) => {
            console.error("❌ Account Error:", message)
          })

          newPlayer.connect()
          if (mounted) {
            setPlayer(newPlayer)
          }
        }

        // If SDK script isn't loaded yet, wait
        if (!window.Spotify) {
          window.onSpotifyWebPlaybackSDKReady = () => {
            init()
          }
        } else {
          init()
        }
      } catch (error) {
        console.error("❌ Error initializing player:", error)
      }
    }

    initPlayer()

    // Cleanup on unmount
    return () => {
      mounted = false
      if (player) {
        player.disconnect()
      }
    }
  }, [])

  // Player control methods
  const play = async (uri) => {
    if (!player) return
    try {
      if (uri) {
        const token = await getSpotifyToken()
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] })
        })
      } else {
        await player.resume()
      }
    } catch (error) {
      console.error("❌ Play error:", error)
    }
  }

  const pause = async () => {
    if (!player) return
    try {
      await player.pause()
    } catch (error) {
      console.error("❌ Pause error:", error)
    }
  }

  const next = async () => {
    if (!player) return
    try {
      await player.nextTrack()
    } catch (error) {
      console.error("❌ Next track error:", error)
    }
  }

  const previous = async () => {
    if (!player) return
    try {
      await player.previousTrack()
    } catch (error) {
      console.error("❌ Previous track error:", error)
    }
  }

  const setVolume = async (volume) => {
    if (!player) return
    try {
      await player.setVolume(volume)
    } catch (error) {
      console.error("❌ Volume error:", error)
    }
  }

  const transferPlayback = async (deviceId, play = false) => {
    try {
      const token = await getSpotifyToken()
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play
        })
      })
    } catch (error) {
      console.error("❌ Transfer playback error:", error)
    }
  }

  return { 
    player, 
    deviceId, 
    isReady, 
    state,
    play,
    pause,
    next,
    previous,
    setVolume,
    transferPlayback
  }
}
