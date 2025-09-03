export async function searchTracks(query, token) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.tracks.items;
}

export async function getUserPlaylists(token) {
  const res = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.items;
}

export async function getPlaylistTracks(id, token) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.items.map(item => item.track);
}
