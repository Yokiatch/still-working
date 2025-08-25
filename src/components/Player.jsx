import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer"
import { useState, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"

export default function Player({ token }) {
  const { player, deviceId, isReady } = useSpotifyPlayer(token)
  const [isPlaying, setIsPlaying] = useState(false)
  const [track, setTrack] = useState(null)
  const [volume, setVolume] = useState(50)

  useEffect(() => {
    if (!player) return

    player.addListener("player_state_changed", (state) => {
      if (!state) return
      setIsPlaying(!state.paused)
      setTrack(state.track_window.current_track)
    })
  }, [player])

  const handleTogglePlay = async () => {
    if (!deviceId) return
    await player.togglePlay()
  }

  const handleNext = async () => {
    if (!deviceId) return
    await player.nextTrack()
  }

  const handlePrevious = async () => {
    if (!deviceId) return
    await player.previousTrack()
  }

  const handleVolumeChange = async (e) => {
    const newVol = e.target.value
    setVolume(newVol)
    if (player) {
      await player.setVolume(newVol / 100)
    }
  }

  const handlePlaySample = async () => {
    if (!deviceId || !token) return
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          uris: ["spotify:track:4uLU6hMCjMI75M1A2tKUQC"], // Example track
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }

  return (
    <div className="fixed bottom-0 w-full bg-gray-900 text-white p-4 flex items-center justify-between">
      {/* Track Info */}
      <div className="flex items-center space-x-4">
        {track && (
          <img
            src={track.album.images[0]?.url}
            alt={track.name}
            className="w-12 h-12 rounded-lg"
          />
        )}
        <div>
          <p className="text-sm font-semibold">{track?.name || "No track"}</p>
          <p className="text-xs text-gray-400">
            {track?.artists?.map((a) => a.name).join(", ") || ""}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6">
        <button onClick={handlePrevious}>
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={handleTogglePlay}
          className="p-2 bg-green-500 rounded-full"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button onClick={handleNext}>
          <SkipForward className="w-6 h-6" />
        </button>
        <button
          onClick={handlePlaySample}
          className="px-3 py-1 bg-green-600 rounded-lg text-sm"
        >
          Play Sample
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center space-x-2 w-32">
        <Volume2 className="w-5 h-5" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  )
}
