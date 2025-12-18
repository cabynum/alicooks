/**
 * usePlans Hook
 *
 * Provides React components with access to meal plans.
 * Handles loading from storage, state management, and CRUD operations.
 *
 * @example
 * ```tsx
 * function PlanList() {
 *   const { plans, createPlan, isLoading } = usePlans();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return plans.map(plan => <PlanCard key={plan.id} plan={plan} />);
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type { MealPlan, DayAssignment } from '@/types';
import {
  getPlans,
  getPlan as getPlanFromStorage,
  savePlan,
  updatePlan as updatePlanInStorage,
  deletePlan as deletePlanFromStorage,
} from '@/services';

/**
 * Return type for the usePlans hook.
 */
export interface UsePlansReturn {
  /** All meal plans */
  plans: MealPlan[];

  /** True while initially loading from storage */
  isLoading: boolean;

  /**
   * Create a new meal plan.
   * @param days - Number of days to plan (default: 7)
   * @param startDate - Start date (default: today)
   * @param name - Optional plan name
   */
  createPlan: (days?: number, startDate?: Date, name?: string) => MealPlan;

  /** Update an existing plan's name or days */
  updatePlan: (
    id: string,
    updates: { name?: string; days?: DayAssignment[] }
  ) => MealPlan | undefined;

  /** Delete a meal plan */
  deletePlan: (id: string) => boolean;

  /** Get a single plan by ID */
  getPlanById: (id: string) => MealPlan | undefined;

  /**
   * Assign a dish to a specific day in a plan.
   * Adds the dish ID to the day's dishIds array.
   */
  assignDishToDay: (planId: string, date: string, dishId: string) => boolean;

  /**
   * Remove a dish from a specific day in a plan.
   * Removes the first occurrence of the dish ID from the day's dishIds array.
   */
  removeDishFromDay: (planId: string, date: string, dishId: string) => boolean;
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Hook for managing meal plans.
 *
 * Loads plans from localStorage on mount and keeps React state in sync
 * with storage operations.
 */
export function usePlans(): UsePlansReturn {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load plans from storage on mount
  useEffect(() => {
    const storedPlans = getPlans();
    setPlans(storedPlans);
    setIsLoading(false);
  }, []);

  /**
   * Create a new meal plan.
   * Saves to storage and updates React state.
   */
  const createPlan = useCallback(
    (days: number = 7, startDate: Date = new Date(), name?: string): MealPlan => {
      const newPlan = savePlan({
        name,
        startDate: formatDateToISO(startDate),
        numberOfDays: days,
      });
      setPlans((prev) => [...prev, newPlan]);
      return newPlan;
    },
    []
  );

  /**
   * Update an existing plan.
   * Saves to storage and updates React state.
   */
  const updatePlan = useCallback(
    (
      id: string,
      updates: { name?: string; days?: DayAssignment[] }
    ): MealPlan | undefined => {
      const updated = updatePlanInStorage(id, updates);
      if (updated) {
        setPlans((prev) =>
          prev.map((plan) => (plan.id === id ? updated : plan))
        );
      }
      return updated;
    },
    []
  );

  /**
   * Delete a meal plan.
   * Removes from storage and updates React state.
   */
  const deletePlan = useCallback((id: string): boolean => {
    const success = deletePlanFromStorage(id);
    if (success) {
      setPlans((prev) => prev.filter((plan) => plan.id !== id));
    }
    return success;
  }, []);

  /**
   * Get a single plan by ID from current state.
   */
  const getPlanById = useCallback(
    (id: string): MealPlan | undefined => {
      return plans.find((plan) => plan.id === id);
    },
    [plans]
  );

  /**
   * Assign a dish to a specific day in a plan.
   * Adds the dish ID to the end of the day's dishIds array.
   */
  const assignDishToDay = useCallback(
    (planId: string, date: string, dishId: string): boolean => {
      const plan = getPlanFromStorage(planId);
      if (!plan) return false;

      const dayIndex = plan.days.findIndex((d) => d.date === date);
      if (dayIndex === -1) return false;

      // Create new days array with the dish added
      const newDays = plan.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            dishIds: [...day.dishIds, dishId],
          };
        }
        return day;
      });

      const updated = updatePlanInStorage(planId, { days: newDays });
      if (updated) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? updated : p))
        );
        return true;
      }
      return false;
    },
    []
  );

  /**
   * Remove a dish from a specific day in a plan.
   * Removes the first occurrence of the dish ID.
   */
  const removeDishFromDay = useCallback(
    (planId: string, date: string, dishId: string): boolean => {
      const plan = getPlanFromStorage(planId);
      if (!plan) return false;

      const dayIndex = plan.days.findIndex((d) => d.date === date);
      if (dayIndex === -1) return false;

      const day = plan.days[dayIndex];
      const dishIndex = day.dishIds.indexOf(dishId);
      if (dishIndex === -1) return false;

      // Create new days array with the dish removed
      const newDays = plan.days.map((d, index) => {
        if (index === dayIndex) {
          const newDishIds = [...d.dishIds];
          newDishIds.splice(dishIndex, 1);
          return {
            ...d,
            dishIds: newDishIds,
          };
        }
        return d;
      });

      const updated = updatePlanInStorage(planId, { days: newDays });
      if (updated) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? updated : p))
        );
        return true;
      }
      return false;
    },
    []
  );

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    getPlanById,
    assignDishToDay,
    removeDishFromDay,
  };
}

