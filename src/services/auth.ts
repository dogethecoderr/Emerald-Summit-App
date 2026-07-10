// 1:1 port of flutter/lib/core/services/auth_service.dart
import { supabase } from '../lib/supabase';

const PENDING_ROLE_KEY = 'pending_user_role';

export type Profile = Record<string, unknown>;

export function savePendingRole(roleName: string): void {
  localStorage.setItem(PENDING_ROLE_KEY, roleName);
}

/** Read the pending role and clear it (matches Dart takePendingRole). */
export function takePendingRole(): string | null {
  const value = localStorage.getItem(PENDING_ROLE_KEY);
  if (value == null) return null;
  localStorage.removeItem(PENDING_ROLE_KEY);
  return value;
}

// Land straight on the profile-setup page after auth completes instead of
// bouncing through Welcome/Home first; ProfileSetupPage forwards on to
// /home itself if the profile is already complete.
const redirectUrl = () => `${window.location.origin}/profile`;

export async function sendMagicLink(
  email: string,
  roleName: string,
): Promise<void> {
  savePendingRole(roleName);
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectUrl() },
  });
  if (error) throw error;
}

export async function signInWithGoogle(roleName: string): Promise<void> {
  savePendingRole(roleName);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl(),
      // Force Google to show the account picker instead of silent SSO.
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
}

export interface SaveProfileInput {
  name: string;
  phone?: string;
  discipline?: string | null;
  bio?: string;
}

export async function saveProfile(input: SaveProfileInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user == null) throw new Error('Not signed in.');

  const email = user.email;
  if (email == null || email.length === 0) {
    throw new Error('Signed-in account has no email address.');
  }

  const payload: Record<string, unknown> = {
    name: input.name,
    profile_setup_complete: true,
  };
  if (input.phone && input.phone.length > 0) payload.phone = input.phone;
  if (input.discipline) payload.discipline = input.discipline;
  if (input.bio && input.bio.length > 0) payload.bio = input.bio;

  const existing = await getCurrentProfile();
  if (existing == null) {
    const pendingRole = takePendingRole();
    if (pendingRole == null) {
      throw new Error(
        'No role selected. Go back, pick a role, and sign in again.',
      );
    }
    const { error } = await supabase.from('users').insert({
      id: user.id,
      role: pendingRole,
      email,
      ...payload,
    });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', user.id);
  if (error) throw error;
}

/** True when the user still needs to finish the profile-setup page. */
export function needsProfileSetup(profile: Profile | null): boolean {
  if (profile == null) return true;
  return profile.profile_setup_complete !== true;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user == null) return null;

  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' });
}
