let sdkLoading = false;
let sdkLoaded = false;
let sdkCallbacks = [];

export function loadSpotifySDK(onReady) {
  return new Promise((resolve, reject) => {
    // If SDK is already loaded, call callback immediately
    if (sdkLoaded && window.Spotify && window.Spotify.Player) {
      console.log('✅ Spotify SDK already loaded');
      onReady();
      resolve();
      return;
    }

    // Add callback to queue
    sdkCallbacks.push({ onReady, resolve, reject });

    // If SDK is already being loaded, just wait for it
    if (sdkLoading) {
      console.log('⏳ Spotify SDK already loading...');
      return;
    }

    sdkLoading = true;
    console.log('📥 Loading Spotify SDK...');

    // Check if script already exists (for example, from previous load)
    const existingScript = document.getElementById('spotify-sdk');
    if (existingScript) {
      console.log('🔄 Spotify SDK script exists, waiting for load...');
      
      // Setup the ready callback
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('✅ Spotify SDK loaded successfully');
        sdkLoaded = true;
        sdkLoading = false;
        
        // Call all queued callbacks
        sdkCallbacks.forEach(({ onReady, resolve }) => {
          try {
            onReady();
            resolve();
          } catch (error) {
            console.error('❌ Error in SDK ready callback:', error);
          }
        });
        sdkCallbacks = [];
      };
      
      return;
    }

    // Create and inject the script dynamically
    try {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      script.onload = () => {
        console.log('📦 Spotify SDK script loaded');
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load Spotify SDK script:', error);
        sdkLoading = false;

        // Reject all queued promises
        sdkCallbacks.forEach(({ reject }) => {
          reject(new Error('Failed to load Spotify SDK script'));
        });
        sdkCallbacks = [];
      };

      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('✅ Spotify SDK ready!');
        
        if (!window.Spotify || !window.Spotify.Player) {
          console.error('❌ Spotify SDK loaded but Player not available');
          sdkLoading = false;
          sdkCallbacks.forEach(({ reject }) => {
            reject(new Error('Spotify.Player not available after SDK load'));
          });
          sdkCallbacks = [];
          return;
        }

        sdkLoaded = true;
        sdkLoading = false;

        // Call all queued callbacks
        sdkCallbacks.forEach(({ onReady, resolve }) => {
          try {
            onReady();
            resolve();
          } catch (error) {
            console.error('❌ Error in SDK ready callback:', error);
          }
        });
        sdkCallbacks = [];
      };

      document.head.appendChild(script);

      // Timeout backup: reject promises if SDK doesn’t load in 15s
      setTimeout(() => {
        if (!sdkLoaded && sdkLoading) {
          console.error('❌ Spotify SDK load timeout');
          sdkLoading = false;
          sdkCallbacks.forEach(({ reject }) => {
            reject(new Error('Spotify SDK load timeout'));
          });
          sdkCallbacks = [];
        }
      }, 15000);
    } catch (error) {
      console.error('❌ Error creating Spotify SDK script:', error);
      sdkLoading = false;
      sdkCallbacks.forEach(({ reject }) => {
        reject(error);
      });
      sdkCallbacks = [];
    }
  });
}

// Utility to check if Spotify Web Playback SDK is ready
export function isSpotifySDKReady() {
  return sdkLoaded && window.Spotify && window.Spotify.Player;
}

// Utility to wait for SDK readiness within a timeout (default 10s)
export function waitForSpotifySDK(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (isSpotifySDKReady()) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (isSpotifySDKReady()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for Spotify SDK'));
      }
    }, 100);
  });
}

// Clean up SDK script and reset state variables
export function cleanupSpotifySDK() {
  const script = document.getElementById('spotify-sdk');
  if (script) {
    script.remove();
  }

  sdkLoaded = false;
  sdkLoading = false;
  sdkCallbacks = [];

  if (window.onSpotifyWebPlaybackSDKReady) {
    delete window.onSpotifyWebPlaybackSDKReady;
  }

  console.log('🧹 Spotify SDK cleaned up');
}
