// src/components/Player.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { loadSpotifySDK } from '../lib/useSpotifySDK';
import { playTrack } from '../lib/spotifyApi';

export default function Player({ onDeviceReady }) {
  const [deviceId, setDeviceId] = useState('');
  const playerRef = useRef(null);

  const setup = useCallback(async (token) => {
    const player = new window.Spotify.Player({
      name: 'Spotify Clone',
      getOAuthToken: cb => cb(token),
      volume: 0.5,
    });
    playerRef.current = player;
    player.addListener('ready', ({ device_id }) => {
      setDeviceId(device_id);
      onDeviceReady(device_id);
    });
    player.connect();
  }, [onDeviceReady]);

  useEffect(() => {
    loadSpotifySDK(async () => {
      // get token via spotifyAuth
      const { supabase } = await import('../lib/spotifyAuth');
      const token = await import('../lib/spotifyAuth').then(m => m.getSpotifyToken());
      if (token) setup(token);
    }).catch(console.error);
    return () => playerRef.current?.disconnect();
  }, [setup]);

  const handlePlay = useCallback((uri) => {
    if (deviceId) playTrack(deviceId, [uri]);
  }, [deviceId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-semibold mb-2">Player</h2>
      {deviceId
        ? <p className="text-green-600">Device Ready: {deviceId.slice(0,8)}</p>
        : <p>Initializing...</p>}
      {/* Expose handlePlay via window for demo */}
      <button onClick={()=>window.handlePlay=handlePlay} className="mt-2 text-sm text-gray-500">
        🔗 Click to bind window.handlePlay(uri)
      </button>
    </div>
  );
}
