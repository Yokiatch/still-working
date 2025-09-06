import React from "react";
import { Home, Search, Library, PlusCircle, Heart } from "lucide-react";

export default function Sidebar({ playlists = [] }) {
  return (
    <>
      {/* Logo */}
      <div className="spotify-logo">
        <div className="spotify-logo-icon">S</div>
        <span className="spotify-logo-text">Spotify</span>
      </div>

      {/* Navigation */}
      <nav className="nav-menu">
        <a className="nav-item active">
          <Home size={24} />
          Home
        </a>
        <a className="nav-item">
          <Search size={24} />
          Search
        </a>
        <a className="nav-item">
          <Library size={24} />
          Your Library
        </a>
      </nav>

      <div className="nav-divider" />

      {/* Create and Liked buttons */}
      <nav className="nav-menu">
        <a className="nav-item">
          <PlusCircle size={24} />
          Create Playlist
        </a>
        <a className="nav-item">
          <Heart size={24} />
          Liked Songs
        </a>
      </nav>

      <div className="nav-divider" />

      {/* Real User Playlists */}
      <div className="playlist-section">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <a key={playlist.id} className="playlist-item" title={playlist.name}>
              {playlist.name}
            </a>
          ))
        ) : (
          <>
            <div className="playlist-item">Loading playlists...</div>
          </>
        )}
      </div>
    </>
  );
}
