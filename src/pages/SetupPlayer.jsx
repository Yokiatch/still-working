import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useSpotifyPlayer from '../hooks/useSpotifyPlayer'

const SetupPlayer = () => {
  const { user } = useAuth()
  const {
    deviceId,
    isReady,
    isPremium,
    error,
    loading,
    initializePlayer,
    clearError
  } = useSpotifyPlayer()

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-green-500 hover:text-green-400 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-gray-900 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Spotify Player Setup</h1>

          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Account Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span>{user?.user_metadata?.full_name || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Player Status */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Player Status</h2>
              
              <div className="space-y-3">
                {/* Loading Status */}
                <div className="flex items-center justify-between">
                  <span>Initialization:</span>
                  <div className="flex items-center space-x-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-yellow-400">Loading...</span>
                      </>
                    ) : (
                      <span className="text-green-400">Complete</span>
                    )}
                  </div>
                </div>

                {/* Ready Status */}
                <div className="flex items-center justify-between">
                  <span>Player Ready:</span>
                  <span className={isReady ? 'text-green-400' : 'text-red-400'}>
                    {isReady ? '✓ Ready' : '✗ Not Ready'}
                  </span>
                </div>

                {/* Premium Status */}
                <div className="flex items-center justify-between">
                  <span>Premium Account:</span>
                  <span className={
                    isPremium === null 
                      ? 'text-yellow-400' 
                      : isPremium 
                        ? 'text-green-400' 
                        : 'text-red-400'
                  }>
                    {isPremium === null 
                      ? '... Checking' 
                      : isPremium 
                        ? '✓ Premium' 
                        : '✗ Premium Required'
                    }
                  </span>
                </div>

                {/* Device ID */}
                {deviceId && (
                  <div className="flex items-center justify-between">
                    <span>Device ID:</span>
                    <span className="text-green-400 font-mono text-xs">
                      {deviceId.substring(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-red-400 font-semibold">Error</h3>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Premium Requirements */}
            {isPremium === false && (
              <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
                <h3 className="text-yellow-400 font-semibold mb-2">Premium Required</h3>
                <p className="text-yellow-300 text-sm mb-3">
                  Spotify Web Playback SDK requires a Premium subscription to play music. 
                  You can still browse and search your music library.
                </p>
                <a
                  href="https://www.spotify.com/premium/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition"
                >
                  Upgrade to Premium
                </a>
              </div>
            )}

            {/* Troubleshooting */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Troubleshooting</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-300">Player not initializing?</h4>
                  <p className="text-gray-400">
                    Try refreshing the page or clearing your browser cache.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-300">Premium required error?</h4>
                  <p className="text-gray-400">
                    The Web Playback SDK only works with Spotify Premium accounts.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-300">Authentication issues?</h4>
                  <p className="text-gray-400">
                    Try signing out and logging back in to refresh your tokens.
                  </p>
                </div>
              </div>

              <button
                onClick={initializePlayer}
                disabled={loading}
                className="mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition"
              >
                {loading ? 'Initializing...' : 'Retry Initialization'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-3 px-6 rounded-lg transition"
              >
                Continue to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupPlayer