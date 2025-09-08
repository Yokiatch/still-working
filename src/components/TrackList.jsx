import React from 'react'

const TrackList = ({ title, tracks, onPlayTrack, isPremium }) => {
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!tracks?.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        No tracks to display
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <div
            key={track.id || index}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800 transition cursor-pointer group"
            onClick={() => onPlayTrack(track)}
          >
            {/* Play Button / Track Number */}
            <div className="w-12 flex items-center justify-center">
              <span className="text-gray-400 text-sm group-hover:hidden">
                {index + 1}
              </span>
              <button className="hidden group-hover:block p-2 rounded-full hover:bg-gray-700">
                {isPremium ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Album Art */}
            {track.album?.images?.  (
              <img
                src={track.album.images.url}
                alt={track.name}
                className="w-12 h-12 rounded"
              />
            )}

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{track.name}</h4>
              <p className="text-sm text-gray-400 truncate">
                {track.artists?.map(artist => artist.name).join(', ')}
              </p>
            </div>

            {/* Album Name */}
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm text-gray-400 truncate">
                {track.album?.name}
              </p>
            </div>

            {/* Duration */}
            <div className="text-sm text-gray-400">
              {formatDuration(track.duration_ms)}
            </div>

            {/* Premium indicator */}
            {!isPremium && (
              <div className="text-xs text-yellow-400">
                Premium
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackList