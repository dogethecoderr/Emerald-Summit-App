import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../models/roles';
import { needsProfileSetup, signOut } from '../services/auth';
import RoleCard from '../components/RoleCard';
import SummitLogo from '../components/SummitLogo';
import { useToast } from '../components/useToast';
import './HomePage.css';

export default function HomePage() {
  const { session, profile, loadingProfile } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isSignedIn = session != null;

  if (isSignedIn && loadingProfile) {
    return (
      <div className="home__loading">
        <div className="spinner spinner-emerald" />
      </div>
    );
  }

  if (isSignedIn && needsProfileSetup(profile)) {
    return <Navigate to="/profile" replace />;
  }

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      setIsSigningOut(false);
      showToast(`Sign out failed: ${error}`);
    }
  };

  const name = (profile?.name as string | undefined) ?? 'User';
  const role = (profile?.role as string | undefined) ?? 'participant';
  const email = (profile?.email as string | undefined) ?? '';

  return (
    <div className="home">
      {toast}
      <div className="home__inner">
        <header className="home__header">
          <div className="home__brand">
            <div className="home__brand-icon" aria-hidden>
              <SummitLogo background="none" iconColor="var(--white)" />
            </div>
            <div className="home__brand-text">
              <span className="home__brand-title">Emerald Summit</span>
              <span className="home__brand-sub">EHS Academic Foundation</span>
            </div>
            {isSignedIn && (
              <button
                className="btn-text"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing out…' : 'Sign out'}
              </button>
            )}
          </div>

          {isSignedIn ? (
            <div className="home__hero">
              <span className="home__hero-title">You're in</span>
              <span className="home__hero-sub">
                Your account is ready. More features coming soon.
              </span>
            </div>
          ) : (
            <div className="home__intro">
              <h2 className="home__intro-title">Sign in as</h2>
              <p className="home__intro-sub">
                Your role determines what you can see and do in the app.
              </p>
            </div>
          )}
        </header>

        {isSignedIn && profile && (
          <div className="home__signed-in">
            <div className="home__signed-in-row">
              <span className="home__check" aria-hidden>
                <CheckCircle2 color="var(--emerald)" />
              </span>
              <span className="home__signed-in-label">Signed in</span>
            </div>
            <div className="home__signed-in-name">{name}</div>
            <div className="home__signed-in-meta">
              {role} · {email}
            </div>
          </div>
        )}

        {!isSignedIn && (
          <div className="home__roles">
            {USER_ROLES.map((r) => (
              <RoleCard
                key={r.name}
                role={r}
                onClick={() => navigate(`/login/${r.name}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
