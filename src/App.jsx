// src/App.jsx - UPDATED VERSION
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import TestSpotifySDK from './TestSpotifySDK'
import ProtectedRoute from './router/ProtectedRoute'
import './App.css'
import Player from "./components/Player"

export default function App() {
  const { spotifyToken } = useAuth()  // ✅ fix: get spotifyToken from context

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Persistent Player - Fixed to render at bottom */}
      {spotifyToken && <Player />}
    </div>
  )
}

// Home page component - COMPLETELY UPDATED
function HomePage() {
  const { session, spotifyToken } = useAuth()

  const scrollToPlayer = (e) => {
    e.preventDefault() // Prevent navigation
    
    console.log('🎯 Attempting to scroll to player...')
    
    // First check if we have a token
    if (!spotifyToken) {
      console.warn('⚠️ No Spotify token available')
      alert('Please login to Spotify first')
      return
    }

    // Look for the player element
    const playerEl = document.querySelector("#app-player")
    if (playerEl) {
      console.log('✅ Found player element, scrolling...')
      playerEl.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      })
    } else {
      console.warn('⚠️ Player element not found, player may not be ready yet')
      
      // Try to wait for player to render
      setTimeout(() => {
        const retryPlayerEl = document.querySelector("#app-player")
        if (retryPlayerEl) {
          console.log('✅ Found player on retry, scrolling...')
          retryPlayerEl.scrollIntoView({ 
            behavior: "smooth",
            block: "start"
          })
        } else {
          console.error('❌ Player still not found after retry')
          alert('Player is not ready yet. Please wait a moment and try again.')
        }
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Spotify Clone!</h2>
        <p className="text-gray-600 mb-6">
          {session?.user ? `Hello, ${session.user.email}!` : 'You are logged in'}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Music Player Card - UPDATED */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center mb-4">
            {/* Fixed Spotify Icon Size */}
            <div className="w-12 h-12 mr-4 flex-shrink-0">
              <svg 
                viewBox="0 0 24 24" 
                className="w-full h-full text-green-500"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.32 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Music Player</h3>
              <p className="text-gray-600 text-sm">Test the Spotify Web Player integration</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Token Status:</span>
              <span className={`text-sm font-medium ${spotifyToken ? 'text-green-600' : 'text-red-600'}`}>
                {spotifyToken ? '✅ Available' : '❌ Missing'}
              </span>
            </div>
            
            {/* Updated Button - No longer uses href */}
            <button
              onClick={scrollToPlayer}
              disabled={!spotifyToken}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                spotifyToken
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {spotifyToken ? 'Open Player' : 'Login Required'}
            </button>
            
            {/* Link to dedicated player page */}
            <a 
              href="/player" 
              className="inline-block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Go to Player Page
            </a>
          </div>
        </div>
        
        {/* Account Card - UPDATED */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-white font-bold text-lg">👤</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Account</h3>
              <p className="text-gray-600 text-sm">Manage your account and preferences</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {session?.user && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Logged in as:</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Debug Section - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>Spotify Token: {spotifyToken ? '✅ Present' : '❌ Missing'}</li>
            <li>User Session: {session?.user ? '✅ Active' : '❌ None'}</li>
            <li>Player Element: <span id="player-debug">Checking...</span></li>
          </ul>
        </div>
      )}
    </div>
  )
}

// Auth status component - UPDATED
function AuthStatus() {
  const { session } = useAuth()

  if (!session?.user) return null

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">{session.user.email}</span>
      <LogoutButton />
    </div>
  )
}

// Logout button component - ENHANCED
function LogoutButton() {
  const { supabase } = useAuth()
  
  const handleLogout = async () => {
    try {
      console.log('🔓 Logging out...')
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear all Spotify-related tokens
      localStorage.removeItem("spotify_token")
      localStorage.removeItem("spotify_refresh_token")
      
      console.log('✅ Logout successful')
      
      // Optional: Redirect to login page
      // window.location.href = '/login'
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      alert('Error logging out. Please try again.')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  )
}