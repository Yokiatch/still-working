import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AlbumCard from "./components/AlbumCard";
import Player from "./components/Player";
import { useAuth } from "./contexts/AuthContext";
import { 
  getUserPlaylists, 
  getFeaturedPlaylists, 
  getRecentlyPlayed, 
  getUserTopTracks,
  getNewReleases,
  getUserSavedAlbums
} from "./lib/spotifyApi";

export default function App() {
  const { session } = useAuth();
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSpotifyData() {
      if (!session) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load data with individual error handling
        const results = await Promise.allSettled([
          getUserPlaylists(20),
          getFeaturedPlaylists(20),
          getRecentlyPlayed(20),
          getUserTopTracks(20),
          getNewReleases(20),
          getUserSavedAlbums(20)
        ]);

        // Process results
        if (results[0].status === 'fulfilled') {
          setUserPlaylists(results[0].value || []);
        }
        
        if (results[1].status === 'fulfilled') {
          setFeaturedPlaylists(results[1].value || []);
        }
        
        if (results[2].status === 'fulfilled') {
          setRecentlyPlayed(results[2].value || []);
        }
        
        if (results[3].status === 'fulfilled') {
          setTopTracks(results[3].value || []);
        }

        if (results[4].status === 'fulfilled') {
          setNewReleases(results[4].value || []);
        }

        if (results[5].status === 'fulfilled') {
          setSavedAlbums(results[5].value || []);
        }

        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`API call ${index} failed:`, result.reason);
          }
        });
        
      } catch (error) {
        console.error('Error loading Spotify data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadSpotifyData();
  }, [session]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatAlbumForCard = (album) => ({
    name: album.name,
    artist: album.artists.map(a => a.name).join(', '),
    img: album.images[0]?.url || 'https://via.placeholder.com/300',
    uri: album.uri
  });

  const formatTrackForCard = (track) => ({
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    img: track.album.images[0]?.url || 'https://via.placeholder.com/300',
    uri: track.uri
  });

  const formatPlaylistForCard = (playlist) => ({
    name: playlist.name,
    artist: playlist.description || 'Playlist',
    img: playlist.images[0]?.url || 'https://via.placeholder.com/300',
    uri: playlist.uri
  });

  return (
    <div className="spotify-app">
      {/* Sidebar */}
      <div className="spotify-sidebar">
        <Sidebar playlists={userPlaylists} />
      </div>

      {/* Main Content */}
      <div className="spotify-main">
        <div className="main-content">
          <Topbar />
          
          {/* Greeting */}
          <div className="greeting-section">
            <h1 className="greeting-title">{getGreeting()}</h1>
          </div>

          {error && (
            <div className="content-section">
              <div className="error-message" style={{ color: '#ff6b6b', padding: '20px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', marginBottom: '32px' }}>
                Failed to load some Spotify data: {error}
              </div>
            </div>
          )}

          {/* Recently played section */}
          {recentlyPlayed.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Recently played</h2>
                <a href="#" className="show-all-link">Show all</a>
              </div>
              <div className="card-grid">
                {recentlyPlayed.slice(0, 6).map((track, i) => (
                  <AlbumCard 
                    key={`recent-${i}`}
                    {...formatTrackForCard(track)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Your top tracks */}
          {topTracks.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Your top tracks</h2>
                <a href="#" className="show-all-link">Show all</a>
              </div>
              <div className="card-grid">
                {topTracks.slice(0, 6).map((track, i) => (
                  <AlbumCard 
                    key={`top-${i}`}
                    {...formatTrackForCard(track)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* New Releases */}
          {newReleases.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">New releases</h2>
                <a href="#" className="show-all-link">Show all</a>
              </div>
              <div className="card-grid">
                {newReleases.slice(0, 6).map((album, i) => (
                  <AlbumCard 
                    key={`new-${i}`}
                    {...formatAlbumForCard(album)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Your saved albums */}
          {savedAlbums.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Your albums</h2>
                <a href="#" className="show-all-link">Show all</a>
              </div>
              <div className="card-grid">
                {savedAlbums.slice(0, 6).map((album, i) => (
                  <AlbumCard 
                    key={`saved-${i}`}
                    {...formatAlbumForCard(album)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured playlists (if available) */}
          {featuredPlaylists.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Made for you</h2>
                <a href="#" className="show-all-link">Show all</a>
              </div>
              <div className="card-grid">
                {featuredPlaylists.slice(0, 6).map((playlist, i) => (
                  <AlbumCard 
                    key={`featured-${i}`}
                    {...formatPlaylistForCard(playlist)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Loading your music...</h2>
              </div>
              <div className="card-grid">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="loading-card">
                    <div style={{height: '180px', background: 'var(--bg-tinted)', borderRadius: '8px'}}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && 
           recentlyPlayed.length === 0 && 
           topTracks.length === 0 && 
           newReleases.length === 0 && 
           savedAlbums.length === 0 && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Start exploring music!</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                Play some music on Spotify to see your personalized recommendations here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Player */}
      <div className="spotify-player">
        <Player />
      </div>
    </div>
  );
}
