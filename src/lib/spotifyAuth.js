import { supabase } from "./supabase";

export async function getSpotifyToken() {
  try {
    console.log("🔍 Checking for Spotify token...");
    
    // First, try to get fresh token from current session
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("❌ Session error:", error);
      return null;
    }

    const session = data.session;
    
    // Check if we have a fresh provider_token (most reliable)
    if (session?.provider_token) {
      console.log("✅ Found token from Supabase");
      localStorage.setItem("spotify_token", session.provider_token);
      
      // Also store refresh token if available
      if (session.provider_refresh_token) {
        localStorage.setItem("spotify_refresh_token", session.provider_refresh_token);
      }
      
      return session.provider_token;
    }

    // Second, check localStorage
    let spotifyToken = localStorage.getItem("spotify_token");
    if (spotifyToken) {
      console.log("✅ Found token in localStorage, validating...");
      
      // Validate the token
      const isValid = await validateToken(spotifyToken);
      if (isValid) {
        console.log("✅ Token is valid");
        return spotifyToken;
      } else {
        console.warn("⚠️ Token is expired, attempting refresh...");
        
        // Try to refresh the token
        const refreshedToken = await refreshSpotifyToken();
        if (refreshedToken) {
          return refreshedToken;
        }
        
        // Clear invalid token
        localStorage.removeItem("spotify_token");
      }
    }

    // Third, try to get from user metadata (fallback)
    if (session?.user?.user_metadata?.spotify_token) {
      const token = session.user.user_metadata.spotify_token;
      console.log("✅ Found token in user metadata");
      localStorage.setItem("spotify_token", token);
      return token;
    }

    console.warn("⚠️ No valid Spotify token found anywhere");
    return null;
    
  } catch (error) {
    console.error("💥 Error getting Spotify token:", error);
    return null;
  }
}

// Validate if token is still valid
async function validateToken(token) {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Token validation failed:', error);
    return false;
  }
}

// Refresh expired token using refresh token
async function refreshSpotifyToken() {
  try {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) {
      console.warn("⚠️ No refresh token available");
      return null;
    }

    console.log("🔄 Refreshing Spotify token...");

    // Note: You'll need to implement token refresh endpoint in your backend
    // This is just an example of how it might work
    const response = await fetch('/api/refresh-spotify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.access_token) {
        console.log("✅ Token refreshed successfully");
        localStorage.setItem("spotify_token", data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem("spotify_refresh_token", data.refresh_token);
        }
        
        return data.access_token;
      }
    }

    console.error("❌ Failed to refresh token");
    return null;
    
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    return null;
  }
}

// Enhanced token testing with detailed feedback
export async function testSpotifyToken() {
  const token = await getSpotifyToken();
  if (!token) {
    return { 
      valid: false, 
      error: "No token available",
      action: "Login required"
    };
  }
  
  try {
    console.log("🧪 Testing Spotify token...");
    
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const profile = await response.json();
      console.log("✅ Token is valid");
      return { 
        valid: true, 
        profile,
        token 
      };
    } else if (response.status === 401) {
      console.error('❌ Token validation failed: 401');
      
      // Try to refresh token
      const refreshedToken = await refreshSpotifyToken();
      if (refreshedToken) {
        // Test the refreshed token
        return await testSpotifyToken();
      }
      
      return { 
        valid: false, 
        error: `HTTP ${response.status}`,
        action: "Re-authentication required"
      };
    } else {
      console.error('❌ Token validation failed:', response.status);
      return { 
        valid: false, 
        error: `HTTP ${response.status}`,
        action: "Check token permissions"
      };
    }
  } catch (error) {
    console.error('❌ Token test error:', error);
    return { 
      valid: false, 
      error: error.message,
      action: "Check network connection"
    };
  }
}

// Clear all stored tokens (for logout)
export function clearSpotifyTokens() {
  localStorage.removeItem("spotify_token");
  localStorage.removeItem("spotify_refresh_token");
  console.log("🧹 Cleared all Spotify tokens");
}

// Get user profile with enhanced error handling
export async function getSpotifyProfile() {
  const token = await getSpotifyToken();
  if (!token) return null;

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to get user profile:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}