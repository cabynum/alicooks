/**
 * Tests for the local IndexedDB database (Dexie)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  clearAllData,
  withSyncMetadata,
  getPendingItems,
  markAsSynced,
  getSyncMeta,
  setSyncMeta,
  enqueueOperation,
  getQueuedOperations,
  getQueuedOperationCount,
  dequeueOperation,
  markQueueAttempt,
  clearQueueForEntity,
  clearOfflineQueue,
  MAX_QUEUE_RETRIES,
  type CachedDish,
  type DishType,
} from '../../src/lib/db';

describe('Local Database (Dexie)', () => {
  // Clear all data before each test
  beforeEach(async () => {
    await clearAllData();
  });

  describe('withSyncMetadata', () => {
    it('adds sync metadata with pending status by default', () => {
      const dish = {
        id: 'dish-1',
        householdId: 'household-1',
        name: 'Test Dish',
        type: 'entree' as DishType,
        addedBy: 'user-1',
        createdAt: '2024-12-28T00:00:00Z',
        updatedAt: '2024-12-28T00:00:00Z',
      };

      const cached = withSyncMetadata(dish);

      expect(cached._syncStatus).toBe('pending');
      expect(cached._localUpdatedAt).toBeDefined();
      expect(cached.name).toBe('Test Dish');
    });

    it('allows specifying a different sync status', () => {
      const dish = { id: 'dish-1', name: 'Test' };
      const cached = withSyncMetadata(dish, 'synced');

      expect(cached._syncStatus).toBe('synced');
    });
  });

  describe('dishes table', () => {
    it('can add and retrieve a dish', async () => {
      const dish: CachedDish = {
        id: 'dish-1',
        householdId: 'household-1',
        name: 'Grilled Chicken',
        type: 'entree',
        addedBy: 'user-1',
        createdAt: '2024-12-28T00:00:00Z',
        updatedAt: '2024-12-28T00:00:00Z',
        _syncStatus: 'synced',
        _localUpdatedAt: '2024-12-28T00:00:00Z',
      };

      await db.dishes.add(dish);
      const retrieved = await db.dishes.get('dish-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Grilled Chicken');
      expect(retrieved?.type).toBe('entree');
    });

    it('can query dishes by household', async () => {
      const dishes: CachedDish[] = [
        {
          id: 'dish-1',
          householdId: 'household-1',
          name: 'Dish A',
          type: 'entree',
          addedBy: 'user-1',
          createdAt: '2024-12-28T00:00:00Z',
          updatedAt: '2024-12-28T00:00:00Z',
          _syncStatus: 'synced',
          _localUpdatedAt: '2024-12-28T00:00:00Z',
        },
        {
          id: 'dish-2',
          householdId: 'household-1',
          name: 'Dish B',
          type: 'side',
          addedBy: 'user-1',
          createdAt: '2024-12-28T00:00:00Z',
          updatedAt: '2024-12-28T00:00:00Z',
          _syncStatus: 'synced',
          _localUpdatedAt: '2024-12-28T00:00:00Z',
        },
        {
          id: 'dish-3',
          householdId: 'household-2',
          name: 'Dish C',
          type: 'entree',
          addedBy: 'user-2',
          createdAt: '2024-12-28T00:00:00Z',
          updatedAt: '2024-12-28T00:00:00Z',
          _syncStatus: 'synced',
          _localUpdatedAt: '2024-12-28T00:00:00Z',
        },
      ];

      await db.dishes.bulkAdd(dishes);

      const household1Dishes = await db.dishes
        .where('householdId')
        .equals('household-1')
        .toArray();

      expect(household1Dishes).toHaveLength(2);
      expect(household1Dishes.map((d) => d.name)).toContain('Dish A');
      expect(household1Dishes.map((d) => d.name)).toContain('Dish B');
    });

    it('can update a dish', async () => {
      const dish: CachedDish = {
        id: 'dish-1',
        householdId: 'household-1',
        name: 'Original Name',
        type: 'entree',
        addedBy: 'user-1',
        createdAt: '2024-12-28T00:00:00Z',
        updatedAt: '2024-12-28T00:00:00Z',
        _syncStatus: 'synced',
        _localUpdatedAt: '2024-12-28T00:00:00Z',
      };

      await db.dishes.add(dish);
      await db.dishes.update('dish-1', { name: 'Updated Name', _syncStatus: 'pending' });

      const updated = await db.dishes.get('dish-1');
      expect(updated?.name).toBe('Updated Name');
      expect(updated?._syncStatus).toBe('pending');
    });

    it('can delete a dish', async () => {
      const dish: CachedDish = {
        id: 'dish-1',
        householdId: 'household-1',
        name: 'To Delete',
        type: 'entree',
        addedBy: 'user-1',
        createdAt: '2024-12-28T00:00:00Z',
        updatedAt: '2024-12-28T00:00:00Z',
        _syncStatus: 'synced',
        _localUpdatedAt: '2024-12-28T00:00:00Z',
      };

      await db.dishes.add(dish);
      await db.dishes.delete('dish-1');

      const deleted = await db.dishes.get('dish-1');
      expect(deleted).toBeUndefined();
    });
  });

  describe('getPendingItems', () => {
    it('returns only items with pending sync status', async () => {
      const dishes: CachedDish[] = [
        {
          id: 'dish-1',
          householdId: 'household-1',
          name: 'Synced Dish',
          type: 'entree',
          addedBy: 'user-1',
          createdAt: '2024-12-28T00:00:00Z',
          updatedAt: '2024-12-28T00:00:00Z',
          _syncStatus: 'synced',
          _localUpdatedAt: '2024-12-28T00:00:00Z',
        },
        {
          id: 'dish-2',
          householdId: 'household-1',
          name: 'Pending Dish',
          type: 'side',
          addedBy: 'user-1',
          createdAt: '2024-12-28T00:00:00Z',
          updatedAt: '2024-12-28T00:00:00Z',
          _syncStatus: 'pending',
          _localUpdatedAt: '2024-12-28T00:00:00Z',
        },
      ];

      await db.dishes.bulkAdd(dishes);

      const pending = await getPendingItems(db.dishes);

      expect(pending).toHaveLength(1);
      expect(pending[0].name).toBe('Pending Dish');
    });
  });

  describe('markAsSynced', () => {
    it('updates an item to synced status', async () => {
      const dish: CachedDish = {
        id: 'dish-1',
        householdId: 'household-1',
        name: 'Pending Dish',
        type: 'entree',
        addedBy: 'user-1',
        createdAt: '2024-12-28T00:00:00Z',
        updatedAt: '2024-12-28T00:00:00Z',
        _syncStatus: 'pending',
        _localUpdatedAt: '2024-12-28T00:00:00Z',
      };

      await db.dishes.add(dish);
      await markAsSynced(db.dishes, 'dish-1', '2024-12-28T01:00:00Z');

      const updated = await db.dishes.get('dish-1');
      expect(updated?._syncStatus).toBe('synced');
      expect(updated?._serverUpdatedAt).toBe('2024-12-28T01:00:00Z');
    });
  });

  describe('syncMeta', () => {
    it('can store and retrieve metadata', async () => {
      await setSyncMeta('lastSyncedAt', '2024-12-28T00:00:00Z');
      await setSyncMeta('currentHouseholdId', 'household-123');

      const lastSynced = await getSyncMeta<string>('lastSyncedAt');
      const householdId = await getSyncMeta<string>('currentHouseholdId');

      expect(lastSynced).toBe('2024-12-28T00:00:00Z');
      expect(householdId).toBe('household-123');
    });

    it('returns undefined for missing keys', async () => {
      const missing = await getSyncMeta('nonexistent');
      expect(missing).toBeUndefined();
    });

    it('can update metadata', async () => {
      await setSyncMeta('counter', 1);
      await setSyncMeta('counter', 2);

      const value = await getSyncMeta<number>('counter');
      expect(value).toBe(2);
    });
  });

  describe('clearAllData', () => {
    it('removes all data from all tables', async () => {
      // Add some data
      await db.dishes.add({
        id: 'dish-1',
        householdId: 'household-1',
        name: 'Test',
        type: 'entree',
        addedBy: 'user-1',
        createdAt: '2024-12-28T00:00:00Z',
        updatedAt: '2024-12-28T00:00:00Z',
        _syncStatus: 'synced',
        _localUpdatedAt: '2024-12-28T00:00:00Z',
      });
      await setSyncMeta('test', 'value');
      await enqueueOperation('add', 'dish', 'dish-1');

      // Clear all
      await clearAllData();

      // Verify empty
      const dishes = await db.dishes.toArray();
      const meta = await db.syncMeta.toArray();
      const queue = await db.offlineQueue.toArray();

      expect(dishes).toHaveLength(0);
      expect(meta).toHaveLength(0);
      expect(queue).toHaveLength(0);
    });
  });

  describe('offlineQueue', () => {
    describe('enqueueOperation', () => {
      it('adds an operation to the queue', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');

        const operations = await getQueuedOperations();
        expect(operations).toHaveLength(1);
        expect(operations[0].operationType).toBe('add');
        expect(operations[0].entityType).toBe('dish');
        expect(operations[0].entityId).toBe('dish-1');
        expect(operations[0].retryCount).toBe(0);
      });

      it('generates unique IDs for each operation', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        await enqueueOperation('add', 'dish', 'dish-2');

        const operations = await getQueuedOperations();
        expect(operations[0].id).not.toBe(operations[1].id);
      });

      it('returns operations in FIFO order', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
        await enqueueOperation('add', 'dish', 'dish-2');

        const operations = await getQueuedOperations();
        expect(operations[0].entityId).toBe('dish-1');
        expect(operations[1].entityId).toBe('dish-2');
      });
    });

    describe('deduplication', () => {
      it('removes add+delete for same entity (never synced to server)', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        await enqueueOperation('delete', 'dish', 'dish-1');

        const operations = await getQueuedOperations();
        expect(operations).toHaveLength(0);
      });

      it('keeps add operation when update follows (still an add)', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        await enqueueOperation('update', 'dish', 'dish-1');

        const operations = await getQueuedOperations();
        expect(operations).toHaveLength(1);
        expect(operations[0].operationType).toBe('add');
      });

      it('replaces update with delete (delete takes precedence)', async () => {
        await enqueueOperation('update', 'dish', 'dish-1');
        await enqueueOperation('delete', 'dish', 'dish-1');

        const operations = await getQueuedOperations();
        expect(operations).toHaveLength(1);
        expect(operations[0].operationType).toBe('delete');
      });

      it('keeps only one update for multiple updates', async () => {
        await enqueueOperation('update', 'dish', 'dish-1');
        await enqueueOperation('update', 'dish', 'dish-1');
        await enqueueOperation('update', 'dish', 'dish-1');

        const operations = await getQueuedOperations();
        expect(operations).toHaveLength(1);
        expect(operations[0].operationType).toBe('update');
      });

      it('ignores operations after delete', async () => {
        await enqueueOperation('delete', 'dish', 'dish-1');
        await enqueueOperation('update', 'dish', 'dish-1');

        const operations = await getQueuedOperations();
        expect(operations).toHaveLength(1);
        expect(operations[0].operationType).toBe('delete');
      });
    });

    describe('getQueuedOperationCount', () => {
      it('returns 0 for empty queue', async () => {
        const count = await getQueuedOperationCount();
        expect(count).toBe(0);
      });

      it('returns correct count', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        await enqueueOperation('add', 'dish', 'dish-2');
        await enqueueOperation('add', 'mealPlan', 'plan-1');

        const count = await getQueuedOperationCount();
        expect(count).toBe(3);
      });
    });

    describe('dequeueOperation', () => {
      it('removes an operation from the queue', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        const operations = await getQueuedOperations();

        await dequeueOperation(operations[0].id);

        const remaining = await getQueuedOperations();
        expect(remaining).toHaveLength(0);
      });

      it('only removes the specified operation', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        await enqueueOperation('add', 'dish', 'dish-2');
        const operations = await getQueuedOperations();

        await dequeueOperation(operations[0].id);

        const remaining = await getQueuedOperations();
        expect(remaining).toHaveLength(1);
        expect(remaining[0].entityId).toBe('dish-2');
      });
    });

    describe('markQueueAttempt', () => {
      it('increments retry count', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        const operations = await getQueuedOperations();

        await markQueueAttempt(operations[0].id, 'Network error');

        const updated = await getQueuedOperations();
        expect(updated[0].retryCount).toBe(1);
        expect(updated[0].lastError).toBe('Network error');
        expect(updated[0].lastAttemptAt).toBeDefined();
      });

      it('tracks multiple retry attempts', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        const operations = await getQueuedOperations();

        await markQueueAttempt(operations[0].id, 'Error 1');
        await markQueueAttempt(operations[0].id, 'Error 2');
        await markQueueAttempt(operations[0].id, 'Error 3');

        const updated = await getQueuedOperations();
        expect(updated[0].retryCount).toBe(3);
        expect(updated[0].lastError).toBe('Error 3');
      });
    });

    describe('clearQueueForEntity', () => {
      it('removes all operations for a specific entity', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        await enqueueOperation('add', 'dish', 'dish-2');

        await clearQueueForEntity('dish-1');

        const remaining = await getQueuedOperations();
        expect(remaining).toHaveLength(1);
        expect(remaining[0].entityId).toBe('dish-2');
      });
    });

    describe('clearOfflineQueue', () => {
      it('removes all operations', async () => {
        await enqueueOperation('add', 'dish', 'dish-1');
        await enqueueOperation('update', 'mealPlan', 'plan-1');
        await enqueueOperation('delete', 'dish', 'dish-2');

        await clearOfflineQueue();

        const remaining = await getQueuedOperations();
        expect(remaining).toHaveLength(0);
      });
    });

    describe('MAX_QUEUE_RETRIES', () => {
      it('is defined and has a reasonable value', () => {
        expect(MAX_QUEUE_RETRIES).toBeGreaterThan(0);
        expect(MAX_QUEUE_RETRIES).toBeLessThanOrEqual(10);
      });
    });
  });
});
