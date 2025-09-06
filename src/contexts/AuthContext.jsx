// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    loading,
    signInWithSpotify: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state user-read-currently-playing playlist-read-private user-top-read user-read-recently-played user-library-read',
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) console.error('Login error:', error);
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Logout error:', error);
    }
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
