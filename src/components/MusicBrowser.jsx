// src/components/MusicBrowser.jsx
import { useEffect, useState } from 'react';
import {
  searchTracks,
  getUserPlaylists,
  getPlaylistTracks,
  getFeaturedPlaylists,
  getUserTopTracks,
  getRecentlyPlayed
} from '../lib/spotifyApi';

export default function MusicBrowser({ deviceId }) {
  const [tab, setTab] = useState('home');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [lists, setLists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tab === 'home') {
      Promise.all([getFeaturedPlaylists(), getUserTopTracks(), getRecentlyPlayed()])
        .then(([f, t, r]) => { setLists(f); setTracks([...t, ...r]); })
        .catch(e => setError(e.message));
    }
    if (tab === 'playlists') {
      getUserPlaylists().then(setLists).catch(e=>setError(e.message));
    }
  }, [tab]);

  const doSearch = e => {
    e.preventDefault();
    searchTracks(search).then(setResults).catch(e=>setError(e.message));
    setTab('search');
  };

  const play = uri => {
    if (deviceId) window.handlePlay(uri);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={doSearch} className="flex gap-2">
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search songs…" className="flex-1 border px-2 py-1"
        />
        <button className="bg-green-500 text-white px-4">Search</button>
      </form>

      <div className="flex space-x-2">
        {['home','search','playlists'].map(t => (
          <button
            key={t} onClick={()=>setTab(t)}
            className={`px-3 py-1 ${tab===t?'bg-green-200':'bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {tab==='search' && results.map(track=>(
        <div
          key={track.id}
          onClick={()=>play(track.uri)}
          className="p-2 border-b hover:bg-gray-50 cursor-pointer">
          {track.name} — {track.artists.map(a=>a.name).join(', ')}
        </div>
      ))}

      {tab!=='search' && lists.map(item=>(
        <div
          key={item.id}
          onClick={()=> item.tracks ? setTracks([]) : null}
          className="p-2 border-b hover:bg-gray-50 cursor-pointer">
          {item.name || item.id}
        </div>
      ))}

      {tab!=='search' && tracks.map(tr=>(
        <div
          key={tr.id}
          onClick={()=>play(tr.uri)}
          className="p-2 border-b hover:bg-gray-50 cursor-pointer">
          {tr.name}
        </div>
      ))}
    </div>
  );
}
