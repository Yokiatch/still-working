// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import TestSpotifySDK from './TestSpotifySDK';
import ProtectedRoute from './router/ProtectedRoute';
import './App.css';
import Player from "./components/Player";


export default function App() {
  return (
    <div className="min-h-screen bg-gray-25">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Spotify Music Clone</h1>
          
          <AuthStatus />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/player" 
            element={
              <ProtectedRoute>
                <TestSpotifySDK />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
       {/* Persistent Player */}
      {spotifyToken && <Player token={spotifyToken} />}
    </div>
  );
}

// Home page component
function HomePage() {
  const { session, spotifyToken } = useAuth();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Spotify Clone!</h2>
        <p className="text-gray-600 mb-6">
          {session?.user ? `Hello, ${session.user.email}!` : 'You are logged in'}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Music Player</h3>
          <p className="text-gray-600 mb-4">Test the Spotify Web Player integration</p>
          <div className="space-y-2">
            <p className="text-sm">
              Token Status: {spotifyToken ? 
                <span className="text-green-600">✅ Available</span> : 
                <span className="text-red-600">❌ Missing</span>
              }
            </p>
            <a 
              href="/player" 
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Open Player
            </a>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Account</h3>
          <p className="text-gray-600 mb-4">Manage your account and preferences</p>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

// Auth status component
function AuthStatus() {
  const { session } = useAuth();

  if (!session?.user) return null;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">{session.user.email}</span>
      <LogoutButton />
    </div>
  );
}

// Logout button component
function LogoutButton() {
  const { supabase } = useAuth();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_refresh_token");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}
