import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { session, spotifyToken, signOut } = useAuth();

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <aside className="w-60 bg-black/70 p-4">
        <nav className="space-y-4">
          {/* Sidebar content can be expanded */}
          <h1 className="text-2xl font-bold mb-6">Spotify Clone</h1>
          {/* Add links here as needed */}
        </nav>
      </aside>

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Home</h2>
          <button
            onClick={signOut}
            className="px-3 py-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
          >
            Sign out
          </button>
        </div>
        <div className="text-neutral-400 text-sm">
          Logged in as {session?.user.email || session?.user.user_metadata?.name || 'Unknown'}
        </div>
        {/* Add more home page content like playlists or recommendations */}
      </main>
    </div>
  );
}
