import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { SpotifyApi } from '../lib/spotifyApi'  
import useSpotifyPlayer from '../hooks/useSpotifyPlayer'
import Player from '../components/Player'
import SearchBar from '../components/SearchBar'
import TrackList from '../components/TrackList'
import LoadingSkeleton from '../components/LoadingSkeleton'

const Dashboard = () => {
  const { user, getFreshSpotifyToken, signOut } = useAuth()
  const [spotifyApi, setSpotifyApi] = useState(null)
  const [userPlaylists, setUserPlaylists] = useState([])
  const [likedSongs, setLikedSongs] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('search')

  const {
    deviceId,
    isReady,
    isPremium,
    error: playerError,
    play,
    pause,
    skipToNext,
    skipToPrevious,
    playerState
  } = useSpotifyPlayer()

  // Initialize Spotify API
  useEffect(() => {
    const api = new SpotifyApi(getFreshSpotifyToken)
    setSpotifyApi(api)
  }, [getFreshSpotifyToken])

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!spotifyApi) return

      try {
        setLoading(true)
        setError('')

        // Load user playlists
        const playlistsResponse = await spotifyApi.getUserPlaylists(50)
        setUserPlaylists(playlistsResponse.items || [])

        // Load liked songs (first 50)
        const likedResponse = await spotifyApi.getUserSavedTracks(50)
        setLikedSongs(likedResponse.items?.map(item => item.track) || [])

        // Get recommendations based on liked songs
        if (likedResponse.items?.length > 0) {
          const seedTracks = likedResponse.items
            .slice(0, 5)
            .map(item => item.track.id)
          
          const recsResponse = await spotifyApi.getRecommendations(seedTracks)
          setRecommendations(recsResponse.tracks || [])
        }

      } catch (error) {
        console.error('Error loading user data:', error)
        setError('Failed to load your Spotify data')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [spotifyApi])

  const handleSearch = async (query) => {
    if (!spotifyApi || !query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await spotifyApi.search(query, 'track', 20)
      setSearchResults(response.tracks?.items || [])
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search tracks')
    }
  }

  const handlePlayTrack = async (track) => {
    if (!isReady || !deviceId) {
      setError('Player not ready. Please wait or refresh the page.')
      return
    }

    if (isPremium === false) {
      setError('Spotify Premium required for playback')
      return
    }

    try {
      const success = await play([track.uri])
      if (!success) {
        setError('Failed to play track')
      }
    } catch (error) {
      setError('Failed to play track')
    }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-500">Spotify Player</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {(error || playerError) && (
        <div className="bg-red-500/10 border-b border-red-500 px-6 py-3">
          <p className="text-red-400 text-sm">
            {error || playerError}
            <button
              onClick={() => {setError(''); /* clearPlayerError if available */}}
              className="ml-2 text-red-300 hover:text-red-100"
            >
              ✕
            </button>
          </p>
        </div>
      )}

      {/* Premium Warning */}
      {isPremium === false && (
        <div className="bg-yellow-500/10 border-b border-yellow-500 px-6 py-3">
          <p className="text-yellow-400 text-sm">
            ⚠️ Spotify Premium required for playback. You can browse and search, but playback is disabled.
          </p>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 p-6">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'search' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'playlists' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Your Playlists ({userPlaylists.length})
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'liked' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Liked Songs ({likedSongs.length})
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'recommendations' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Recommended
            </button>
          </nav>

          {/* Player Status */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Player Status</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Ready:</span>
                <span className={isReady ? 'text-green-400' : 'text-red-400'}>
                  {isReady ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Premium:</span>
                <span className={isPremium ? 'text-green-400' : 'text-yellow-400'}>
                  {isPremium === null ? 'Checking...' : isPremium ? 'Yes' : 'No'}
                </span>
              </div>
              {deviceId && (
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="text-green-400">Connected</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'search' && (
            <div>
              <SearchBar onSearch={handleSearch} />
              <TrackList
                title="Search Results"
                tracks={searchResults}
                onPlayTrack={handlePlayTrack}
                isPremium={isPremium}
              />
            </div>
          )}

          {activeTab === 'playlists' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Playlists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition"
                  >
                    {playlist.images?. (
                      <img
                        src={playlist.images.url}
                        alt={playlist.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <h3 className="font-semibold truncate">{playlist.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {playlist.tracks?.total || 0} tracks
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'liked' && (
            <TrackList
              title="Liked Songs"
              tracks={likedSongs}
              onPlayTrack={handlePlayTrack}
              isPremium={isPremium}
            />
          )}

          {activeTab === 'recommendations' && (
            <TrackList
              title="Recommended for You"
              tracks={recommendations}
              onPlayTrack={handlePlayTrack}
              isPremium={isPremium}
            />
          )}
        </main>
      </div>

      {/* Player Controls */}
      <Player
        playerState={playerState}
        onPlay={() => play()}
        onPause={pause}
        onNext={skipToNext}
        onPrevious={skipToPrevious}
        isReady={isReady}
        isPremium={isPremium}
      />
    </div>
  )
}

export default Dashboard
