// Mock auth — a localStorage-backed stand-in for Supabase so the whole
// frontend runs and is fully testable in the browser with no backend.
// The public surface mirrors what the pages need; swap the internals for
// real Supabase auth later without touching the UI.

import type { Person, Visibility } from '../models/people';
import type { PersonStatus } from '../models/personStatus';

export type Profile = Record<string, unknown>;

export interface ProfileSettings {
  org: string;
  directoryVisible: boolean;
  emailVisible: Visibility;
  phoneVisible: Visibility;
  bioVisible: Visibility;
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  org: 'Emerald High School',
  directoryVisible: true,
  emailVisible: 'private',
  phoneVisible: 'private',
  bioVisible: 'private',
};

export interface MockUser {
  id: string;
  email: string;
  /** Prefill hint for the profile page (e.g. from a Google account). */
  fullName?: string;
}

export interface MockSession {
  user: MockUser;
}

const SESSION_KEY = 'mock_session';
const PROFILE_KEY = 'mock_profiles'; // { [email]: Profile }
const PENDING_ROLE_KEY = 'pending_user_role';

// Tiny artificial latency so loading states/spinners are exercised.
const FAKE_LATENCY_MS = 500;
const wait = (ms = FAKE_LATENCY_MS) => new Promise((r) => setTimeout(r, ms));

// ---- Change notification (AuthContext subscribes to this) ----
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  listeners.forEach((l) => l());
}

// ---- Low-level storage helpers ----
function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function readProfiles(): Record<string, Profile> {
  return readJSON<Record<string, Profile>>(PROFILE_KEY) ?? {};
}

function randomId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10);
}

// ---- Pending role (chosen on the role screen, applied at profile save) ----
export function savePendingRole(roleName: string): void {
  localStorage.setItem(PENDING_ROLE_KEY, roleName);
}

export function takePendingRole(): string | null {
  const value = localStorage.getItem(PENDING_ROLE_KEY);
  if (value == null) return null;
  localStorage.removeItem(PENDING_ROLE_KEY);
  return value;
}

// ---- Session ----
export function getSession(): MockSession | null {
  return readJSON<MockSession>(SESSION_KEY);
}

function setSession(user: MockUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
  emit();
}

/** Instant "email sign-in" — no magic link round-trip in the mock. */
export async function signInWithEmail(
  email: string,
  roleName: string,
): Promise<void> {
  await wait();
  savePendingRole(roleName);
  const clean = email.trim().toLowerCase();
  const existing = readProfiles()[clean];
  setSession({
    id: (existing?.id as string) ?? randomId(),
    email: clean,
  });
}

/** Instant "Google" sign-in with a friendly demo account. */
export async function signInWithGoogle(roleName: string): Promise<void> {
  await wait();
  savePendingRole(roleName);
  const email = 'demo.student@gmail.com';
  const existing = readProfiles()[email];
  setSession({
    id: (existing?.id as string) ?? randomId(),
    email,
    fullName: (existing?.name as string) ?? 'Demo Student',
  });
}

/** Instant "LinkedIn" sign-in with a friendly demo account. */
export async function signInWithLinkedIn(roleName: string): Promise<void> {
  await wait();
  savePendingRole(roleName);
  const email = 'demo.student@linkedin.com';
  const existing = readProfiles()[email];
  setSession({
    id: (existing?.id as string) ?? randomId(),
    email,
    fullName: (existing?.name as string) ?? 'Demo Student',
  });
}

export interface SaveProfileInput {
  name: string;
  phone?: string;
  discipline?: string | null;
  bio?: string;
  org?: string;
  directoryVisible?: boolean;
  emailVisible?: Visibility;
  phoneVisible?: Visibility;
  bioVisible?: Visibility;
}

function settingsFromProfile(profile: Profile | null | undefined): ProfileSettings {
  return {
    org:
      (profile?.org as string | undefined)?.trim() ||
      DEFAULT_PROFILE_SETTINGS.org,
    directoryVisible:
      profile?.directory_visible !== false,
    emailVisible:
      (profile?.email_visible as Visibility | undefined) ??
      DEFAULT_PROFILE_SETTINGS.emailVisible,
    phoneVisible:
      (profile?.phone_visible as Visibility | undefined) ??
      DEFAULT_PROFILE_SETTINGS.phoneVisible,
    bioVisible:
      (profile?.bio_visible as Visibility | undefined) ??
      DEFAULT_PROFILE_SETTINGS.bioVisible,
  };
}

export function getProfileSettings(
  profile: Profile | null | undefined,
): ProfileSettings {
  return settingsFromProfile(profile);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Convert a saved profile into a directory Person card model. */
export function profileToPerson(profile: Profile): Person {
  const settings = getProfileSettings(profile);
  const roleName = (profile.role as string | undefined) ?? 'participant';
  const name = (profile.name as string | undefined) ?? 'Summit User';
  const email = (profile.email as string | undefined) ?? '';
  const phone = (profile.phone as string | undefined) ?? '';
  const bio = (profile.bio as string | undefined) ?? '';

  return {
    id: (profile.id as string | undefined) ?? email,
    name,
    role: roleName,
    org: settings.org,
    email,
    phone,
    initials: getInitials(name),
    bio,
    emailVisible: settings.emailVisible,
    phoneVisible: settings.phoneVisible,
    bioVisible: settings.bioVisible,
    status: 'validated' as PersonStatus,
  };
}

export async function saveProfile(input: SaveProfileInput): Promise<void> {
  await wait();
  const session = getSession();
  if (session == null) throw new Error('Not signed in.');

  const email = session.user.email;
  const profiles = readProfiles();
  const existing = profiles[email];

  let role = existing?.role as string | undefined;
  if (role == null) {
    const pending = takePendingRole();
    if (pending == null) {
      throw new Error('No role selected. Go back, pick a role, and sign in.');
    }
    role = pending;
  }

  const next: Profile = {
    ...(existing ?? {}),
    id: session.user.id,
    email,
    role,
    name: input.name,
    profile_setup_complete: true,
  };
  if (input.phone && input.phone.length > 0) next.phone = input.phone;
  if (input.discipline) next.discipline = input.discipline;
  else delete next.discipline;
  if (input.bio && input.bio.length > 0) next.bio = input.bio;
  else delete next.bio;

  const settings = settingsFromProfile(existing);
  next.org = input.org?.trim() || settings.org;
  next.directory_visible = input.directoryVisible ?? settings.directoryVisible;
  next.email_visible = input.emailVisible ?? settings.emailVisible;
  next.phone_visible = input.phoneVisible ?? settings.phoneVisible;
  next.bio_visible = input.bioVisible ?? settings.bioVisible;

  profiles[email] = next;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  emit();
}

export function needsProfileSetup(profile: Profile | null): boolean {
  if (profile == null) return true;
  return profile.profile_setup_complete !== true;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const session = getSession();
  if (session == null) return null;
  const profiles = readProfiles();
  const profile = profiles[session.user.email] ?? null;

  // Preserve existing demo accounts after the Parent role was renamed.
  if (profile?.role === 'parent') {
    const migrated = { ...profile, role: 'mentor' };
    profiles[session.user.email] = migrated;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
    return migrated;
  }

  return profile;
}

export async function updateProfileSettings(
  input: Partial<SaveProfileInput>,
): Promise<void> {
  await wait();
  const session = getSession();
  if (session == null) throw new Error('Not signed in.');

  const email = session.user.email;
  const profiles = readProfiles();
  const existing = profiles[email];
  if (existing == null) throw new Error('Profile not found.');

  const name = (input.name ?? (existing.name as string | undefined))?.trim();
  if (!name) throw new Error('Profile name is required.');

  await saveProfile({
    name,
    phone: (input.phone ?? existing.phone) as string | undefined,
    discipline: (input.discipline ?? existing.discipline) as string | null,
    bio: (input.bio ?? existing.bio) as string | undefined,
    org: input.org,
    directoryVisible: input.directoryVisible,
    emailVisible: input.emailVisible,
    phoneVisible: input.phoneVisible,
    bioVisible: input.bioVisible,
  });
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
  emit();
}
