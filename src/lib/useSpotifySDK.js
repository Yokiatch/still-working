// src/lib/useSpotifySDK.js
let sdkLoading = false;
let sdkLoaded = false;
let waiters = [];

export function loadSpotifySDK() {
  return new Promise((resolve, reject) => {
    if (sdkLoaded && window.Spotify?.Player) {
      resolve();
      return;
    }

    waiters.push({ resolve, reject });

    if (sdkLoading) return;
    sdkLoading = true;

    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onload = () => {
      // real ready event comes via window.onSpotifyWebPlaybackSDKReady
    };
    script.onerror = (e) => {
      sdkLoading = false;
      waiters.forEach(w => w.reject(new Error('Spotify SDK failed to load')));
      waiters = [];
    };

    window.onSpotifyWebPlaybackSDKReady = () => {
      sdkLoaded = true;
      sdkLoading = false;
      waiters.forEach(w => w.resolve());
      waiters = [];
    };

    document.head.appendChild(script);

    // fail-safe timeout
    setTimeout(() => {
      if (!sdkLoaded) {
        waiters.forEach(w => w.reject(new Error('Spotify SDK load timeout')));
        waiters = [];
        sdkLoading = false;
      }
    }, 15000);
  });
}
