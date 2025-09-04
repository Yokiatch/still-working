import { useEffect } from 'react';

export default function QuickTest() {
  useEffect(() => {
    // Load SDK script manually
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('🎵 SDK Ready, window.Spotify available:', !!window.Spotify);
      
      // Get token manually from localStorage for testing
      const token = localStorage.getItem('spotify_token');
      console.log('🔑 Token available:', !!token);
      
      if (!token) {
        console.error('❌ No token in localStorage. Login first.');
        return;
      }
      
      try {
        const player = new window.Spotify.Player({
          name: 'Debug Test Player',
          getOAuthToken: cb => {
            console.log('🔑 SDK requesting token...');
            cb(token);
          },
          volume: 0.5
        });

        player.addListener('ready', ({ device_id }) => {
          console.log('✅ SUCCESS: Player ready with device ID:', device_id);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('❌ Player not ready:', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('❌ Initialization error:', message);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('❌ Authentication error:', message);
        });

        player.addListener('account_error', ({ message }) => {
          console.error('❌ Account error (Premium required?):', message);
        });

        console.log('🔌 Connecting player...');
        player.connect().then(success => {
          console.log('🔌 Connection result:', success);
        });

      } catch (error) {
        console.error('❌ Player creation failed:', error);
      }
    };

    return () => {
      if (script.parentNode) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Quick Spotify SDK Test</h2>
      <p>Check browser console for detailed logs.</p>
    </div>
  );
}
