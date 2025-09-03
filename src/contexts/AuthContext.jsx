import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);

        // Safer token extraction from possible locations
        const token =
          data.session.provider_token ||
          data.session.user?.identities?.[0]?.identity_data?.access_token ||
          null;

        setSpotifyToken(token);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);

      const token =
        s?.provider_token || s?.user?.identities?.[0]?.identity_data?.access_token || null;

      setSpotifyToken(token);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthCtx.Provider value={{ session, spotifyToken }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
