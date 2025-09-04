// src/components/MusicBrowser.jsx
import { useEffect, useState } from 'react';
import {
  searchTracks,
  getUserPlaylists,
  getPlaylistTracks,
  getFeaturedPlaylists,
  getUserTopTracks,
  getRecentlyPlayed
} from '../lib/spotifyApi';

export default function MusicBrowser({ deviceId }) {
  const [tab, setTab] = useState('home');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'home') {
      setLoading(true);
      Promise.all([getFeaturedPlaylists(), getUserTopTracks(), getRecentlyPlayed()])
        .then(([featured, topTracks, recent]) => {
          setPlaylists(featured || []);
          setTracks([...(topTracks || []), ...(recent || [])]);
          setError(null);
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
    if (tab === 'playlists') {
      setLoading(true);
      getUserPlaylists()
        .then(data => {
          setPlaylists(data || []);
          setError(null);
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const doSearch = e => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setLoading(true);
    searchTracks(search)
      .then(data => {
        setResults(data || []);
        setTab('search');
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const playTrack = uri => {
    if (deviceId && window.handlePlay) {
      window.handlePlay(uri);
    } else {
      setError('Player not ready. Please wait a moment.');
    }
  };

  // Track Card Component
  const TrackCard = ({ track, index }) => (
    <div
      onClick={() => playTrack(track.uri)}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
    >
      <div className="relative">
        <img
          src={track.album?.images?.[0]?.url || '/placeholder-music.png'}
          alt={track.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVWMTI1TTE3NSAxMDBIMjUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2Zz4K';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
          {track.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
        </p>
        {track.album && (
          <p className="text-xs text-gray-400 truncate mt-1">
            {track.album.name}
          </p>
        )}
      </div>
    </div>
  );

  // Playlist Card Component
  const PlaylistCard = ({ playlist }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={playlist.images?.[0]?.url || '/placeholder-music.png'}
          alt={playlist.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVWMTI1TTE3NSAxMDBIMjUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2Zz4K';
          }}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {playlist.tracks?.total || 0} tracks
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
          {playlist.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {playlist.description || 'Playlist'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={doSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'home', label: '🏠 Home', count: tracks.length },
          { key: 'search', label: '🔍 Search', count: results.length },
          { key: 'playlists', label: '📚 Playlists', count: playlists.length }
        ].map(tabItem => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              tab === tabItem.key
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tabItem.label}
            {tabItem.count > 0 && (
              <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tabItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading music...</span>
          </div>
        </div>
      )}

      {/* Content Based on Active Tab */}
      {!loading && (
        <>
          {/* Search Results */}
          {tab === 'search' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Search Results
                {results.length > 0 && (
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    ({results.length} tracks)
                  </span>
                )}
              </h2>
              
              {results.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((track, index) => (
                    <TrackCard key={track.id} track={track} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No search results</h3>
                  <p className="mt-1 text-sm text-gray-500">Try searching for your favorite songs or artists.</p>
                </div>
              )}
            </div>
          )}

          {/* Home Tab */}
          {tab === 'home' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🎵 Your Music</h2>
                
                {tracks.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tracks.slice(0, 12).map((track, index) => (
                      <TrackCard key={`${track.id}-${index}`} track={track} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎵</div>
                    <h3 className="text-lg font-medium text-gray-900">No tracks available</h3>
                    <p className="text-sm text-gray-500">Try searching for music or check your Spotify library.</p>
                  </div>
                )}
              </div>

              {playlists.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Playlists</h2>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {playlists.slice(0, 8).map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Playlists Tab */}
          {tab === 'playlists' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Playlists</h2>
              
              {playlists.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900">No playlists found</h3>
                  <p className="text-sm text-gray-500">Create some playlists in your Spotify app!</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
