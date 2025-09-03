import { useEffect, useState } from 'react';

export function useSpotifyPlayer(token) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Dynamically load Spotify SDK script only once
    if (!document.getElementById('spotify-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    let playerInstance = null;
    let isMounted = true;

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!isMounted) return;

      playerInstance = new window.Spotify.Player({
        name: 'Spotify Clone Player',
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      // Error handlers
      playerInstance.addListener('initialization_error', ({ message }) =>
        console.error('Initialization error:', message)
      );
      playerInstance.addListener('authentication_error', ({ message }) =>
        console.error('Authentication error:', message)
      );
      playerInstance.addListener('account_error', ({ message }) =>
        console.error('Account error:', message)
      );
      playerInstance.addListener('playback_error', ({ message }) =>
        console.error('Playback error:', message)
      );

      // Ready event
      playerInstance.addListener('ready', async ({ device_id }) => {
        console.log('🎧 Ready with Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);

        // Transfer playback to this device
        try {
          const res = await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ device_ids: [device_id], play: false }),
          });

          if (!res.ok) {
            console.error('❌ Failed to transfer playback:', res.status, res.statusText);
          } else {
            console.log('✅ Playback transferred to this device');
          }
        } catch (err) {
          console.error('❌ Error transferring playback:', err);
        }
      });

      playerInstance.connect().then((success) => {
        if (success) {
          console.log('Spotify Player connected');
          setPlayer(playerInstance);
        } else {
          console.error('Failed to connect Spotify Player');
        }
      });
    };

    // Cleanup
    return () => {
      isMounted = false;
      if (playerInstance) {
        playerInstance.disconnect();
      }
      setPlayer(null);
      setDeviceId(null);
      setIsReady(false);
    };
  }, [token]);

  return { player, deviceId, isReady };
}
