import { supabase } from "../lib/supabase"

export default function Login() {
  const loginWithSpotify = async () => {
    const { data,error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes: "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state",
        redirectTo: "http://127.0.0.1:5173/auth/callback" // 👈 React route after Supabase finishes
      }
    })
    if (error) console.error("Login error:", error.message)
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={loginWithSpotify}
        className="px-6 py-3 bg-green-500 text-white rounded-xl"
      >
        Login with Spotify
      </button>
    </div>
  )
}
