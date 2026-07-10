import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

const placeholderKey = 'your-anon-key-here';

/** Mirrors AppEnv.isConfigured from the Flutter app. */
export const isConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey !== placeholderKey &&
  supabaseUrl.includes('supabase.co');

// detectSessionInUrl handles OAuth/magic-link redirects automatically,
// replacing the manual auth_callback_handler logic from the Flutter app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const setupMessage = `Supabase is not configured yet.

1. Copy .env.example to .env
2. In Supabase: Project Settings (gear) -> API
3. Paste Project URL and anon public key into .env
   as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
4. Restart the dev server: npm run dev`;
