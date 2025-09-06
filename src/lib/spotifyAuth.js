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
  
  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (res.ok) {
      const profile = await res.json();
      return { valid: true, profile };
    } else {
      return { valid: false, error: `HTTP ${res.status}` };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
  }
}
