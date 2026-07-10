import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USER_DISCIPLINES } from '../models/disciplines';
import { needsProfileSetup, saveProfile, signOut } from '../services/auth';
import { supabase } from '../lib/supabase';
import DisciplineCard from '../components/DisciplineCard';
import SummitLogo from '../components/SummitLogo';
import { useToast } from '../components/useToast';
import './ProfileSetupPage.css';

const BIO_WORD_LIMIT = 30;

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export default function ProfileSetupPage() {
  const { session, profile, loadingProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(
    null,
  );
  const [bioError, setBioError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Prefill from an existing profile, else from Google full_name metadata.
  useEffect(() => {
    if (prefilled || loadingProfile) return;

    if (profile) {
      const existingName = (profile.name as string | undefined)?.trim();
      if (existingName) setName(existingName);
      const existingPhone = (profile.phone as string | undefined)?.trim();
      if (existingPhone) setPhone(existingPhone);
      const existingBio = (profile.bio as string | undefined)?.trim();
      if (existingBio) setBio(existingBio);
      const disciplineName = profile.discipline as string | undefined;
      if (disciplineName) setSelectedDiscipline(disciplineName);
      setPrefilled(true);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        const metadataName = data.user?.user_metadata?.full_name as
          | string
          | undefined;
        if (metadataName && metadataName.trim().length > 0) {
          setName(metadataName.trim());
        }
        setPrefilled(true);
      });
    }
  }, [profile, loadingProfile, prefilled]);

  const bioWords = useMemo(() => wordCount(bio), [bio]);
  const canSave = name.trim().length > 0 && !isSaving;

  if (!loadingProfile && session == null) {
    return <Navigate to="/" replace />;
  }

  if (!loadingProfile && session != null && !needsProfileSetup(profile)) {
    return <Navigate to="/home" replace />;
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

  const handleSave = async () => {
    if (bioWords > BIO_WORD_LIMIT) {
      setBioError(`Keep your bio under ${BIO_WORD_LIMIT} words`);
      return;
    }
    setBioError(null);
    if (name.trim().length === 0) return;

    setIsSaving(true);
    try {
      await saveProfile({
        name: name.trim(),
        phone: phone.trim(),
        discipline: selectedDiscipline,
        bio: bio.trim(),
      });
      await refreshProfile();
      navigate('/home');
    } catch (error) {
      showToast(`Could not save profile: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile">
      {toast}
      <header className="profile__topbar">
        <div className="profile__brand">
          <div className="profile__brand-icon" aria-hidden>
            <SummitLogo background="none" iconColor="var(--white)" />
          </div>
          <div className="profile__brand-text">
            <span className="profile__brand-title">Emerald Summit</span>
            <span className="profile__brand-sub">
              {session?.user.email ?? ''}
            </span>
          </div>
          <button
            className="btn-text"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      <div className="profile__inner">
        <h2 className="profile__heading">Tell us a bit about yourself</h2>
        <p className="profile__subheading">
          Only your full name is required — the rest helps others find and
          connect with you.
        </p>

        <label className="field-label" htmlFor="name">
          Full name
        </label>
        <div className="input-with-icon">
          <span className="input-with-icon__icon" aria-hidden>
            <User />
          </span>
          <input
            id="name"
            className="text-input"
            type="text"
            autoComplete="name"
            placeholder="Jordan Lee"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <label className="field-label profile__spaced" htmlFor="phone">
          Phone (optional)
        </label>
        <div className="input-with-icon">
          <span className="input-with-icon__icon" aria-hidden>
            <Phone />
          </span>
          <input
            id="phone"
            className="text-input"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <label className="field-label profile__spaced">
          Discipline (optional)
        </label>
        <p className="profile__hint">Pick the discipline that best fits you.</p>
        <div className="profile__disciplines">
          {USER_DISCIPLINES.map((d) => (
            <DisciplineCard
              key={d.name}
              discipline={d}
              isSelected={selectedDiscipline === d.name}
              onClick={() =>
                setSelectedDiscipline((current) =>
                  current === d.name ? null : d.name,
                )
              }
            />
          ))}
        </div>

        <label className="field-label profile__spaced" htmlFor="bio">
          Short bio (optional)
        </label>
        <textarea
          id="bio"
          className="text-input"
          rows={3}
          placeholder="A sentence or two about yourself."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <div
          className={`profile__counter${
            bioWords > BIO_WORD_LIMIT ? ' profile__counter--over' : ''
          }`}
        >
          {bioWords}/{BIO_WORD_LIMIT} words
        </div>
        {bioError && <div className="profile__error">{bioError}</div>}

        <button
          className="btn-filled profile__submit"
          onClick={handleSave}
          disabled={!canSave}
        >
          {isSaving ? <span className="spinner" /> : 'Continue'}
        </button>
      </div>
    </div>
  );
}
