/**
 * usePlanLock Hook Tests
 *
 * Tests for the plan locking hook functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlanLock } from '@/hooks/usePlanLock';
import * as locksService from '@/services/locks';
import type { LockStatus } from '@/services/locks';

// Mock the auth context
const mockUser = { id: 'user-123', email: 'test@example.com' };

vi.mock('@/components/auth', () => ({
  useAuthContext: () => ({
    user: mockUser,
    isAuthenticated: true,
  }),
}));

// Mock the locks service
vi.mock('@/services/locks', () => ({
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
  forceUnlock: vi.fn(),
  checkLock: vi.fn(),
  refreshLock: vi.fn(),
  LOCK_TIMEOUT_MS: 5 * 60 * 1000,
}));

describe('usePlanLock Hook', () => {
  const mockPlanId = 'plan-456';
  const mockOtherUserId = 'user-789';

  const unlockedStatus: LockStatus = {
    isLocked: false,
    isStale: false,
    isLockedByCurrentUser: false,
  };

  const lockedByCurrentUserStatus: LockStatus = {
    isLocked: true,
    lockedBy: mockUser.id,
    lockedAt: new Date().toISOString(),
    isStale: false,
    isLockedByCurrentUser: true,
  };

  const lockedByOtherStatus: LockStatus = {
    isLocked: true,
    lockedBy: mockOtherUserId,
    lockedAt: new Date().toISOString(),
    isStale: false,
    isLockedByCurrentUser: false,
  };

  const staleLockStatus: LockStatus = {
    isLocked: true,
    lockedBy: mockOtherUserId,
    lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isStale: true,
    isLockedByCurrentUser: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(locksService.checkLock).mockResolvedValue(unlockedStatus);
    vi.mocked(locksService.acquireLock).mockResolvedValue({
      success: true,
      lockedBy: mockUser.id,
      lockedAt: new Date().toISOString(),
    });
    vi.mocked(locksService.releaseLock).mockResolvedValue({ success: true });
    vi.mocked(locksService.forceUnlock).mockResolvedValue({ success: true });
    vi.mocked(locksService.refreshLock).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // =========================================================================
  // Initial State
  // =========================================================================

  describe('initial state', () => {
    it('returns default unlocked status before loading', () => {
      const { result } = renderHook(() => usePlanLock(mockPlanId));

      // Before async load completes, should have default values
      expect(result.current.isAcquiring).toBe(false);
      expect(result.current.isReleasing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('loads lock status on mount', async () => {
      vi.mocked(locksService.checkLock).mockResolvedValue(lockedByOtherStatus);

      const { result } = renderHook(() => usePlanLock(mockPlanId));

      await waitFor(() => {
        expect(result.current.lockStatus.isLocked).toBe(true);
      });

      expect(result.current.lockStatus.lockedBy).toBe(mockOtherUserId);
      expect(result.current.lockStatus.isLockedByCurrentUser).toBe(false);
    });

    it('handles null planId', () => {
      const { result } = renderHook(() => usePlanLock(null));

      expect(result.current.lockStatus.isLocked).toBe(false);
      expect(locksService.checkLock).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // acquireLock
  // =========================================================================

  describe('acquireLock', () => {
    it('acquires lock successfully', async () => {
      const { result } = renderHook(() => usePlanLock(mockPlanId));

      // Wait for initial load
      await waitFor(() => {
        expect(locksService.checkLock).toHaveBeenCalled();
      });

      await act(async () => {
        const lockResult = await result.current.acquireLock();
        expect(lockResult.success).toBe(true);
      });

      expect(result.current.lockStatus.isLocked).toBe(true);
      expect(result.current.lockStatus.isLockedByCurrentUser).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('handles lock acquisition failure', async () => {
      vi.mocked(locksService.acquireLock).mockResolvedValue({
        success: false,
        error: 'Plan is being edited by another user',
        lockedBy: mockOtherUserId,
      });
      vi.mocked(locksService.checkLock).mockResolvedValue(lockedByOtherStatus);

      const { result } = renderHook(() => usePlanLock(mockPlanId));

      // Wait for initial load
      await waitFor(() => {
        expect(locksService.checkLock).toHaveBeenCalled();
      });

      await act(async () => {
        const lockResult = await result.current.acquireLock();
        expect(lockResult.success).toBe(false);
      });

      expect(result.current.error).toBe('Plan is being edited by another user');
    });

    it('returns error when planId is null', async () => {
      const { result } = renderHook(() => usePlanLock(null));

      await act(async () => {
        const lockResult = await result.current.acquireLock();
        expect(lockResult.success).toBe(false);
        expect(lockResult.error).toBe('Not authenticated');
      });
    });
  });

  // =========================================================================
  // releaseLock
  // =========================================================================

  describe('releaseLock', () => {
    it('releases lock successfully', async () => {
      vi.mocked(locksService.checkLock).mockResolvedValue(lockedByCurrentUserStatus);

      const { result } = renderHook(() => usePlanLock(mockPlanId));

      await waitFor(() => {
        expect(result.current.lockStatus.isLockedByCurrentUser).toBe(true);
      });

      await act(async () => {
        const releaseResult = await result.current.releaseLock();
        expect(releaseResult.success).toBe(true);
      });

      expect(result.current.lockStatus.isLocked).toBe(false);
    });

    it('returns error when no planId', async () => {
      const { result } = renderHook(() => usePlanLock(null));

      await act(async () => {
        const releaseResult = await result.current.releaseLock();
        expect(releaseResult.success).toBe(false);
        expect(releaseResult.error).toBe('No plan ID');
      });
    });
  });

  // =========================================================================
  // forceUnlock
  // =========================================================================

  describe('forceUnlock', () => {
    it('force unlocks stale lock successfully', async () => {
      vi.mocked(locksService.checkLock).mockResolvedValue(staleLockStatus);

      const { result } = renderHook(() => usePlanLock(mockPlanId));

      await waitFor(() => {
        expect(result.current.lockStatus.isStale).toBe(true);
      });

      await act(async () => {
        const unlockResult = await result.current.forceUnlock();
        expect(unlockResult.success).toBe(true);
      });

      expect(result.current.lockStatus.isLocked).toBe(false);
    });

    it('handles force unlock failure', async () => {
      vi.mocked(locksService.checkLock).mockResolvedValue(lockedByOtherStatus);
      vi.mocked(locksService.forceUnlock).mockResolvedValue({
        success: false,
        error: 'Cannot force unlock - lock is not stale',
      });

      const { result } = renderHook(() => usePlanLock(mockPlanId));

      await waitFor(() => {
        expect(result.current.lockStatus.isLocked).toBe(true);
      });

      await act(async () => {
        const unlockResult = await result.current.forceUnlock();
        expect(unlockResult.success).toBe(false);
      });

      expect(result.current.error).toBe('Cannot force unlock - lock is not stale');
    });

    it('returns error when no planId', async () => {
      const { result } = renderHook(() => usePlanLock(null));

      await act(async () => {
        const unlockResult = await result.current.forceUnlock();
        expect(unlockResult.success).toBe(false);
        expect(unlockResult.error).toBe('No plan ID');
      });
    });
  });

  // =========================================================================
  // refreshStatus
  // =========================================================================

  describe('refreshStatus', () => {
    it('refreshStatus manually refreshes lock status', async () => {
      const { result } = renderHook(() => usePlanLock(mockPlanId));

      await waitFor(() => {
        expect(locksService.checkLock).toHaveBeenCalled();
      });

      vi.mocked(locksService.checkLock).mockClear();

      await act(async () => {
        await result.current.refreshStatus();
      });

      expect(locksService.checkLock).toHaveBeenCalledWith(mockPlanId, mockUser.id);
    });
  });

  // =========================================================================
  // Lock Status Updates
  // =========================================================================

  describe('lock status updates', () => {
    it('updates status when lock changes', async () => {
      // Start with unlocked
      vi.mocked(locksService.checkLock).mockResolvedValue(unlockedStatus);

      const { result } = renderHook(() => usePlanLock(mockPlanId));

      await waitFor(() => {
        expect(result.current.lockStatus.isLocked).toBe(false);
      });

      // Simulate status change on refresh
      vi.mocked(locksService.checkLock).mockResolvedValue(lockedByOtherStatus);

      await act(async () => {
        await result.current.refreshStatus();
      });

      expect(result.current.lockStatus.isLocked).toBe(true);
      expect(result.current.lockStatus.lockedBy).toBe(mockOtherUserId);
    });
  });
});
