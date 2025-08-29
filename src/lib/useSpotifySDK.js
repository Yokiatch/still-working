export function loadSpotifySDK(onReady) {
  if (window.Spotify) { onReady(); return; }
  if (!document.getElementById('spotify-sdk')) {
    window.onSpotifyWebPlaybackSDKReady = onReady;
    const s = document.createElement('script');
    s.id = 'spotify-sdk';
    s.src = 'https://sdk.scdn.co/spotify-player.js';
    s.async = true;
    document.body.appendChild(s);
  } else {
    window.onSpotifyWebPlaybackSDKReady = onReady;
  }
}
