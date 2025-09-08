import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SetupPlayer from './pages/SetupPlayer'
import LoadingSkeleton from './components/LoadingSkeleton'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSkeleton />
  
  return user ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSkeleton />

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/auth/callback" 
        element={user ? <Navigate to="/dashboard" /> : <LoadingSkeleton />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/setup-player" 
        element={
          <ProtectedRoute>
            <SetupPlayer />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
