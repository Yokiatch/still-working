// src/TestSpotifySDK.jsx
import { useEffect, useRef, useState } from "react";
import { loadSpotifySDK } from "./lib/useSpotifySDK";
import { getSpotifyToken, testSpotifyToken } from "./lib/spotifyAuth";

export default function TestSpotifySDK() {
  const [status, setStatus] = useState("Loading Spotify player");
  const [tokenStatus, setTokenStatus] = useState("Checking token...");
  const [userProfile, setUserProfile] = useState(null);
  const playerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // First, test the token
    testSpotifyToken().then(result => {
      if (!mounted) return;
      
      if (result.valid) {
        setTokenStatus(`✅ Token valid - User: ${result.profile?.display_name}`);
        setUserProfile(result.profile);
      } else {
        setTokenStatus(`❌ Token invalid: ${result.error}`);
        return; // Don't proceed with SDK if token is invalid
      }
    });

    loadSpotifySDK(async () => {
      const token = await getSpotifyToken();
      if (!mounted) return;
      if (!token) { 
        setStatus("❌ No Spotify token"); 
        return; 
      }

      console.log("🎵 Initializing Spotify Player with token...");

      const player = new window.Spotify.Player({
        name: "Spotify Clone Web Player",
        getOAuthToken: cb => {
          console.log("🔑 Spotify SDK requesting token...");
          cb(token);
        },
        volume: 0.5
      });

      player.addListener("ready", async ({ device_id }) => {
        console.log("✅ Player ready with device ID:", device_id);
        setStatus(`✅ Player ready (${device_id})`);
        
        try {
          await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: { 
              Authorization: `Bearer ${token}`, 
              "Content-Type": "application/json" 
            },
            body: JSON.stringify({ device_ids: [device_id], play: false })
          });
          console.log("✅ Device transferred successfully");
        } catch (error) {
          console.error("❌ Device transfer failed:", error);
        }
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("❌ Device has gone offline", device_id);
        setStatus("❌ Player not ready");
      });
      
      player.addListener("initialization_error", ({ message }) => {
        console.error("❌ Initialization error:", message);
        setStatus(`❌ Init error: ${message}`);
      });
      
      player.addListener("authentication_error", ({ message }) => {
        console.error("❌ Authentication error:", message);
        setStatus(`❌ Auth error: ${message}`);
      });
      
      player.addListener("account_error", ({ message }) => {
        console.error("❌ Account error:", message);
        setStatus(`❌ Account error: ${message}`);
      });

      console.log("🔌 Connecting to Spotify...");
      player.connect();
      playerRef.current = player;
    });

    return () => {
      mounted = false;
      if (playerRef.current) {
        console.log("🔌 Disconnecting player...");
        playerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Spotify Web Player</h2>
        <a 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          ← Back to Home
        </a>
      </div>

      <div className="grid gap-4">
        {/* User Profile */}
        {userProfile && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Spotify Profile</h3>
            <div className="flex items-center space-x-4">
              {userProfile.images?.[0] && (
                <img 
                  src={userProfile.images[0].url} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{userProfile.display_name}</p>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
                <p className="text-xs text-gray-500">
                  Followers: {userProfile.followers?.total || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Token Status */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">Authentication Status</h3>
          <p className={`text-sm ${tokenStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {tokenStatus}
          </p>
        </div>

        {/* Player Status */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">Player Status</h3>
          <p className={`text-sm ${status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-800">Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure you have Spotify Premium for the Web Player to work</li>
            <li>• Check your Spotify app - this device should appear in "Connect to a device"</li>
            <li>• You can now control playback from your Spotify app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
