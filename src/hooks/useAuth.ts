/**
 * useAuth Hook
 *
 * Provides React components with access to authentication state and methods.
 * Handles session initialization, auth state changes, and profile management.
 *
 * @example
 * ```tsx
 * function UserGreeting() {
 *   const { user, profile, isLoading, signIn, signOut } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   if (!user) {
 *     return <button onClick={() => signIn('user@example.com')}>Sign In</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Hello, {profile?.displayName}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type { User, Profile, UpdateProfileInput } from '@/types';
import {
  getCurrentUser,
  getProfile,
  signInWithMagicLink,
  signOut as authSignOut,
  updateProfile as authUpdateProfile,
  onAuthStateChange,
  devAutoLogin,
} from '@/services';
import { getUserFriendlyError } from '@/utils';

/**
 * Return type for the useAuth hook.
 */
export interface UseAuthReturn {
  /** The authenticated user from Supabase Auth */
  user: User | null;

  /** The user's profile from the database */
  profile: Profile | null;

  /** True while checking initial auth state */
  isLoading: boolean;

  /** True if user is authenticated */
  isAuthenticated: boolean;

  /** Send a magic link to the given email */
  signIn: (email: string) => Promise<void>;

  /** Sign out the current user */
  signOut: () => Promise<void>;

  /** Update the current user's profile */
  updateProfile: (updates: UpdateProfileInput) => Promise<void>;

  /** Error message from the last operation, if any */
  error: string | null;

  /** Clear the current error */
  clearError: () => void;
}

/**
 * Hook for managing authentication state.
 *
 * Initializes auth state from Supabase on mount and subscribes to
 * auth state changes (login, logout, token refresh).
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state and subscribe to changes
  useEffect(() => {
    let isMounted = true;

    // Fetch initial user and profile
    async function initAuth() {
      try {
        let currentUser = await getCurrentUser();

        // In development, auto-login with test user if not authenticated
        if (!currentUser && import.meta.env.DEV) {
          currentUser = await devAutoLogin();
        }

        if (!isMounted) return;

        setUser(currentUser);

        if (currentUser) {
          const userProfile = await getProfile(currentUser.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        // Auth initialization errors are non-fatal
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (newUser) => {
      if (!isMounted) return;

      setUser(newUser);

      if (newUser) {
        // Fetch profile when user signs in
        const userProfile = await getProfile(newUser.id);
        if (isMounted) {
          setProfile(userProfile);
        }
      } else {
        // Clear profile when user signs out
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Send a magic link to the given email.
   */
  const signIn = useCallback(async (email: string): Promise<void> => {
    setError(null);
    try {
      await signInWithMagicLink(email);
    } catch (err) {
      setError(getUserFriendlyError(err));
      throw err;
    }
  }, []);

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await authSignOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(getUserFriendlyError(err));
      throw err;
    }
  }, []);

  /**
   * Update the current user's profile.
   */
  const updateProfile = useCallback(
    async (updates: UpdateProfileInput): Promise<void> => {
      if (!user) {
        setError('You must be signed in to update your profile.');
        throw new Error('Not authenticated');
      }

      setError(null);
      try {
        const updatedProfile = await authUpdateProfile(user.id, updates);
        setProfile(updatedProfile);
      } catch (err) {
        setError(getUserFriendlyError(err));
        throw err;
      }
    },
    [user]
  );

  /**
   * Clear the current error.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    updateProfile,
    error,
    clearError,
  };
}
