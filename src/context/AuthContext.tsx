import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getCurrentProfile, type Profile } from '../services/auth';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loadingProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const refreshProfile = async () => {
    setLoadingProfile(true);
    try {
      const next = await getCurrentProfile();
      setProfile(next);
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let active = true;

    // Prime from any existing session, then load its profile.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        refreshProfile();
      } else {
        setLoadingProfile(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoadingProfile(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, profile, loadingProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
