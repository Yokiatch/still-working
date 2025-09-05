// src/components/MusicBrowser.jsx
import React, { useEffect, useState } from 'react';
import { searchTracks, getFeaturedPlaylists, play as apiPlay, transferPlayback } from '../lib/spotifyApi';
import useSpotifyPlayer from '../hooks/useSpotifyPlayer';

export default function MusicBrowser() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { deviceId, isReady, play } = useSpotifyPlayer();

  async function onSearch(e) {
    e.preventDefault();
    if (!query) return;
    const tracks = await searchTracks(query, 20);
    setResults(tracks);
  }

  async function onPlayTrack(track) {
    try {
      // Ensure we are playing on the web player device
      if (!deviceId) {
        alert("Player not ready yet. Open TestSpotifySDK or wait until the web player initializes.");
        return;
      }
      // Transfer playback (do not auto-start playback in user's other sessions)
      await transferPlayback(deviceId, true);
      // Play the track URI via the Web API
      await apiPlay({ device_id: deviceId, uris: [track.uri] });
    } catch (e) {
      console.error(e);
      alert('Failed to start playback: ' + (e.message || e));
    }
  }

  return (
    <div>
      <form onSubmit={onSearch} className="flex items-center gap-2 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tracks..." className="px-3 py-2 rounded bg-white/5 flex-1" />
        <button type="submit" className="px-3 py-2 rounded bg-[#1DB954] text-black">Search</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(t => (
          <div key={t.id} className="p-3 bg-white/3 rounded flex items-center gap-3">
            <div className="w-16 h-16 overflow-hidden rounded">
              <img src={t.album.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-white/60">{t.artists.map(a=>a.name).join(', ')}</div>
            </div>
            <div>
              <button onClick={()=>onPlayTrack(t)} className="px-3 py-1 rounded bg-white/8">Play</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
