import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Mail } from 'lucide-react';
import { roleByName } from '../models/roles';
import { sendMagicLink, signInWithGoogle } from '../services/auth';
import { useToast } from '../components/useToast';
import GoogleIcon from '../components/GoogleIcon';
import './LoginPage.css';

export default function LoginPage() {
  const { role: roleName } = useParams();
  const navigate = useNavigate();
  const role = roleByName(roleName);
  const { toast, showToast } = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  if (!role) {
    return (
      <div className="login">
        <div className="login__inner">
          <p>Unknown role.</p>
          <button className="btn-outlined" onClick={() => navigate('/home')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const validateEmail = (): boolean => {
    const value = email.trim();
    if (value.length === 0) {
      setEmailError('Enter your email address');
      return false;
    }
    if (!value.includes('@')) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(role.name);
    } catch (error) {
      showToast(`Google sign-in failed: ${error}`);
      setIsLoading(false);
    }
    // On success the browser redirects to Google, so no reset needed.
  };

  const handleMagicLink = async () => {
    if (!validateEmail()) return;
    setIsLoading(true);
    try {
      await sendMagicLink(email.trim(), role.name);
      setLinkSent(true);
      showToast('Check your email for the sign-in link.');
    } catch (error) {
      showToast(`${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      {toast}
      <header className="login__topbar">
        <button
          className="btn-text login__back"
          onClick={() => navigate('/home')}
          aria-label="Back"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <span className="login__topbar-title">Sign in as {role.label}</span>
        <span className="login__topbar-spacer" />
      </header>

      <div className="login__inner">
        <div className="login__role-banner">
          <div className="login__role-icon" aria-hidden>
            <role.icon color="var(--emerald)" strokeWidth={1.75} />
          </div>
          <div className="login__role-text">
            <div className="login__role-label">{role.label}</div>
            <div className="login__role-desc">{role.description}</div>
          </div>
        </div>

        <button
          className="btn-outlined login__google"
          onClick={handleGoogle}
          disabled={isLoading}
        >
          <GoogleIcon size={20} /> Continue with Google
        </button>

        <div className="login__divider">
          <span className="login__divider-line" />
          <span className="login__divider-text">or</span>
          <span className="login__divider-line" />
        </div>

        <label className="field-label" htmlFor="email">
          Email address
        </label>
        <div className="input-with-icon">
          <span className="input-with-icon__icon" aria-hidden>
            <Mail />
          </span>
          <input
            id="email"
            className="text-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleMagicLink();
            }}
          />
        </div>
        {emailError && <div className="login__error">{emailError}</div>}

        <button
          className="btn-filled login__submit"
          onClick={handleMagicLink}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner" />
          ) : linkSent ? (
            'Resend magic link'
          ) : (
            'Send magic link'
          )}
        </button>

        <p className="login__hint">
          {linkSent
            ? `We sent a one-time link to ${email.trim()}. Open it in this browser to finish signing in.`
            : `We'll send a one-time sign-in link to your email. Your ${role.label.toLowerCase()} role will be saved to your profile.`}
        </p>
      </div>
    </div>
  );
}
