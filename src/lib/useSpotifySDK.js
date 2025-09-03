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

    // If SDK is already being loaded, just wait
    if (sdkLoading) {
      console.log('⏳ Spotify SDK already loading...');
      return;
    }

    sdkLoading = true;
    console.log('📥 Loading Spotify SDK...');

    // Check if script already exists
    const existingScript = document.getElementById('spotify-sdk');
    if (existingScript) {
      console.log('🔄 Spotify SDK script exists, waiting for load...');
      
      // Set up the ready callback
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

    // Create and inject the script
    try {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      
      // Success handler
      script.onload = () => {
        console.log('📦 Spotify SDK script loaded');
      };
      
      // Error handler
      script.onerror = (error) => {
        console.error('❌ Failed to load Spotify SDK script:', error);
        sdkLoading = false;
        
        // Reject all queued promises
        sdkCallbacks.forEach(({ reject }) => {
          reject(new Error('Failed to load Spotify SDK script'));
        });
        sdkCallbacks = [];
      };

      // Set up the ready callback before adding script
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('✅ Spotify SDK ready!');
        
        // Double check that Spotify.Player exists
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
            // Don't reject here, the callback itself failed
          }
        });
        sdkCallbacks = [];
      };

      // Add script to document
      document.head.appendChild(script);
      
      // Set timeout as backup
      setTimeout(() => {
        if (!sdkLoaded && sdkLoading) {
          console.error('❌ Spotify SDK load timeout');
          sdkLoading = false;
          
          sdkCallbacks.forEach(({ reject }) => {
            reject(new Error('Spotify SDK load timeout'));
          });
          sdkCallbacks = [];
        }
      }, 15000); // 15 second timeout
      
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

// Utility to check if SDK is ready
export function isSpotifySDKReady() {
  return sdkLoaded && window.Spotify && window.Spotify.Player;
}

// Utility to wait for SDK with timeout
export function waitForSpotifySDK(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (isSpotifySDKReady()) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isSpotifySDKReady()) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for Spotify SDK'));
      }
    }, 100);
  });
}

// Clean up function
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