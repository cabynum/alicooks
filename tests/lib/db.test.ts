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

      // Clear all
      await clearAllData();

      // Verify empty
      const dishes = await db.dishes.toArray();
      const meta = await db.syncMeta.toArray();

      expect(dishes).toHaveLength(0);
      expect(meta).toHaveLength(0);
    });
  });
});
