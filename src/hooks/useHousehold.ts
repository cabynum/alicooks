/**
 * useHousehold Hook
 *
 * Provides React components with access to household state and operations.
 * Manages the current household selection, membership, and CRUD operations.
 *
 * @example
 * ```tsx
 * function HouseholdView() {
 *   const {
 *     currentHousehold,
 *     members,
 *     isCreator,
 *     switchHousehold,
 *     leaveHousehold
 *   } = useHousehold();
 *
 *   if (!currentHousehold) {
 *     return <CreateHouseholdPrompt />;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{currentHousehold.name}</h1>
 *       <MemberList members={members} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Household,
  HouseholdMemberWithProfile,
  CreateHouseholdInput,
} from '@/types';
import {
  getHouseholds,
  getMembers,
  createHousehold as createHouseholdService,
  leaveHousehold as leaveHouseholdService,
  removeMember as removeMemberService,
} from '@/services';
import { useAuthContext } from '@/components/auth';

/** Key for persisting current household selection */
const CURRENT_HOUSEHOLD_KEY = 'dishcourse:currentHouseholdId';

/**
 * Return type for the useHousehold hook.
 */
export interface UseHouseholdReturn {
  /** All households the user belongs to */
  households: Household[];

  /** The currently active household */
  currentHousehold: Household | null;

  /** Members of the current household (with profiles) */
  members: HouseholdMemberWithProfile[];

  /** True while loading household data */
  isLoading: boolean;

  /** Whether the current user is the creator of the current household */
  isCreator: boolean;

  /** Switch to a different household */
  switchHousehold: (householdId: string) => void;

  /** Create a new household */
  createHousehold: (input: CreateHouseholdInput) => Promise<Household>;

  /** Leave the current household */
  leaveCurrentHousehold: () => Promise<void>;

  /** Remove a member (creator only) */
  removeMember: (memberId: string) => Promise<void>;

  /** Refresh household data */
  refresh: () => Promise<void>;

  /** Error from the last operation, if any */
  error: string | null;

  /** Clear the current error */
  clearError: () => void;
}

/**
 * Hook for managing household state.
 *
 * Loads households on mount, manages current selection, and provides
 * operations for creating, leaving, and managing households.
 */
export function useHousehold(): UseHouseholdReturn {
  const { user, isAuthenticated } = useAuthContext();

  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if current user is the creator
  const isCreator = Boolean(
    currentHousehold && user && currentHousehold.createdBy === user.id
  );

  /**
   * Load households for the current user.
   */
  const loadHouseholds = useCallback(async () => {
    if (!user) {
      setHouseholds([]);
      setCurrentHousehold(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      const userHouseholds = await getHouseholds(user.id);
      setHouseholds(userHouseholds);

      // Restore persisted selection or default to first household
      const persistedId = localStorage.getItem(CURRENT_HOUSEHOLD_KEY);
      const restoredHousehold = userHouseholds.find((h) => h.id === persistedId);
      const activeHousehold = restoredHousehold ?? userHouseholds[0] ?? null;

      setCurrentHousehold(activeHousehold);

      // Load members for the active household
      if (activeHousehold) {
        const householdMembers = await getMembers(activeHousehold.id);
        setMembers(householdMembers);
        localStorage.setItem(CURRENT_HOUSEHOLD_KEY, activeHousehold.id);
      } else {
        setMembers([]);
        localStorage.removeItem(CURRENT_HOUSEHOLD_KEY);
      }
    } catch (err) {
      console.error('Failed to load households:', err);
      setError('Unable to load households. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load households when user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadHouseholds();
    } else {
      setHouseholds([]);
      setCurrentHousehold(null);
      setMembers([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadHouseholds]);

  /**
   * Switch to a different household.
   */
  const switchHousehold = useCallback(
    async (householdId: string) => {
      const household = households.find((h) => h.id === householdId);
      if (!household) {
        setError('Household not found.');
        return;
      }

      setCurrentHousehold(household);
      localStorage.setItem(CURRENT_HOUSEHOLD_KEY, householdId);

      // Load members for the new household
      try {
        const householdMembers = await getMembers(householdId);
        setMembers(householdMembers);
      } catch (err) {
        console.error('Failed to load members:', err);
        setMembers([]);
      }
    },
    [households]
  );

  /**
   * Create a new household.
   */
  const createHousehold = useCallback(
    async (input: CreateHouseholdInput): Promise<Household> => {
      if (!user) {
        throw new Error('You must be signed in to create a household.');
      }

      setError(null);

      try {
        const household = await createHouseholdService(input.name, user.id);

        // Add to local state
        setHouseholds((prev) => [household, ...prev]);
        setCurrentHousehold(household);
        localStorage.setItem(CURRENT_HOUSEHOLD_KEY, household.id);

        // The creator is the only member initially
        const creatorMember: HouseholdMemberWithProfile = {
          id: crypto.randomUUID(), // Temporary ID until we fetch real data
          householdId: household.id,
          userId: user.id,
          role: 'creator',
          joinedAt: new Date().toISOString(),
          profile: {
            id: user.id,
            displayName: user.user_metadata?.display_name || user.email || 'You',
            email: user.email || '',
          },
        };
        setMembers([creatorMember]);

        return household;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to create household.';
        setError(message);
        throw err;
      }
    },
    [user]
  );

  /**
   * Leave the current household.
   */
  const leaveCurrentHousehold = useCallback(async (): Promise<void> => {
    if (!user || !currentHousehold) {
      throw new Error('No household to leave.');
    }

    setError(null);

    try {
      await leaveHouseholdService(currentHousehold.id, user.id);

      // Remove from local state
      const remainingHouseholds = households.filter(
        (h) => h.id !== currentHousehold.id
      );
      setHouseholds(remainingHouseholds);

      // Switch to another household or clear
      const nextHousehold = remainingHouseholds[0] ?? null;
      setCurrentHousehold(nextHousehold);

      if (nextHousehold) {
        localStorage.setItem(CURRENT_HOUSEHOLD_KEY, nextHousehold.id);
        const householdMembers = await getMembers(nextHousehold.id);
        setMembers(householdMembers);
      } else {
        localStorage.removeItem(CURRENT_HOUSEHOLD_KEY);
        setMembers([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to leave household.';
      setError(message);
      throw err;
    }
  }, [user, currentHousehold, households]);

  /**
   * Remove a member from the current household (creator only).
   */
  const removeMember = useCallback(
    async (memberId: string): Promise<void> => {
      if (!isCreator) {
        throw new Error('Only the household creator can remove members.');
      }

      setError(null);

      try {
        await removeMemberService(memberId);

        // Remove from local state
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to remove member.';
        setError(message);
        throw err;
      }
    },
    [isCreator]
  );

  /**
   * Refresh household data.
   */
  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await loadHouseholds();
  }, [loadHouseholds]);

  /**
   * Clear the current error.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    households,
    currentHousehold,
    members,
    isLoading,
    isCreator,
    switchHousehold,
    createHousehold,
    leaveCurrentHousehold,
    removeMember,
    refresh,
    error,
    clearError,
  };
}
