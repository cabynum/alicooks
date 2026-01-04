/**
 * Authentication Types
 *
 * Type definitions for user authentication and profiles.
 * These map to the Supabase auth.users and public.profiles tables.
 */

import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Re-export Supabase User type for convenience.
 * This represents the auth.users record.
 */
export type User = SupabaseUser;

/**
 * A user's public profile information.
 * Created automatically when they sign up via the database trigger.
 *
 * Maps to the public.profiles table.
 */
export interface Profile {
  /** UUID matching auth.users.id */
  id: string;
  /** User-chosen display name, shown to household members */
  displayName: string;
  /** Email address from auth, used for magic links */
  email: string;
  /** When the profile was created */
  createdAt: string;
  /** When the profile was last updated */
  updatedAt: string;
}

/**
 * Fields that can be updated on a profile.
 */
export interface UpdateProfileInput {
  displayName?: string;
}

/**
 * Authentication state for the app.
 */
export interface AuthState {
  /** The authenticated user (from Supabase auth) */
  user: User | null;
  /** The user's profile (from public.profiles table) */
  profile: Profile | null;
  /** True while checking initial auth state */
  isLoading: boolean;
  /** True if user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Result of sending a magic link.
 */
export interface MagicLinkResult {
  success: boolean;
  error?: string;
}

/**
 * Result of a sign out operation.
 */
export interface SignOutResult {
  success: boolean;
  error?: string;
}
