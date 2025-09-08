import React, { useState, useEffect } from 'react'

const Player = ({
  playerState,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  isReady,
  isPremium
}) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (playerState) {
      const progressPercent = (playerState.position / playerState.duration) * 100
      setProgress(progressPercent)
    }
  }, [playerState])

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const currentTrack = playerState?.track_window?.current_track
  const isPlaying = playerState && !playerState.paused

  if (!isReady) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="text-gray-400 text-sm">
            Player initializing...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Current Track Info */}
        <div className="flex items-center space-x-4 flex-1">
          {currentTrack ? (
            <>
              {currentTrack.album?.images?. (
                <img
                  src={currentTrack.album.images.url}
                  alt={currentTrack.name}
                  className="w-12 h-12 rounded"
                />
              )}
              <div className="min-w-0">
                <h4 className="font-semibold truncate">{currentTrack.name}</h4>
                <p className="text-sm text-gray-400 truncate">
                  {currentTrack.artists?.map(artist => artist.name).join(', ')}
                </p>
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">
              {isPremium ? 'No track selected' : 'Premium required for playback'}
            </div>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          <div className="flex items-center space-x-4">
            <button
              onClick={onPrevious}
              disabled={!isPremium || !currentTrack}
              className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              disabled={!isPremium}
              className="p-3 bg-white text-black rounded-full hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button
              onClick={onNext}
              disabled={!isPremium || !currentTrack}
              className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          {currentTrack && playerState && (
            <div className="flex items-center space-x-2 w-full max-w-md">
              <span className="text-xs text-gray-400">
                {formatTime(playerState.position)}
              </span>
              <div className="flex-1 bg-gray-600 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {formatTime(playerState.duration)}
              </span>
            </div>
          )}
        </div>

        {/* Volume & Device Info */}
        <div className="flex items-center justify-end space-x-4 flex-1">
          {isPremium === false && (
            <div className="text-xs text-yellow-400">Premium Required</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Player
