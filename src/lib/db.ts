/**
 * Local Database (IndexedDB via Dexie)
 *
 * This provides offline-first data storage. All reads come from here first,
 * and writes are queued for sync to Supabase when online.
 *
 * The local cache enables:
 * - Instant UI responses (no network latency)
 * - Offline access to previously synced data
 * - Optimistic updates with background sync
 */

import Dexie, { type Table } from 'dexie';

// ============================================================================
// SYNC STATUS
// ============================================================================

/**
 * Tracks the sync state of a cached item.
 * - synced: Matches the server state
 * - pending: Local changes not yet uploaded
 * - conflict: Local and server changes conflict (needs resolution)
 */
export type SyncStatus = 'synced' | 'pending' | 'conflict';

// ============================================================================
// ENTITY TYPES (matching Supabase schema)
// ============================================================================

/**
 * User profile information.
 */
export interface Profile {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A household is a group that shares dishes and meal plans.
 */
export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Membership linking a user to a household.
 */
export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: 'creator' | 'member';
  joinedAt: string;
}

/**
 * Invite to join a household.
 */
export interface Invite {
  id: string;
  householdId: string;
  code: string;
  createdBy: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string;
  createdAt: string;
}

/**
 * Dish type categories.
 */
export type DishType = 'entree' | 'side' | 'other';

/**
 * A dish in the household's collection.
 */
export interface Dish {
  id: string;
  householdId: string;
  name: string;
  type: DishType;
  cookTimeMinutes?: number;
  recipeUrl?: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/**
 * A day's meal assignment within a plan.
 */
export interface DayAssignment {
  date: string;
  dishIds: string[];
  assignedBy?: string;
}

/**
 * A meal plan for a household.
 */
export interface MealPlan {
  id: string;
  householdId: string;
  name?: string;
  startDate: string;
  days: DayAssignment[];
  createdBy: string;
  lockedBy?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ============================================================================
// CACHED ENTITY TYPES (with sync metadata)
// ============================================================================

/**
 * A cached entity includes sync metadata for offline support.
 */
interface CacheMetadata {
  /** Current sync status */
  _syncStatus: SyncStatus;
  /** When this item was last modified locally */
  _localUpdatedAt: string;
  /** Server version for conflict detection (optional) */
  _serverUpdatedAt?: string;
}

export type CachedProfile = Profile & CacheMetadata;
export type CachedHousehold = Household & CacheMetadata;
export type CachedHouseholdMember = HouseholdMember & CacheMetadata;
export type CachedDish = Dish & CacheMetadata;
export type CachedMealPlan = MealPlan & CacheMetadata;

// ============================================================================
// SYNC METADATA
// ============================================================================

/**
 * Metadata about the sync state, stored in IndexedDB.
 */
export interface SyncMeta {
  key: string;
  value: unknown;
}

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

/**
 * The DishCourse local database.
 *
 * Uses Dexie.js for a clean API over IndexedDB.
 */
class DishCourseDB extends Dexie {
  // Tables with typed access
  profiles!: Table<CachedProfile>;
  households!: Table<CachedHousehold>;
  members!: Table<CachedHouseholdMember>;
  dishes!: Table<CachedDish>;
  mealPlans!: Table<CachedMealPlan>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super('dishcourse');

    // Schema definition
    // Only indexed fields are listed; all fields are still stored
    this.version(1).stores({
      profiles: 'id',
      households: 'id',
      members: 'id, householdId, userId',
      dishes: 'id, householdId, _syncStatus',
      mealPlans: 'id, householdId, _syncStatus',
      syncMeta: 'key',
    });
  }
}

/**
 * The singleton database instance.
 */
export const db = new DishCourseDB();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Add sync metadata to an entity for local storage.
 */
export function withSyncMetadata<T>(
  entity: T,
  status: SyncStatus = 'pending'
): T & CacheMetadata {
  return {
    ...entity,
    _syncStatus: status,
    _localUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Get all pending (unsynced) items from a table.
 */
export async function getPendingItems<T extends CacheMetadata>(
  table: Table<T>
): Promise<T[]> {
  return table.where('_syncStatus').equals('pending').toArray();
}

/**
 * Mark an item as synced.
 */
export async function markAsSynced<T extends CacheMetadata>(
  table: Table<T>,
  id: string,
  serverUpdatedAt?: string
): Promise<void> {
  // Use modify callback to avoid TypeScript generics issues with Dexie's UpdateSpec
  await table.where('id').equals(id).modify((item) => {
    item._syncStatus = 'synced';
    if (serverUpdatedAt) {
      item._serverUpdatedAt = serverUpdatedAt;
    }
  });
}

/**
 * Clear all local data (for sign out or testing).
 */
export async function clearAllData(): Promise<void> {
  await db.profiles.clear();
  await db.households.clear();
  await db.members.clear();
  await db.dishes.clear();
  await db.mealPlans.clear();
  await db.syncMeta.clear();
}

/**
 * Get a sync metadata value.
 */
export async function getSyncMeta<T>(key: string): Promise<T | undefined> {
  const meta = await db.syncMeta.get(key);
  return meta?.value as T | undefined;
}

/**
 * Set a sync metadata value.
 */
export async function setSyncMeta<T>(key: string, value: T): Promise<void> {
  await db.syncMeta.put({ key, value });
}
