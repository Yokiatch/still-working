// src/lib/spotifyAuth.js
import { supabase } from "./supabase";

export async function getSpotifyToken() {
  try {
    console.log("🔍 Checking for Spotify token...");
    
    // First, try to get from localStorage
    let spotifyToken = localStorage.getItem("spotify_token");
    if (spotifyToken) {
      console.log("✅ Found token in localStorage");
      return spotifyToken;
    }
    
    // Second, check current session (only works immediately after login)
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("❌ Session error:", error);
      return null;
    }
    
    const session = data.session;
    if (session?.provider_token) {
      console.log("✅ Found fresh provider_token in session");
      localStorage.setItem("spotify_token", session.provider_token);
      return session.provider_token;
    }
    
    // Third, try to get from user metadata
    if (session?.user?.user_metadata?.spotify_token) {
      const token = session.user.user_metadata.spotify_token;
      console.log("✅ Found token in user metadata");
      localStorage.setItem("spotify_token", token);
      return token;
    }
    
    console.warn("⚠️ No Spotify token found anywhere");
    return null;
    
  } catch (error) {
    console.error("💥 Error getting Spotify token:", error);
    return null;
  }
}

export async function testSpotifyToken() {
  const token = await getSpotifyToken();
  if (!token) return { valid: false, error: "No token available" };
  
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const profile = await response.json();
      return { valid: true, profile };
    } else {
      console.error('Token validation failed:', response.status);
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
