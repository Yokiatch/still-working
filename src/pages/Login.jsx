// src/pages/Login.jsx
import { supabase } from '../lib/supabase';

export default function Login() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes:
          'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state user-read-currently-playing playlist-read-private user-top-read user-read-recently-played',
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <button
        onClick={login}
        className="bg-green-500 text-white px-6 py-3 rounded-lg">
        Continue with Spotify
      </button>
    </div>
  );
}
