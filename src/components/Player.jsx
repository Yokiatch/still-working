import { useEffect, useRef, useState, useCallback } from 'react';
import { loadSpotifySDK } from '../lib/useSpotifySDK';  // Ensure this properly loads the SDK script
import { useAuth } from '../contexts/AuthContext';

export default function Player() {
  const [playerState, setPlayerState] = useState({
    isReady: false,
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
  });
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState(null);
  const playerRef = useRef(null);
  const { token: spotifyToken } = useAuth();

  // Transfer playback to this device when ready
  const transferPlayback = useCallback(
    async (deviceId, token) => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: false,
          }),
        });

        if (!response.ok) {
          console.warn('Failed to transfer playback:', response.status);
        } else {
          console.log('✅ Playback transferred successfully');
        }
      } catch (error) {
        console.error('❌ Error transferring playback:', error);
      }
    },
    []
  );

  const setupPlayer = useCallback(async () => {
    try {
      if (!spotifyToken) throw new Error('No Spotify token available');
      if (!window.Spotify || !window.Spotify.Player)
        throw new Error('Spotify SDK not loaded');

      const player = new window.Spotify.Player({
        name: 'Spotify Clone Player',
        getOAuthToken: (cb) => {
          cb(spotifyToken);
        },
        volume: 0.5,
      });

      playerRef.current = player;

      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setPlayerState((prev) => ({ ...prev, isReady: true }));
        setError(null);
        transferPlayback(device_id, spotifyToken);
      });

      player.addListener('not_ready', ({ device_id }) => {
        setPlayerState((prev) => ({ ...prev, isReady: false }));
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) return;
        setPlayerState({
          isPlaying: !state.paused,
          currentTrack: state.track_window.current_track,
          position: state.position,
          duration: state.duration,
          isReady: playerState.isReady,
        });
      });

      player.addListener('initialization_error', ({ message }) => {
        setError(`Initialization error: ${message}`);
      });

      player.addListener('authentication_error', ({ message }) => {
        setError(`Authentication error: ${message}`);
      });

      player.addListener('account_error', ({ message }) => {
        setError(`Account error: ${message}`);
      });

      const connected = await player.connect();
      if (!connected) throw new Error('Failed to connect to Spotify');
    } catch (err) {
      setError(err.message || 'Error setting up Spotify Player');
      console.error('❌ Error setting up player:', err);
    }
  }, [spotifyToken, transferPlayback, playerState.isReady]);

  // Initialize player
  useEffect(() => {
    if (!spotifyToken) {
      setError('No Spotify token available');
      return;
    }

    let mounted = true;

    const loadAndSetup = async () => {
      try {
        await new Promise((resolve, reject) => {
          loadSpotifySDK(() => {
            if (mounted) resolve();
          });
          setTimeout(() => {
            if (mounted) reject(new Error('Spotify SDK load timeout'));
          }, 10000);
        });

        if (mounted) {
          await setupPlayer();
        }
      } catch (err) {
        if (mounted) setError(`Failed to initialize: ${err.message}`);
      }
    };

    loadAndSetup();

    return () => {
      mounted = false;
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [spotifyToken, setupPlayer]);

  // Playback controls wrapped with useCallback
  const togglePlay = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.togglePlay();
    } catch (err) {
      console.error('❌ Error toggling playback:', err);
    }
  }, []);

  const nextTrack = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.nextTrack();
    } catch (err) {
      console.error('❌ Error skipping track:', err);
    }
  }, []);

  const previousTrack = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.previousTrack();
    } catch (err) {
      console.error('❌ Error going to previous track:', err);
    }
  }, []);

  if (!spotifyToken) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 text-center">
        <p>❌ No Spotify token - Please login first</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 border-t border-gray-700">
      <div className="max-w-screen-xl mx-auto">
        {/* Error */}
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

        {/* Loading */}
        {!playerState.isReady && !error && (
          <div className="text-center">
            <p>🔄 Loading Spotify Player...</p>
          </div>
        )}

        {/* Player controls */}
        {playerState.isReady && (
          <div className="flex items-center justify-between">
            {/* Current Track */}
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
                    <p className="font-semibold truncate">{playerState.currentTrack.name}</p>
                    <p className="text-gray-400 text-sm truncate">
                      {playerState.currentTrack.artists.map((a) => a.name).join(', ')}
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
                aria-label="Previous track"
              >
                ⏮️
              </button>
              <button
                onClick={togglePlay}
                className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform"
                disabled={!playerState.isReady}
                aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
              >
                {playerState.isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={nextTrack}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                disabled={!playerState.isReady}
                aria-label="Next track"
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
                    {String(Math.floor((playerState.position / 1000) % 60)).padStart(2, '0')}
                  </span>
                  <div className="flex-1 bg-gray-600 rounded-full h-1">
                    <div
                      className="bg-white rounded-full h-1 transition-all duration-500"
                      style={{
                        width:
                          playerState.duration > 0
                            ? `${(playerState.position / playerState.duration) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {Math.floor(playerState.duration / 1000 / 60)}:
                    {String(Math.floor((playerState.duration / 1000) % 60)).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Device ID info */}
        {deviceId && (
          <div className="mt-2 text-xs text-gray-500 text-center">Device ID: {deviceId}</div>
        )}
      </div>
    </div>
  );
}
