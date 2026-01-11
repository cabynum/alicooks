/**
 * Locks Service Tests
 *
 * Tests for the meal plan locking functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  acquireLock,
  releaseLock,
  forceUnlock,
  checkLock,
  refreshLock,
  isLockStale,
  formatLockTime,
  LOCK_TIMEOUT_MS,
} from '@/services/locks';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import * as syncModule from '@/services/sync';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock sync module for online status
vi.mock('@/services/sync', () => ({
  getIsOnline: vi.fn(() => true),
}));

describe('Locks Service', () => {
  const mockPlanId = 'plan-123';
  const mockUserId = 'user-456';
  const mockOtherUserId = 'user-789';
  const mockHouseholdId = 'household-001';

  beforeEach(async () => {
    // Clear the database before each test
    await db.mealPlans.clear();

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await db.mealPlans.clear();
  });

  // =========================================================================
  // isLockStale
  // =========================================================================

  describe('isLockStale', () => {
    it('returns false for undefined lockedAt', () => {
      expect(isLockStale(undefined)).toBe(false);
    });

    it('returns false for a recent lock (less than 5 minutes)', () => {
      const recentTime = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      expect(isLockStale(recentTime)).toBe(false);
    });

    it('returns true for a stale lock (more than 5 minutes)', () => {
      const staleTime = new Date(Date.now() - LOCK_TIMEOUT_MS - 1000).toISOString();
      expect(isLockStale(staleTime)).toBe(true);
    });

    it('returns false for a lock exactly at the timeout boundary', () => {
      // A lock exactly at the boundary should not be stale yet
      const boundaryTime = new Date(Date.now() - LOCK_TIMEOUT_MS + 1000).toISOString();
      expect(isLockStale(boundaryTime)).toBe(false);
    });
  });

  // =========================================================================
  // formatLockTime
  // =========================================================================

  describe('formatLockTime', () => {
    it('returns empty string for undefined', () => {
      expect(formatLockTime(undefined)).toBe('');
    });

    it('returns "just now" for less than a minute', () => {
      const justNow = new Date(Date.now() - 30000).toISOString(); // 30 seconds ago
      expect(formatLockTime(justNow)).toBe('just now');
    });

    it('returns "1 min ago" for exactly one minute', () => {
      const oneMinAgo = new Date(Date.now() - 60000).toISOString();
      expect(formatLockTime(oneMinAgo)).toBe('1 min ago');
    });

    it('returns "N min ago" for multiple minutes', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
      expect(formatLockTime(fiveMinAgo)).toBe('5 min ago');
    });

    it('returns "1 hour ago" for exactly one hour', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60000).toISOString();
      expect(formatLockTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('returns "N hours ago" for multiple hours', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60000).toISOString();
      expect(formatLockTime(threeHoursAgo)).toBe('3 hours ago');
    });
  });

  // =========================================================================
  // checkLock (Local Cache)
  // =========================================================================

  describe('checkLock (local cache)', () => {
    beforeEach(() => {
      // Set offline mode to avoid Supabase calls
      vi.mocked(syncModule.getIsOnline).mockReturnValue(false);
    });

    it('returns unlocked status when plan not found', async () => {
      const status = await checkLock('nonexistent-plan');

      expect(status.isLocked).toBe(false);
      expect(status.isStale).toBe(false);
      expect(status.isLockedByCurrentUser).toBe(false);
    });

    it('returns unlocked status when plan has no lock', async () => {
      // Add a plan without lock
      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const status = await checkLock(mockPlanId);

      expect(status.isLocked).toBe(false);
      expect(status.lockedBy).toBeUndefined();
      expect(status.lockedAt).toBeUndefined();
    });

    it('returns locked status when plan is locked', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const status = await checkLock(mockPlanId);

      expect(status.isLocked).toBe(true);
      expect(status.lockedBy).toBe(mockOtherUserId);
      expect(status.lockedAt).toBe(lockedAt);
      expect(status.isStale).toBe(false);
    });

    it('identifies stale locks', async () => {
      const staleLockedAt = new Date(Date.now() - LOCK_TIMEOUT_MS - 1000).toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt: staleLockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const status = await checkLock(mockPlanId);

      expect(status.isLocked).toBe(true);
      expect(status.isStale).toBe(true);
    });

    it('identifies when current user holds the lock', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const status = await checkLock(mockPlanId, mockUserId);

      expect(status.isLocked).toBe(true);
      expect(status.isLockedByCurrentUser).toBe(true);
    });

    it('identifies when another user holds the lock', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const status = await checkLock(mockPlanId, mockUserId);

      expect(status.isLocked).toBe(true);
      expect(status.isLockedByCurrentUser).toBe(false);
    });
  });

  // =========================================================================
  // acquireLock (Local/Offline)
  // =========================================================================

  describe('acquireLock (offline mode)', () => {
    beforeEach(() => {
      vi.mocked(syncModule.getIsOnline).mockReturnValue(false);
    });

    it('acquires lock on unlocked plan', async () => {
      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await acquireLock(mockPlanId, mockUserId);

      expect(result.success).toBe(true);
      expect(result.lockedBy).toBe(mockUserId);
      expect(result.lockedAt).toBeDefined();

      // Verify local cache was updated
      const plan = await db.mealPlans.get(mockPlanId);
      expect(plan?.lockedBy).toBe(mockUserId);
      expect(plan?.lockedAt).toBeDefined();
    });

    it('fails when plan not found', async () => {
      const result = await acquireLock('nonexistent-plan', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan not found');
    });

    it('fails when locked by another user (not stale)', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await acquireLock(mockPlanId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan is being edited by another user');
      expect(result.lockedBy).toBe(mockOtherUserId);
    });

    it('succeeds when taking over a stale lock', async () => {
      const staleLockedAt = new Date(Date.now() - LOCK_TIMEOUT_MS - 1000).toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt: staleLockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await acquireLock(mockPlanId, mockUserId);

      expect(result.success).toBe(true);
      expect(result.lockedBy).toBe(mockUserId);

      // Verify lock was transferred
      const plan = await db.mealPlans.get(mockPlanId);
      expect(plan?.lockedBy).toBe(mockUserId);
    });

    it('succeeds when refreshing own lock', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await acquireLock(mockPlanId, mockUserId);

      expect(result.success).toBe(true);
      expect(result.lockedBy).toBe(mockUserId);
    });
  });

  // =========================================================================
  // releaseLock (Local/Offline)
  // =========================================================================

  describe('releaseLock (offline mode)', () => {
    beforeEach(() => {
      vi.mocked(syncModule.getIsOnline).mockReturnValue(false);
    });

    it('releases lock successfully', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await releaseLock(mockPlanId);

      expect(result.success).toBe(true);

      // Verify lock was cleared
      const plan = await db.mealPlans.get(mockPlanId);
      expect(plan?.lockedBy).toBeUndefined();
      expect(plan?.lockedAt).toBeUndefined();
    });

    it('fails when plan not found', async () => {
      const result = await releaseLock('nonexistent-plan');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan not found');
    });

    it('fails when trying to release lock held by another user', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await releaseLock(mockPlanId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not locked by this user');
    });

    it('releases any lock when userId not provided', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await releaseLock(mockPlanId);

      expect(result.success).toBe(true);

      const plan = await db.mealPlans.get(mockPlanId);
      expect(plan?.lockedBy).toBeUndefined();
    });
  });

  // =========================================================================
  // forceUnlock
  // =========================================================================

  describe('forceUnlock', () => {
    beforeEach(() => {
      vi.mocked(syncModule.getIsOnline).mockReturnValue(false);
    });

    it('succeeds when lock is stale', async () => {
      const staleLockedAt = new Date(Date.now() - LOCK_TIMEOUT_MS - 1000).toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt: staleLockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await forceUnlock(mockPlanId);

      expect(result.success).toBe(true);

      const plan = await db.mealPlans.get(mockPlanId);
      expect(plan?.lockedBy).toBeUndefined();
    });

    it('fails when lock is not stale', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await forceUnlock(mockPlanId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot force unlock - lock is not stale');
      expect(result.lockedBy).toBe(mockOtherUserId);
    });

    it('succeeds when plan is not locked', async () => {
      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await forceUnlock(mockPlanId);

      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // refreshLock
  // =========================================================================

  describe('refreshLock', () => {
    beforeEach(() => {
      vi.mocked(syncModule.getIsOnline).mockReturnValue(false);
    });

    it('refreshes lock when user holds it', async () => {
      const oldLockedAt = new Date(Date.now() - 60000).toISOString(); // 1 min ago

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockUserId,
        lockedAt: oldLockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await refreshLock(mockPlanId, mockUserId);

      expect(result.success).toBe(true);

      // Verify timestamp was updated
      const plan = await db.mealPlans.get(mockPlanId);
      expect(plan?.lockedAt).not.toBe(oldLockedAt);
    });

    it('fails when user does not hold the lock', async () => {
      const lockedAt = new Date().toISOString();

      await db.mealPlans.add({
        id: mockPlanId,
        householdId: mockHouseholdId,
        name: 'Test Plan',
        startDate: '2024-01-01',
        days: [],
        createdBy: mockUserId,
        lockedBy: mockOtherUserId,
        lockedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: 'synced',
        _localUpdatedAt: new Date().toISOString(),
      });

      const result = await refreshLock(mockPlanId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not hold this lock');
    });
  });
});
