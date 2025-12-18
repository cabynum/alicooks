/**
 * Suggestion Service Tests
 *
 * Tests for meal suggestion generation logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { suggest, suggestMany } from '@/services/suggestion';
import type { Dish } from '@/types';

// ============================================================================
// Test Helpers
// ============================================================================

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

// Sample dishes for testing
const sampleDishes: Dish[] = [
  createDish('e1', 'Grilled Chicken', 'entree'),
  createDish('e2', 'Pasta Carbonara', 'entree'),
  createDish('e3', 'Beef Tacos', 'entree'),
  createDish('s1', 'Roasted Vegetables', 'side'),
  createDish('s2', 'Rice', 'side'),
  createDish('s3', 'Mashed Potatoes', 'side'),
  createDish('o1', 'Garlic Bread', 'other'),
];

// ============================================================================
// suggest() Tests
// ============================================================================

describe('suggest', () => {
  describe('when dishes are available', () => {
    it('returns a suggestion with an entree', () => {
      const result = suggest(sampleDishes);

      expect(result).not.toBeNull();
      expect(result?.entree).toBeDefined();
      expect(result?.entree.type).toBe('entree');
    });

    it('includes 1-2 side dishes when sides are available', () => {
      // Run multiple times to check randomness stays within bounds
      for (let i = 0; i < 10; i++) {
        const result = suggest(sampleDishes);

        expect(result).not.toBeNull();
        expect(result?.sides.length).toBeGreaterThanOrEqual(1);
        expect(result?.sides.length).toBeLessThanOrEqual(2);

        // All sides should be of type 'side'
        result?.sides.forEach((side) => {
          expect(side.type).toBe('side');
        });
      }
    });

    it('returns unique sides (no duplicates)', () => {
      // Run multiple times to ensure no duplicates
      for (let i = 0; i < 10; i++) {
        const result = suggest(sampleDishes);

        if (result && result.sides.length > 1) {
          const sideIds = result.sides.map((s) => s.id);
          const uniqueIds = new Set(sideIds);
          expect(uniqueIds.size).toBe(sideIds.length);
        }
      }
    });

    it('picks a valid entree from the dish list', () => {
      const result = suggest(sampleDishes);
      const entreeIds = sampleDishes
        .filter((d) => d.type === 'entree')
        .map((d) => d.id);

      expect(result).not.toBeNull();
      expect(entreeIds).toContain(result?.entree.id);
    });
  });

  describe('edge cases', () => {
    it('returns null when no dishes provided', () => {
      const result = suggest([]);
      expect(result).toBeNull();
    });

    it('returns null when no entrees available', () => {
      const sidesOnly = sampleDishes.filter((d) => d.type !== 'entree');
      const result = suggest(sidesOnly);
      expect(result).toBeNull();
    });

    it('returns suggestion with empty sides when no sides available', () => {
      const entreesOnly = sampleDishes.filter((d) => d.type === 'entree');
      const result = suggest(entreesOnly);

      expect(result).not.toBeNull();
      expect(result?.entree).toBeDefined();
      expect(result?.sides).toEqual([]);
    });

    it('works with only one entree', () => {
      const singleEntree = [createDish('e1', 'Chicken', 'entree')];
      const result = suggest(singleEntree);

      expect(result).not.toBeNull();
      expect(result?.entree.id).toBe('e1');
    });

    it('returns one side when only one side is available', () => {
      const dishes = [
        createDish('e1', 'Chicken', 'entree'),
        createDish('s1', 'Rice', 'side'),
      ];
      const result = suggest(dishes);

      expect(result).not.toBeNull();
      expect(result?.sides.length).toBe(1);
      expect(result?.sides[0].id).toBe('s1');
    });

    it('ignores "other" type dishes', () => {
      const dishes = [
        createDish('e1', 'Chicken', 'entree'),
        createDish('o1', 'Bread', 'other'),
        createDish('o2', 'Dessert', 'other'),
      ];
      const result = suggest(dishes);

      expect(result).not.toBeNull();
      expect(result?.entree.id).toBe('e1');
      expect(result?.sides).toEqual([]);
    });
  });

  describe('randomness', () => {
    it('can return different entrees on multiple calls', () => {
      const entreesSeen = new Set<string>();

      // Run many times to see variety
      for (let i = 0; i < 50; i++) {
        const result = suggest(sampleDishes);
        if (result) {
          entreesSeen.add(result.entree.id);
        }
      }

      // With 3 entrees and 50 tries, we should see at least 2 different ones
      expect(entreesSeen.size).toBeGreaterThan(1);
    });
  });
});

// ============================================================================
// suggestMany() Tests
// ============================================================================

describe('suggestMany', () => {
  describe('when dishes are available', () => {
    it('returns requested number of suggestions when possible', () => {
      const results = suggestMany(sampleDishes, 2);

      expect(results).toHaveLength(2);
      results.forEach((suggestion) => {
        expect(suggestion.entree).toBeDefined();
        expect(suggestion.entree.type).toBe('entree');
      });
    });

    it('returns unique entrees in each suggestion', () => {
      const results = suggestMany(sampleDishes, 3);

      const entreeIds = results.map((r) => r.entree.id);
      const uniqueIds = new Set(entreeIds);

      expect(uniqueIds.size).toBe(entreeIds.length);
    });

    it('caps results at available entree count', () => {
      // We have 3 entrees, ask for 5
      const results = suggestMany(sampleDishes, 5);

      expect(results).toHaveLength(3);
    });

    it('each suggestion has valid sides', () => {
      const results = suggestMany(sampleDishes, 2);

      results.forEach((suggestion) => {
        expect(suggestion.sides.length).toBeLessThanOrEqual(2);
        suggestion.sides.forEach((side) => {
          expect(side.type).toBe('side');
        });
      });
    });
  });

  describe('edge cases', () => {
    it('returns empty array when no dishes provided', () => {
      const results = suggestMany([], 3);
      expect(results).toEqual([]);
    });

    it('returns empty array when no entrees available', () => {
      const sidesOnly = sampleDishes.filter((d) => d.type !== 'entree');
      const results = suggestMany(sidesOnly, 3);
      expect(results).toEqual([]);
    });

    it('returns empty array when count is 0', () => {
      const results = suggestMany(sampleDishes, 0);
      expect(results).toEqual([]);
    });

    it('returns empty array when count is negative', () => {
      const results = suggestMany(sampleDishes, -1);
      expect(results).toEqual([]);
    });

    it('works with single entree asking for multiple', () => {
      const singleEntree = [createDish('e1', 'Chicken', 'entree')];
      const results = suggestMany(singleEntree, 5);

      expect(results).toHaveLength(1);
      expect(results[0].entree.id).toBe('e1');
    });
  });
});

