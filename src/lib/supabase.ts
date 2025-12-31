/**
 * Supabase Client
 *
 * Initializes and exports the Supabase client for use throughout the app.
 * Uses environment variables for configuration to keep credentials secure.
 *
 * The anon key is safe to use in the browser — it only allows access to
 * data permitted by Row-Level Security (RLS) policies.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'See .env.example for reference.'
  );
}

/**
 * The Supabase client instance.
 *
 * Use this to interact with:
 * - Authentication (supabase.auth)
 * - Database (supabase.from('table'))
 * - Realtime subscriptions (supabase.channel())
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage
    persistSession: true,
    // Automatically refresh tokens before they expire
    autoRefreshToken: true,
    // Detect session from URL (for magic link callback)
    detectSessionInUrl: true,
  },
});
