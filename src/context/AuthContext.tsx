import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentProfile,
  getSession,
  subscribeAuth,
  type MockSession,
  type Profile,
} from '../services/auth';

interface AuthContextValue {
  session: MockSession | null;
  profile: Profile | null;
  loadingProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(() => getSession());
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
    // Re-sync whenever the mock store changes (sign in/out, profile save).
    const sync = () => {
      const current = getSession();
      setSession(current);
      if (current) {
        refreshProfile();
      } else {
        setProfile(null);
        setLoadingProfile(false);
      }
    };

    sync();
    return subscribeAuth(sync);
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
