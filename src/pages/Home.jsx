import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()
  return (
    <div className="h-screen flex">
      <aside className="w-60 bg-black/60 p-4">Sidebar</aside>
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Home</h2>
          <button onClick={logout} className="px-3 py-2 bg-neutral-800 rounded">Sign out</button>
        </div>
        <div className="text-neutral-400 text-sm">Logged in as {user?.email || user?.user_metadata?.name}</div>
      </main>
    </div>
  )
}
