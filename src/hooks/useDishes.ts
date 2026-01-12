/**
 * useDishes Hook
 *
 * Provides React components with access to the dishes collection.
 * Handles loading from storage, state management, and CRUD operations.
 *
 * Works in two modes:
 * 1. LOCAL MODE (no household): Uses localStorage for single-user experience
 * 2. SYNCED MODE (with household): Uses IndexedDB + syncs to Supabase
 *
 * @example
 * ```tsx
 * function DishList() {
 *   const { dishes, addDish, isLoading } = useDishes();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return dishes.map(dish => <DishCard key={dish.id} dish={dish} />);
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type { Dish, DishType, CreateDishInput, UpdateDishInput } from '@/types';
import {
  getDishes as getLocalDishes,
  saveDish as saveLocalDish,
  updateDish as updateLocalDish,
  deleteDish as deleteLocalDish,
  getDishesFromCache,
  addDishToCache,
  updateDishInCache,
  deleteDishFromCache,
  onDataChange,
} from '@/services';
import { useHousehold } from './useHousehold';
import { useAuthContext } from '@/components/auth';

/**
 * Return type for the useDishes hook.
 */
export interface UseDishesReturn {
  /** All dishes in the collection */
  dishes: Dish[];

  /** True while initially loading from storage */
  isLoading: boolean;

  /** Add a new dish to the collection */
  addDish: (input: CreateDishInput) => Promise<Dish>;

  /** Update an existing dish */
  updateDish: (id: string, input: UpdateDishInput) => Promise<Dish | undefined>;

  /** Delete a dish from the collection */
  deleteDish: (id: string) => Promise<boolean>;

  /** Get dishes filtered by type */
  getDishesByType: (type: DishType) => Dish[];

  /** Get a single dish by ID */
  getDishById: (id: string) => Dish | undefined;

  /** Whether running in synced mode (household active) */
  isSyncedMode: boolean;
}

/**
 * Converts a string to title case (first letter of each word capitalized).
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Returns the current timestamp in ISO 8601 format.
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Hook for managing the dishes collection.
 *
 * Automatically detects whether to use local or synced mode based on
 * authentication and household state.
 */
export function useDishes(): UseDishesReturn {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAuthenticated } = useAuthContext();
  const { currentHousehold } = useHousehold();

  // Determine mode based on auth and household state
  const isSyncedMode = isAuthenticated && currentHousehold !== null;

  /**
   * Load dishes from the appropriate storage.
   */
  const loadDishes = useCallback(async () => {
    setIsLoading(true);

    try {
      if (isSyncedMode && currentHousehold) {
        // SYNCED MODE: Load from IndexedDB cache
        const cachedDishes = await getDishesFromCache(currentHousehold.id);
        setDishes(cachedDishes);
      } else {
        // LOCAL MODE: Load from localStorage
        const localDishes = getLocalDishes();
        setDishes(localDishes);
      }
    } catch (error) {
      console.error('Failed to load dishes:', error);
      setDishes([]);
    } finally {
      setIsLoading(false);
    }
  }, [isSyncedMode, currentHousehold]);

  // Load dishes on mount and when mode changes
  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  // Subscribe to data changes (for synced mode)
  useEffect(() => {
    if (!isSyncedMode) return;

    const cleanup = onDataChange(() => {
      loadDishes();
    });

    return cleanup;
  }, [isSyncedMode, loadDishes]);

  /**
   * Add a new dish to the collection.
   */
  const addDish = useCallback(
    async (input: CreateDishInput): Promise<Dish> => {
      const newDish: Dish = {
        id: crypto.randomUUID(),
        name: toTitleCase(input.name.trim()),
        type: input.type ?? 'entree',
        createdAt: now(),
        updatedAt: now(),
        ...(input.recipeUrls && input.recipeUrls.length > 0 && {
          recipeUrls: input.recipeUrls,
        }),
        ...(input.cookTimeMinutes !== undefined && {
          cookTimeMinutes: input.cookTimeMinutes,
        }),
        // Pairing data (entrees only)
        ...(input.pairsWellWith && input.pairsWellWith.length > 0 && {
          pairsWellWith: input.pairsWellWith,
        }),
        // Synced mode fields
        ...(isSyncedMode &&
          currentHousehold && {
            householdId: currentHousehold.id,
            addedBy: user?.id ?? '',
          }),
      };

      if (isSyncedMode && currentHousehold) {
        // SYNCED MODE: Add to IndexedDB cache + trigger sync
        await addDishToCache(newDish as Dish & { householdId: string; addedBy: string });
        setDishes((prev) => [...prev, newDish]);
      } else {
        // LOCAL MODE: Save to localStorage
        const saved = saveLocalDish(input);
        setDishes((prev) => [...prev, saved]);
        return saved;
      }

      return newDish;
    },
    [isSyncedMode, currentHousehold, user]
  );

  /**
   * Update an existing dish.
   */
  const updateDish = useCallback(
    async (id: string, input: UpdateDishInput): Promise<Dish | undefined> => {
      const existing = dishes.find((d) => d.id === id);
      if (!existing) return undefined;

      const updated: Dish = {
        ...existing,
        name: input.name !== undefined ? toTitleCase(input.name.trim()) : existing.name,
        type: input.type !== undefined ? input.type : existing.type,
        updatedAt: now(),
        ...(input.recipeUrls !== undefined && {
          recipeUrls: input.recipeUrls.length > 0 ? input.recipeUrls : undefined,
        }),
        ...(input.cookTimeMinutes !== undefined && {
          cookTimeMinutes: input.cookTimeMinutes || undefined,
        }),
        // Pairing data - update if explicitly provided (can be empty to clear)
        ...(input.pairsWellWith !== undefined && {
          pairsWellWith: input.pairsWellWith.length > 0 ? input.pairsWellWith : undefined,
        }),
      };

      if (isSyncedMode && currentHousehold) {
        // SYNCED MODE: Update in IndexedDB cache + trigger sync
        await updateDishInCache(updated as Dish & { householdId: string; addedBy: string });
        setDishes((prev) => prev.map((d) => (d.id === id ? updated : d)));
      } else {
        // LOCAL MODE: Update in localStorage
        const result = updateLocalDish(id, input);
        if (result) {
          setDishes((prev) => prev.map((d) => (d.id === id ? result : d)));
        }
        return result;
      }

      return updated;
    },
    [dishes, isSyncedMode, currentHousehold]
  );

  /**
   * Delete a dish from the collection.
   */
  const deleteDish = useCallback(
    async (id: string): Promise<boolean> => {
      if (isSyncedMode && currentHousehold) {
        // SYNCED MODE: Soft-delete in IndexedDB cache + trigger sync
        await deleteDishFromCache(id);
        setDishes((prev) => prev.filter((d) => d.id !== id));
        return true;
      } else {
        // LOCAL MODE: Delete from localStorage
        const success = deleteLocalDish(id);
        if (success) {
          setDishes((prev) => prev.filter((d) => d.id !== id));
        }
        return success;
      }
    },
    [isSyncedMode, currentHousehold]
  );

  /**
   * Get dishes filtered by type.
   */
  const getDishesByType = useCallback(
    (type: DishType): Dish[] => {
      return dishes.filter((dish) => dish.type === type);
    },
    [dishes]
  );

  /**
   * Get a single dish by ID.
   */
  const getDishById = useCallback(
    (id: string): Dish | undefined => {
      return dishes.find((dish) => dish.id === id);
    },
    [dishes]
  );

  return {
    dishes,
    isLoading,
    addDish,
    updateDish,
    deleteDish,
    getDishesByType,
    getDishById,
    isSyncedMode,
  };
}
