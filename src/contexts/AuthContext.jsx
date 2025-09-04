// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCtx = createContext();
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { subscription } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  return <AuthCtx.Provider value={{ session }}>{children}</AuthCtx.Provider>;
}
export function useAuth() {
  return useContext(AuthCtx);
}
