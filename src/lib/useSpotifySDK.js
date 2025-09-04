// src/lib/useSpotifySDK.js
let sdkLoading = false, sdkLoaded = false, callbacks = [];

export function loadSpotifySDK(onReady) {
  return new Promise((res, rej) => {
    if (sdkLoaded && window.Spotify?.Player) {
      onReady(); return res();
    }
    callbacks.push({ onReady, res, rej });
    if (sdkLoading) return;
    sdkLoading = true;

    const s = document.createElement('script');
    s.id = 'spotify-sdk';
    s.src = 'https://sdk.scdn.co/spotify-player.js';
    s.async = true;
    s.onerror = () => {
      callbacks.forEach(c => c.rej(new Error('SDK load failed')));
      callbacks = [];
    };
    window.onSpotifyWebPlaybackSDKReady = () => {
      sdkLoaded = true; sdkLoading = false;
      callbacks.forEach(c => { c.onReady(); c.res(); });
      callbacks = [];
    };
    document.head.appendChild(s);
    setTimeout(() => {
      if (!sdkLoaded) {
        callbacks.forEach(c => c.rej(new Error('SDK timeout')));
        callbacks = [];
      }
    }, 15000);
  });
}
