/**
 * useSync Hook
 *
 * Provides React components with sync status and operations.
 * Tracks online/offline state, pending changes, and sync progress.
 *
 * @example
 * ```tsx
 * function SyncIndicator() {
 *   const { syncState, pendingCount, syncNow, isOnline } = useSync();
 *
 *   if (syncState === 'offline') {
 *     return <OfflineIndicator pendingCount={pendingCount} />;
 *   }
 *
 *   return <CloudIcon syncing={syncState === 'syncing'} />;
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import {
  type SyncState,
  onSyncStateChange,
  onDataChange,
  initializeNetworkListeners,
  fullSync,
  pushChanges,
  getLastSyncTime,
  getPendingChangesCount,
  getIsOnline,
  subscribeToHousehold,
  unsubscribeFromHousehold,
  cleanupSync,
} from '@/services';
import { useHousehold } from './useHousehold';
import { useAuthContext } from '@/components/auth';

/**
 * Return type for the useSync hook.
 */
export interface UseSyncReturn {
  /** Current sync state */
  syncState: SyncState;

  /** Number of pending (unsynced) changes */
  pendingCount: number;

  /** Whether we're currently online */
  isOnline: boolean;

  /** Last successful sync time (ISO string) */
  lastSyncTime: string | null;

  /** True while performing initial sync */
  isInitialSyncing: boolean;

  /** Trigger a manual sync (push pending changes) */
  syncNow: () => Promise<void>;

  /** Trigger a full re-sync from server */
  fullSyncNow: () => Promise<void>;
}

/**
 * Hook for managing sync state.
 *
 * Automatically:
 * - Initializes network listeners on mount
 * - Performs full sync when household changes
 * - Subscribes to real-time updates
 * - Tracks pending changes
 */
export function useSync(): UseSyncReturn {
  const { currentHousehold } = useHousehold();
  const { isAuthenticated } = useAuthContext();

  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(getIsOnline());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isInitialSyncing, setIsInitialSyncing] = useState(false);

  // Initialize network listeners
  useEffect(() => {
    const cleanup = initializeNetworkListeners();
    return cleanup;
  }, []);

  // Subscribe to sync state changes
  useEffect(() => {
    const cleanup = onSyncStateChange((state, pending) => {
      setSyncState(state);
      setPendingCount(pending);
      setIsOnline(state !== 'offline');
    });

    return cleanup;
  }, []);

  // Handle household changes - full sync and subscribe
  useEffect(() => {
    if (!isAuthenticated || !currentHousehold) {
      cleanupSync();
      setSyncState('idle');
      setPendingCount(0);
      setLastSyncTime(null);
      return;
    }

    const householdId = currentHousehold.id;

    // Perform initial sync
    const performSync = async () => {
      setIsInitialSyncing(true);
      const result = await fullSync(householdId);

      if (result.success) {
        const time = await getLastSyncTime(householdId);
        setLastSyncTime(time);
      }

      setIsInitialSyncing(false);

      // Subscribe to real-time changes after sync
      subscribeToHousehold(householdId);
    };

    performSync();

    // Cleanup on household change
    return () => {
      unsubscribeFromHousehold();
    };
  }, [isAuthenticated, currentHousehold]);

  // Update pending count periodically (backup for real-time)
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await getPendingChangesCount();
      setPendingCount(count);
    };

    const interval = setInterval(updatePendingCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * Manually trigger a sync (push pending changes).
   */
  const syncNow = useCallback(async (): Promise<void> => {
    await pushChanges();
  }, []);

  /**
   * Trigger a full re-sync from server.
   */
  const fullSyncNow = useCallback(async (): Promise<void> => {
    if (!currentHousehold) return;

    setIsInitialSyncing(true);
    const result = await fullSync(currentHousehold.id);

    if (result.success) {
      const time = await getLastSyncTime(currentHousehold.id);
      setLastSyncTime(time);
    }

    setIsInitialSyncing(false);
  }, [currentHousehold]);

  return {
    syncState,
    pendingCount,
    isOnline,
    lastSyncTime,
    isInitialSyncing,
    syncNow,
    fullSyncNow,
  };
}

/**
 * Hook for listening to data changes.
 * Calls the callback whenever data is updated (locally or from server).
 *
 * @param callback - Function to call when data changes
 */
export function useDataChange(callback: () => void): void {
  useEffect(() => {
    const cleanup = onDataChange(callback);
    return cleanup;
  }, [callback]);
}
