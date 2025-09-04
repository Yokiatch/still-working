// src/components/Player.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { loadSpotifySDK } from '../lib/useSpotifySDK';
import { getSpotifyToken } from '../lib/spotifyAuth';

export default function Player({ onDeviceReady }) {
  const [deviceId, setDeviceId] = useState('');
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTrack: null
  });
  const playerRef = useRef(null);

  const setup = useCallback(async (token) => {
    const player = new window.Spotify.Player({
      name: 'Spotify Clone',
      getOAuthToken: cb => cb(token),
      volume: 0.5,
    });
    
    playerRef.current = player;
    
    player.addListener('ready', ({ device_id }) => {
      console.log('✅ Player ready with device ID:', device_id);
      setDeviceId(device_id);
      onDeviceReady(device_id);
    });

    player.addListener('player_state_changed', (state) => {
      if (state) {
        setPlayerState({
          isPlaying: !state.paused,
          currentTrack: state.track_window.current_track
        });
      }
    });

    player.addListener('initialization_error', ({ message }) => {
      console.error('❌ Initialization error:', message);
    });

    player.addListener('authentication_error', ({ message }) => {
      console.error('❌ Authentication error:', message);
    });

    player.connect();
  }, [onDeviceReady]);

  useEffect(() => {
    loadSpotifySDK(async () => {
      const token = await getSpotifyToken();
      if (token) setup(token);
    }).catch(console.error);
    
    return () => playerRef.current?.disconnect();
  }, [setup]);

  // Expose play function globally so MusicBrowser can use it
  const handlePlay = useCallback(async (uri) => {
    if (!deviceId) {
      console.error('❌ No device ID available');
      return;
    }

    try {
      const token = await getSpotifyToken();
      if (!token) throw new Error('No token available');

      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          uris: [uri],
          position_ms: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`Play failed: ${response.status}`);
      }
      
      console.log('✅ Playing track:', uri);
    } catch (error) {
      console.error('❌ Play error:', error);
    }
  }, [deviceId]);

  // Expose the play function globally
  useEffect(() => {
    window.handlePlay = handlePlay;
  }, [handlePlay]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🎵 Spotify Player</h2>
      
      {/* Device Status */}
      <div className="mb-4">
        {deviceId ? (
          <div className="flex items-center text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium">Device Ready</span>
          </div>
        ) : (
          <div className="flex items-center text-yellow-600">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium">Initializing...</span>
          </div>
        )}
      </div>

      {/* Current Track */}
      {playerState.currentTrack && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Now Playing</h3>
          <div className="flex items-center space-x-3">
            {playerState.currentTrack.album.images[0] && (
              <img
                src={playerState.currentTrack.album.images[0].url}
                alt={playerState.currentTrack.name}
                className="w-12 h-12 rounded-md object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {playerState.currentTrack.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {playerState.currentTrack.artists.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>
          
          {/* Play/Pause Indicator */}
          <div className="mt-2 text-center">
            <span className={`inline-block w-3 h-3 rounded-full ${playerState.isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="ml-2 text-xs text-gray-600">
              {playerState.isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 Click any song to play it through this web player!
        </p>
      </div>
    </div>
  );
}
