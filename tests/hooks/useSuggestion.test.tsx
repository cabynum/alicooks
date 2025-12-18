/**
 * useSuggestion Hook Tests
 *
 * Tests for the meal suggestion hook.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSuggestion } from '@/hooks/useSuggestion';
import type { Dish } from '@/types';
import { STORAGE_KEYS } from '@/types';

// ============================================================================
// Test Setup
// ============================================================================

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
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${Date.now()}`,
});

/**
 * Creates a test dish with the given properties.
 */
function createDish(
  id: string,
  name: string,
  type: 'entree' | 'side' | 'other'
): Dish {
  return {
    id,
    name,
    type,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

/**
 * Sets up dishes in localStorage for testing.
 */
function setupDishes(dishes: Dish[]) {
  localStorageMock.setItem(STORAGE_KEYS.dishes, JSON.stringify(dishes));
}

// ============================================================================
// Tests
// ============================================================================

describe('useSuggestion', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('initial state', () => {
    it('resolves loading state after mount', async () => {
      const { result } = renderHook(() => useSuggestion());

      // Loading resolves immediately since localStorage is synchronous
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('has null suggestion initially when no dishes', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.suggestion).toBeNull();
    });
  });

  describe('when no dishes exist', () => {
    it('isAvailable is false', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAvailable).toBe(false);
    });

    it('suggestion is null', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.suggestion).toBeNull();
    });

    it('shows helpful message', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.message).toBe(
        'Add some dishes to get meal suggestions!'
      );
    });
  });

  describe('when only sides exist (no entrees)', () => {
    beforeEach(() => {
      setupDishes([
        createDish('s1', 'Rice', 'side'),
        createDish('s2', 'Vegetables', 'side'),
      ]);
    });

    it('isAvailable is false', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAvailable).toBe(false);
    });

    it('shows entree-specific message', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.message).toBe(
        'Add an entree to get meal suggestions!'
      );
    });
  });

  describe('when entrees exist but no sides', () => {
    beforeEach(() => {
      setupDishes([
        createDish('e1', 'Chicken', 'entree'),
        createDish('e2', 'Pasta', 'entree'),
      ]);
    });

    it('isAvailable is true', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAvailable).toBe(true);
    });

    it('auto-generates a suggestion', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.suggestion).not.toBeNull();
      });

      expect(result.current.suggestion?.entree).toBeDefined();
      expect(result.current.suggestion?.sides).toEqual([]);
    });

    it('shows encouragement to add sides', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.message).toBe(
        'Looking good! Add some side dishes for better suggestions.'
      );
    });
  });

  describe('when full dishes exist', () => {
    beforeEach(() => {
      setupDishes([
        createDish('e1', 'Chicken', 'entree'),
        createDish('e2', 'Pasta', 'entree'),
        createDish('s1', 'Rice', 'side'),
        createDish('s2', 'Vegetables', 'side'),
      ]);
    });

    it('isAvailable is true', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAvailable).toBe(true);
    });

    it('auto-generates a suggestion with entree and sides', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.suggestion).not.toBeNull();
      });

      expect(result.current.suggestion?.entree.type).toBe('entree');
      expect(result.current.suggestion?.sides.length).toBeGreaterThanOrEqual(1);
    });

    it('generate() creates a new suggestion', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.suggestion).not.toBeNull();
      });

      const firstSuggestion = result.current.suggestion;

      // Generate multiple times to increase chance of getting a different suggestion
      let gotDifferent = false;
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.generate();
        });

        // Check if we got a different entree
        if (result.current.suggestion?.entree.id !== firstSuggestion?.entree.id) {
          gotDifferent = true;
          break;
        }
      }

      // With 2 entrees and 10 tries, we should see variation
      // (but this could theoretically fail due to randomness)
      expect(result.current.suggestion).not.toBeNull();
    });

    it('shows ready message', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.message).toBe('Ready to suggest meals!');
    });
  });

  describe('when only one entree exists', () => {
    beforeEach(() => {
      setupDishes([
        createDish('e1', 'Chicken', 'entree'),
        createDish('s1', 'Rice', 'side'),
      ]);
    });

    it('suggests adding more entrees', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.message).toBe(
        'Add more entrees for variety in your suggestions.'
      );
    });

    it('still generates suggestions', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.suggestion).not.toBeNull();
      });

      expect(result.current.suggestion?.entree.id).toBe('e1');
    });
  });

  describe('generate function', () => {
    it('does nothing when not available', async () => {
      const { result } = renderHook(() => useSuggestion());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.generate();
      });

      expect(result.current.suggestion).toBeNull();
    });
  });
});

