// src/lib/spotifyApi.js
import { getSpotifyToken } from './spotifyAuth';

const BASE = 'https://api.spotify.com/v1';

async function call(endpoint, opts = {}) {
  const token = await getSpotifyToken();
  if (!token) throw new Error('No Spotify token available');
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    ...opts,
  });
  if (res.status === 204) return null; // no content
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Spotify API ${res.status} ${text}`);
  }
  return res.json();
}

export async function transferPlayback(device_id, play = true) {
  return call('/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [device_id], play }),
  });
}

export async function play({ device_id, uris, context_uri, position_ms = 0, offset = 0 } = {}) {
  const qs = device_id ? `?device_id=${encodeURIComponent(device_id)}` : '';
  const body = {};
  if (uris) body.uris = Array.isArray(uris) ? uris : [uris];
  if (context_uri) body.context_uri = context_uri;
  if (position_ms) body.position_ms = position_ms;
  if (offset) body.offset = typeof offset === 'number' ? { position: offset } : offset;
  return call(`/me/player/play${qs}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function pause(device_id) {
  const qs = device_id ? `?device_id=${encodeURIComponent(device_id)}` : '';
  return call(`/me/player/pause${qs}`, { method: 'PUT' });
}

export async function next(device_id) {
  const qs = device_id ? `?device_id=${encodeURIComponent(device_id)}` : '';
  return call(`/me/player/next${qs}`, { method: 'POST' });
}

export async function previous(device_id) {
  const qs = device_id ? `?device_id=${encodeURIComponent(device_id)}` : '';
  return call(`/me/player/previous${qs}`, { method: 'POST' });
}

export async function seek(position_ms, device_id) {
  const qs = device_id ? `?position_ms=${position_ms}&device_id=${encodeURIComponent(device_id)}` : `?position_ms=${position_ms}`;
  return call(`/me/player/seek${qs}`, { method: 'PUT' });
}

export async function setVolume(volume, device_id) {
  // volume between 0-100 (Spotify API)
  const vol = Math.round(Math.min(100, Math.max(0, volume * 100)));
  const qs = device_id ? `?volume_percent=${vol}&device_id=${encodeURIComponent(device_id)}` : `?volume_percent=${vol}`;
  return call(`/me/player/volume${qs}`, { method: 'PUT' });
}

export async function searchTracks(q, limit = 20) {
  const qs = `/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`;
  const data = await call(qs);
  return data.tracks.items;
}

export async function getUserPlaylists(limit = 30) {
  const data = await call(`/me/playlists?limit=${limit}`);
  return data.items;
}

export async function getPlaylistTracks(playlistId, limit = 100) {
  const data = await call(`/playlists/${playlistId}/tracks?limit=${limit}`);
  return data.items;
}

// FIXED: Remove the invalid country parameter
export async function getFeaturedPlaylists(limit = 20) {
  try {
    const data = await call(`/browse/featured-playlists?limit=${limit}`);
    return data.playlists.items;
  } catch (error) {
    console.warn('Featured playlists not available:', error.message);
    return [];
  }
}

export async function getUserTopTracks(limit = 20) {
  try {
    const data = await call(`/me/top/tracks?limit=${limit}`);
    return data.items;
  } catch (error) {
    console.warn('Top tracks not available:', error.message);
    return [];
  }
}

export async function getRecentlyPlayed(limit = 20) {
  try {
    const data = await call(`/me/player/recently-played?limit=${limit}`);
    return data.items.map(i => i.track);
  } catch (error) {
    console.warn('Recently played not available:', error.message);
    return [];
  }
}

// NEW: Add some alternative data sources that are more likely to work
export async function getNewReleases(limit = 20) {
  try {
    const data = await call(`/browse/new-releases?limit=${limit}`);
    return data.albums.items;
  } catch (error) {
    console.warn('New releases not available:', error.message);
    return [];
  }
}

export async function getCategories(limit = 20) {
  try {
    const data = await call(`/browse/categories?limit=${limit}`);
    return data.categories.items;
  } catch (error) {
    console.warn('Categories not available:', error.message);
    return [];
  }
}

// Get user's saved albums
export async function getUserSavedAlbums(limit = 20) {
  try {
    const data = await call(`/me/albums?limit=${limit}`);
    return data.items.map(i => i.album);
  } catch (error) {
    console.warn('Saved albums not available:', error.message);
    return [];
  }
}
