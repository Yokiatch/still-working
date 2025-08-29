import { useEffect, useRef, useState } from "react";
import { loadSpotifySDK } from "./lib/useSpotifySDK";
import { getSpotifyToken } from "./lib/spotifyAuth";

export default function TestSpotifySDK() {
  const [status, setStatus] = useState("Loading Spotify player");
  const playerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    loadSpotifySDK(async () => {
      const token = await getSpotifyToken();
      if (!mounted) return;
      if (!token) { setStatus("No Spotify token"); return; }

      const player = new window.Spotify.Player({
        name: "Web Player",
        getOAuthToken: cb => cb(token),
        volume: 0.5
      });

      player.addListener("ready", async ({ device_id }) => {
        setStatus("Player ready");
        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ device_ids: [device_id], play: false })
        });
      });

      player.addListener("not_ready", () => setStatus("Player not ready"));
      player.addListener("initialization_error", e => setStatus(e?.message || "Init error"));
      player.addListener("authentication_error", e => setStatus(e?.message || "Auth error"));
      player.addListener("account_error", e => setStatus(e?.message || "Account error"));

      player.connect();
      playerRef.current = player;
    });

    return () => {
      mounted = false;
      if (playerRef.current) playerRef.current.disconnect();
    };
  }, []);

  return <div>{status}</div>;
}
