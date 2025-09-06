import React, { useState } from "react";
import { Home, Search, Library, PlusCircle, Heart, Menu, X } from "lucide-react";

export default function Sidebar({ playlists = [], loading = false, error = null }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Nav Toggle Button */}
      <button 
        className="mobile-nav-toggle"
        onClick={toggleMobile}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <div className={`spotify-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Mobile Close Button */}
        <button 
          className="mobile-close-btn"
          onClick={closeMobile}
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="spotify-logo">
          <div className="spotify-logo-icon">S</div>
          <span className="spotify-logo-text">Spotify</span>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <Home size={24} />
            <span>Home</span>
          </a>
          <a href="#" className="nav-item">
            <Search size={24} />
            <span>Search</span>
          </a>
          <a href="#" className="nav-item">
            <Library size={24} />
            <span>Your Library</span>
          </a>
        </nav>

        {/* Divider */}
        <div className="nav-divider"></div>

        {/* Create and Liked buttons */}
        <nav className="nav-menu">
          <a href="#" className="nav-item">
            <PlusCircle size={24} />
            <span>Create Playlist</span>
          </a>
          <a href="#" className="nav-item">
            <Heart size={24} />
            <span>Liked Songs</span>
          </a>
        </nav>

        {/* Another Divider */}
        <div className="nav-divider"></div>

        {/* User Playlists Section */}
        <div className="playlist-section">
          {loading ? (
            <div className="playlist-loading">
              <div className="playlist-item">
                <div className="loading-spinner"></div>
                Loading playlists...
              </div>
            </div>
          ) : error ? (
            <div className="playlist-error">
              <div className="playlist-item text-red-400">
                Failed to load playlists
              </div>
              <button 
                className="playlist-item text-spotify-green hover:text-spotify-green-hover"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : playlists.length > 0 ? (
            <div className="playlist-list">
              {playlists.map((playlist) => (
                <a 
                  key={playlist.id}
                  href="#" 
                  className="playlist-item"
                  title={playlist.name}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Playlist clicked:', playlist.name);
                    // Add playlist navigation logic here
                  }}
                >
                  {playlist.name}
                </a>
              ))}
            </div>
          ) : (
            <div className="playlist-empty">
              <div className="playlist-item text-text-subdued">
                No playlists found
              </div>
              <div className="playlist-item text-text-subdued text-xs">
                Create your first playlist!
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
