// src/lib/spotifyApi.js
import { getSpotifyToken } from './spotifyAuth';

const BASE = 'https://api.spotify.com/v1';

async function call(endpoint, opts = {}) {
  const token = await getSpotifyToken();
  if (!token) throw new Error('No token');
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export function searchTracks(query) {
  return call(`/search?q=${encodeURIComponent(query)}&type=track&limit=20`)
    .then(data => data.tracks.items);
}

export function getUserPlaylists() {
  return call('/me/playlists').then(data => data.items);
}

export function getPlaylistTracks(id) {
  return call(`/playlists/${id}/tracks`)
    .then(data => data.items.map(i => i.track));
}

export function playTrack(deviceId, uris) {
  return call('/me/player/play', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], uris }),
  });
}

export function getCurrentPlayback() {
  return call('/me/player');
}

export function getFeaturedPlaylists() {
  return call(
    '/browse/featured-playlists?country=from_token&limit=20'
  ).then(data => data.playlists.items);
}

export function getUserTopTracks() {
  return call('/me/top/tracks').then(data => data.items);
}

export function getRecentlyPlayed() {
  return call('/me/player/recently-played').then(data => data.items.map(i => i.track));
}
