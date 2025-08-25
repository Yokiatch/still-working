import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-neutral-300">Loading…</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
