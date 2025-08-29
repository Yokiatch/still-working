import { supabase } from "./supabase";

export async function getSpotifyToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  const session = data.session;
  if (!session) return null;

  // Supabase stores the provider’s access token here
  return session.provider_token || null;
}
