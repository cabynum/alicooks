/**
 * usePlans Hook Tests
 *
 * Tests the React hook for managing meal plans.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlans } from '@/hooks/usePlans';
import { STORAGE_KEYS } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

describe('usePlans', () => {
  beforeEach(() => {
    localStorageMock.clear();
    uuidCounter = 0;
  });

  describe('initial state', () => {
    it('sets isLoading false after loading completes', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('loads plans from storage', async () => {
      const existingPlans = [
        {
          id: 'existing-1',
          name: 'Week 1',
          startDate: '2024-12-16',
          days: [{ date: '2024-12-16', dishIds: [] }],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      localStorageMock.setItem(
        STORAGE_KEYS.plans,
        JSON.stringify(existingPlans)
      );

      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.plans).toHaveLength(1);
      expect(result.current.plans[0].name).toBe('Week 1');
    });

    it('returns empty array when no plans exist', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.plans).toEqual([]);
    });
  });

  describe('createPlan', () => {
    it('creates a plan with default 7 days', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan();
      });

      expect(plan).toBeDefined();
      expect(result.current.plans).toHaveLength(1);
      expect(result.current.plans[0].days).toHaveLength(7);
    });

    it('creates a plan with custom number of days', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3);
      });

      expect(plan.days).toHaveLength(3);
    });

    it('creates a plan with custom start date', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const startDate = new Date('2024-12-25');
      let plan;
      act(() => {
        plan = result.current.createPlan(3, startDate);
      });

      expect(plan.startDate).toBe('2024-12-25');
      expect(plan.days[0].date).toBe('2024-12-25');
      expect(plan.days[1].date).toBe('2024-12-26');
      expect(plan.days[2].date).toBe('2024-12-27');
    });

    it('creates a plan with custom name', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(7, new Date(), 'Holiday Week');
      });

      expect(plan.name).toBe('Holiday Week');
    });

    it('defaults name to "Meal Plan" when not provided', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan();
      });

      expect(plan.name).toBe('Meal Plan');
    });

    it('persists to localStorage', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.createPlan(7, new Date(), 'Persisted Plan');
      });

      const stored = JSON.parse(
        localStorageMock.getItem(STORAGE_KEYS.plans) || '[]'
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Persisted Plan');
    });
  });

  describe('updatePlan', () => {
    it('updates plan name', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(7, new Date(), 'Original');
      });

      act(() => {
        result.current.updatePlan(plan.id, { name: 'Updated' });
      });

      expect(result.current.plans[0].name).toBe('Updated');
    });

    it('returns undefined for non-existent plan', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updated;
      act(() => {
        updated = result.current.updatePlan('nonexistent', { name: 'Test' });
      });

      expect(updated).toBeUndefined();
    });
  });

  describe('deletePlan', () => {
    it('removes plan from state', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan();
      });

      expect(result.current.plans).toHaveLength(1);

      act(() => {
        result.current.deletePlan(plan.id);
      });

      expect(result.current.plans).toHaveLength(0);
    });

    it('returns true on successful delete', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan();
      });

      let success;
      act(() => {
        success = result.current.deletePlan(plan.id);
      });

      expect(success).toBe(true);
    });

    it('returns false for non-existent plan', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success;
      act(() => {
        success = result.current.deletePlan('nonexistent');
      });

      expect(success).toBe(false);
    });
  });

  describe('getPlanById', () => {
    it('finds plan by ID', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(7, new Date(), 'Find Me');
      });

      const found = result.current.getPlanById(plan.id);
      expect(found?.name).toBe('Find Me');
    });

    it('returns undefined for non-existent ID', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const found = result.current.getPlanById('nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('assignDishToDay', () => {
    it('adds dish to a day', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3, new Date('2024-12-16'));
      });

      let success;
      act(() => {
        success = result.current.assignDishToDay(plan.id, '2024-12-16', 'dish-1');
      });

      expect(success).toBe(true);
      expect(result.current.plans[0].days[0].dishIds).toContain('dish-1');
    });

    it('allows multiple dishes on same day', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3, new Date('2024-12-16'));
      });

      act(() => {
        result.current.assignDishToDay(plan.id, '2024-12-16', 'dish-1');
        result.current.assignDishToDay(plan.id, '2024-12-16', 'dish-2');
      });

      expect(result.current.plans[0].days[0].dishIds).toHaveLength(2);
      expect(result.current.plans[0].days[0].dishIds).toContain('dish-1');
      expect(result.current.plans[0].days[0].dishIds).toContain('dish-2');
    });

    it('returns false for non-existent plan', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success;
      act(() => {
        success = result.current.assignDishToDay('nonexistent', '2024-12-16', 'dish-1');
      });

      expect(success).toBe(false);
    });

    it('returns false for non-existent date', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3, new Date('2024-12-16'));
      });

      let success;
      act(() => {
        success = result.current.assignDishToDay(plan.id, '2024-12-25', 'dish-1');
      });

      expect(success).toBe(false);
    });
  });

  describe('removeDishFromDay', () => {
    it('removes dish from a day', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3, new Date('2024-12-16'));
      });

      act(() => {
        result.current.assignDishToDay(plan.id, '2024-12-16', 'dish-1');
      });

      expect(result.current.plans[0].days[0].dishIds).toContain('dish-1');

      let success;
      act(() => {
        success = result.current.removeDishFromDay(plan.id, '2024-12-16', 'dish-1');
      });

      expect(success).toBe(true);
      expect(result.current.plans[0].days[0].dishIds).not.toContain('dish-1');
    });

    it('removes only first occurrence of duplicate dish', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3, new Date('2024-12-16'));
      });

      // Add same dish twice
      act(() => {
        result.current.assignDishToDay(plan.id, '2024-12-16', 'dish-1');
        result.current.assignDishToDay(plan.id, '2024-12-16', 'dish-1');
      });

      expect(result.current.plans[0].days[0].dishIds).toHaveLength(2);

      act(() => {
        result.current.removeDishFromDay(plan.id, '2024-12-16', 'dish-1');
      });

      // Should still have one occurrence
      expect(result.current.plans[0].days[0].dishIds).toHaveLength(1);
      expect(result.current.plans[0].days[0].dishIds[0]).toBe('dish-1');
    });

    it('returns false for non-existent plan', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success;
      act(() => {
        success = result.current.removeDishFromDay('nonexistent', '2024-12-16', 'dish-1');
      });

      expect(success).toBe(false);
    });

    it('returns false for non-existent date', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3, new Date('2024-12-16'));
      });

      let success;
      act(() => {
        success = result.current.removeDishFromDay(plan.id, '2024-12-25', 'dish-1');
      });

      expect(success).toBe(false);
    });

    it('returns false for non-existent dish', async () => {
      const { result } = renderHook(() => usePlans());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let plan;
      act(() => {
        plan = result.current.createPlan(3, new Date('2024-12-16'));
      });

      let success;
      act(() => {
        success = result.current.removeDishFromDay(plan.id, '2024-12-16', 'dish-1');
      });

      expect(success).toBe(false);
    });
  });
});

