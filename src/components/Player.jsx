import { useEffect, useState } from "react"
import useSpotifyPlayer from "../hooks/useSpotifyPlayer"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"

export default function Player() {
  const { player, deviceId, isReady } = useSpotifyPlayer()
  const [track, setTrack] = useState(null)
  const [paused, setPaused] = useState(true)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    if (!player) return

    player.addListener("player_state_changed", (state) => {
      if (!state) return
      setTrack(state.track_window.current_track)
      setPaused(state.paused)
      setPosition(state.position)
      setDuration(state.duration)
    })

    player.getVolume().then(v => setVolume(v))
  }, [player])

  const togglePlay = async () => {
    if (player) await player.togglePlay()
  }

  const nextTrack = async () => {
    if (player) await player.nextTrack()
  }

  const previousTrack = async () => {
    if (player) await player.previousTrack()
  }

  const changeVolume = async (e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (player) await player.setVolume(v)
  }

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div className="w-full h-24 bg-[#181818] border-t border-gray-800 flex items-center justify-between px-4 text-white">
      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-1/4">
        {track?.album?.images?.[0] && (
          <img
            src={track.album.images[0].url}
            alt="album"
            className="w-14 h-14 rounded"
          />
        )}
        <div>
          <p className="font-medium">{track?.name || "No track"}</p>
          <p className="text-sm text-gray-400">
            {track?.artists?.map((a) => a.name).join(", ")}
          </p>
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center gap-2 w-2/4">
        <div className="flex items-center gap-6">
          <button onClick={previousTrack}>
            <SkipBack size={22} />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full"
          >
            {paused ? <Play size={22} fill="black" /> : <Pause size={22} />}
          </button>
          <button onClick={nextTrack}>
            <SkipForward size={22} />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs">{formatTime(position)}</span>
          <div className="relative flex-1 h-1 bg-gray-600 rounded">
            <div
              className="absolute top-0 left-0 h-1 bg-green-500 rounded"
              style={{ width: `${(position / duration) * 100 || 0}%` }}
            />
          </div>
          <span className="text-xs">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <Volume2 size={20} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={changeVolume}
          className="w-24"
        />
      </div>
    </div>
  )
}
