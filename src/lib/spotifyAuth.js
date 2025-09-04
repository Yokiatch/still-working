// src/lib/spotifyAuth.js
import { supabase } from './supabase';

export async function getSpotifyToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  const token = data.session.provider_token;
  return token || null;
}

export async function testSpotifyToken() {
  const token = await getSpotifyToken();
  if (!token) return { valid: false, error: 'No token' };
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok
    ? { valid: true }
    : { valid: false, error: `HTTP ${res.status}` };
}
