// Mock auth — a localStorage-backed stand-in for Supabase so the whole
// frontend runs and is fully testable in the browser with no backend.
// The public surface mirrors what the pages need; swap the internals for
// real Supabase auth later without touching the UI.

export type Profile = Record<string, unknown>;

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

export interface SaveProfileInput {
  name: string;
  phone?: string;
  discipline?: string | null;
  bio?: string;
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
  return readProfiles()[session.user.email] ?? null;
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
  emit();
}
