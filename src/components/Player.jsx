import { useEffect, useRef, useState, useCallback } from 'react';
import { loadSpotifySDK } from '../lib/useSpotifySDK';
import { getSpotifyToken } from '../lib/spotifyAuth';
import { useAuth } from '../contexts/AuthContext';

export default function Player() {
  const [playerState, setPlayerState] = useState({
    isReady: false,
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0
  });
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState(null);
  const playerRef = useRef(null);
  const { spotifyToken } = useAuth();

  // Setup Player function that's causing the error
  const setupPlayer = useCallback(async () => {
    console.log('🎵 Setting up Spotify Player...');
    
    try {
      // Wait for token
      const token = await getSpotifyToken();
      if (!token) {
        throw new Error('No Spotify token available');
      }

      // Check if Spotify SDK is loaded
      if (!window.Spotify || !window.Spotify.Player) {
        throw new Error('Spotify SDK not loaded. window.Spotify.Player is undefined');
      }

      console.log('✅ Spotify SDK loaded, creating player...');

      // Create the player instance
      const player = new window.Spotify.Player({
        name: 'Spotify Clone Player',
        getOAuthToken: (cb) => {
          console.log('🔑 Spotify SDK requesting token...');
          cb(token);
        },
        volume: 0.5
      });

      // Store player reference
      playerRef.current = player;

      // Set up event listeners
      player.addListener('ready', ({ device_id }) => {
        console.log('✅ Ready with Device ID', device_id);
        setDeviceId(device_id);
        setPlayerState(prev => ({ ...prev, isReady: true }));
        setError(null);
        
        // Transfer playback to this device
        transferPlayback(device_id, token);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('❌ Device ID has gone offline', device_id);
        setPlayerState(prev => ({ ...prev, isReady: false }));
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) return;
        
        setPlayerState(prev => ({
          ...prev,
          isPlaying: !state.paused,
          currentTrack: state.track_window.current_track,
          position: state.position,
          duration: state.duration
        }));
      });

      // Error listeners
      player.addListener('initialization_error', ({ message }) => {
        console.error('❌ Initialization error:', message);
        setError(`Initialization error: ${message}`);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('❌ Authentication error:', message);
        setError(`Authentication error: ${message}`);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('❌ Account error:', message);
        setError(`Account error: ${message}`);
      });

      // Connect to Spotify
      const connected = await player.connect();
      if (connected) {
        console.log('✅ Successfully connected to Spotify');
      } else {
        throw new Error('Failed to connect to Spotify');
      }

    } catch (error) {
      console.error('❌ Error setting up player:', error);
      setError(error.message);
    }
  }, [spotifyToken]);

  // Transfer playback to this device
  const transferPlayback = async (deviceId, token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });

      if (!response.ok) {
        console.warn('Failed to transfer playback:', response.status);
      } else {
        console.log('✅ Playback transferred successfully');
      }
    } catch (error) {
      console.error('❌ Error transferring playback:', error);
    }
  };

  // Initialize player when component mounts
  useEffect(() => {
    if (!spotifyToken) {
      console.warn('⚠️ No Spotify token available');
      return;
    }

    let mounted = true;

    const initPlayer = async () => {
      try {
        // Load Spotify SDK first
        await new Promise((resolve, reject) => {
          loadSpotifySDK(() => {
            if (mounted) resolve();
          });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            if (mounted) reject(new Error('Spotify SDK load timeout'));
          }, 10000);
        });

        // Setup player after SDK is loaded
        if (mounted) {
          await setupPlayer();
        }
      } catch (error) {
        if (mounted) {
          console.error('❌ Failed to initialize player:', error);
          setError(`Failed to initialize: ${error.message}`);
        }
      }
    };

    initPlayer();

    // Cleanup function
    return () => {
      mounted = false;
      if (playerRef.current) {
        console.log('🔌 Disconnecting player...');
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [spotifyToken, setupPlayer]);

  // Play/Pause toggle
  const togglePlay = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.togglePlay();
    } catch (error) {
      console.error('❌ Error toggling playback:', error);
    }
  }, []);

  // Next track
  const nextTrack = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.nextTrack();
    } catch (error) {
      console.error('❌ Error skipping track:', error);
    }
  }, []);

  // Previous track
  const previousTrack = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.previousTrack();
    } catch (error) {
      console.error('❌ Error going to previous track:', error);
    }
  }, []);

  if (!spotifyToken) {
    return (
      <div id="app-player" className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
        <div className="text-center">
          <p>❌ No Spotify token - Please login first</p>
        </div>
      </div>
    );
  }

  return (
    <div id="app-player" className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 border-t border-gray-700">
      <div className="max-w-screen-xl mx-auto">
        
        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-600 rounded text-center">
            <p>❌ {error}</p>
            <button 
              onClick={setupPlayer}
              className="mt-2 px-4 py-1 bg-red-800 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {!playerState.isReady && !error && (
          <div className="text-center">
            <p>🔄 Loading Spotify Player...</p>
          </div>
        )}

        {/* Player Controls */}
        {playerState.isReady && (
          <div className="flex items-center justify-between">
            
            {/* Current Track Info */}
            <div className="flex-1 min-w-0">
              {playerState.currentTrack ? (
                <div className="flex items-center space-x-3">
                  {playerState.currentTrack.album.images[0] && (
                    <img 
                      src={playerState.currentTrack.album.images[0].url}
                      alt={playerState.currentTrack.album.name}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {playerState.currentTrack.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {playerState.currentTrack.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No track selected</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4 mx-6">
              <button 
                onClick={previousTrack}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                disabled={!playerState.isReady}
              >
                ⏮️
              </button>
              
              <button 
                onClick={togglePlay}
                className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform"
                disabled={!playerState.isReady}
              >
                {playerState.isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button 
                onClick={nextTrack}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                disabled={!playerState.isReady}
              >
                ⏭️
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 min-w-0">
              {playerState.currentTrack && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {Math.floor(playerState.position / 1000 / 60)}:
                    {String(Math.floor(playerState.position / 1000) % 60).padStart(2, '0')}
                  </span>
                  <div className="flex-1 bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-white rounded-full h-1 transition-all duration-1000"
                      style={{ 
                        width: `${playerState.duration > 0 ? (playerState.position / playerState.duration) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {Math.floor(playerState.duration / 1000 / 60)}:
                    {String(Math.floor(playerState.duration / 1000) % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
            
          </div>
        )}

        {/* Device Info */}
        {deviceId && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Device ID: {deviceId}
          </div>
        )}
        
      </div>
    </div>
  );
}
