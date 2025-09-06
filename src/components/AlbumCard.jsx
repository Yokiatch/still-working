import React from "react";
import { Play } from "lucide-react";
import { play } from "../lib/spotifyApi";
import useSpotifyPlayer from "../hooks/useSpotifyPlayer";

export default function AlbumCard({ name, artist, img, uri }) {
  const { deviceId, isReady } = useSpotifyPlayer();

  const handlePlay = async () => {
    if (!isReady || !deviceId || !uri) {
      console.warn("Player not ready or no URI provided");
      return;
    }

    try {
      await play({ 
        device_id: deviceId, 
        uris: [uri] 
      });
    } catch (error) {
      console.error("Failed to play:", error);
    }
  };

  return (
    <div className="album-card">
      <img src={img} alt={name} className="album-image" />
      <div className="album-title">{name}</div>
      <div className="album-artist">{artist}</div>
      <button className="play-button" onClick={handlePlay}>
        <Play size={20} fill="currentColor" />
      </button>
    </div>
  );
}
