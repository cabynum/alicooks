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

// ============================================================================
// Pairing Preference Tests
// ============================================================================

describe('pairing preference', () => {
  // Helper to create dishes with pairing relationships
  function createDishWithPairings(
    id: string,
    name: string,
    type: 'entree' | 'side' | 'other',
    pairsWellWith: string[] = []
  ): Dish {
    return {
      id,
      name,
      type,
      pairsWellWith,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };
  }

  describe('when entree has defined pairings', () => {
    it('prefers paired sides in suggestions', () => {
      // Create dishes: 1 entree paired with 1 of 3 sides
      const dishes = [
        createDishWithPairings('e1', 'Chicken', 'entree', ['s1']),
        createDishWithPairings('s1', 'Rice', 'side'),
        createDishWithPairings('s2', 'Fries', 'side'),
        createDishWithPairings('s3', 'Salad', 'side'),
      ];

      // Run many times and count how often the paired side is selected
      let pairedCount = 0;
      const runs = 100;

      for (let i = 0; i < runs; i++) {
        const result = suggest(dishes);
        if (result && result.sides.some(s => s.id === 's1')) {
          pairedCount++;
        }
      }

      // With 80% preference for paired sides, should see Rice much more often
      // than random chance (1 in 3 = ~33%). Expect at least 50% to be safe.
      expect(pairedCount).toBeGreaterThan(runs * 0.5);
    });

    it('still occasionally picks non-paired sides for variety', () => {
      // Create dishes: 1 entree paired with only 1 side
      const dishes = [
        createDishWithPairings('e1', 'Chicken', 'entree', ['s1']),
        createDishWithPairings('s1', 'Rice', 'side'),
        createDishWithPairings('s2', 'Fries', 'side'),
        createDishWithPairings('s3', 'Salad', 'side'),
      ];

      // Run many times and check if we ever get non-paired sides
      let nonPairedCount = 0;
      const runs = 100;

      for (let i = 0; i < runs; i++) {
        const result = suggest(dishes);
        if (result && result.sides.some(s => s.id !== 's1')) {
          nonPairedCount++;
        }
      }

      // With 20% chance of random, we should see at least some non-paired
      // This is probabilistic, but 100 runs should show at least a few
      expect(nonPairedCount).toBeGreaterThan(0);
    });

    it('handles multiple paired sides', () => {
      // Create dishes: 1 entree paired with 2 of 4 sides
      const dishes = [
        createDishWithPairings('e1', 'Chicken', 'entree', ['s1', 's2']),
        createDishWithPairings('s1', 'Rice', 'side'),
        createDishWithPairings('s2', 'Salad', 'side'),
        createDishWithPairings('s3', 'Fries', 'side'),
        createDishWithPairings('s4', 'Beans', 'side'),
      ];

      // Run many times and count paired selections
      let pairedCount = 0;
      const runs = 100;

      for (let i = 0; i < runs; i++) {
        const result = suggest(dishes);
        if (result) {
          // Check if all selected sides are from the paired set
          const allPaired = result.sides.every(s => 
            ['s1', 's2'].includes(s.id)
          );
          if (allPaired && result.sides.length > 0) {
            pairedCount++;
          }
        }
      }

      // Should see mostly paired combinations
      expect(pairedCount).toBeGreaterThan(runs * 0.5);
    });
  });

  describe('when entree has no pairings', () => {
    it('falls back to random selection', () => {
      // Create dishes without any pairings
      const dishes = [
        createDishWithPairings('e1', 'Chicken', 'entree'), // No pairsWellWith
        createDishWithPairings('s1', 'Rice', 'side'),
        createDishWithPairings('s2', 'Fries', 'side'),
        createDishWithPairings('s3', 'Salad', 'side'),
      ];

      // Run many times and check distribution
      const sideCounts: Record<string, number> = { s1: 0, s2: 0, s3: 0 };
      const runs = 100;

      for (let i = 0; i < runs; i++) {
        const result = suggest(dishes);
        if (result) {
          result.sides.forEach(s => {
            sideCounts[s.id]++;
          });
        }
      }

      // All sides should get picked at least sometimes (rough distribution)
      expect(sideCounts.s1).toBeGreaterThan(0);
      expect(sideCounts.s2).toBeGreaterThan(0);
      expect(sideCounts.s3).toBeGreaterThan(0);
    });
  });

  describe('when paired sides are not available', () => {
    it('falls back to random when paired sides are missing', () => {
      // Create dishes where pairing references a non-existent side
      const dishes = [
        createDishWithPairings('e1', 'Chicken', 'entree', ['s-nonexistent']),
        createDishWithPairings('s1', 'Rice', 'side'),
        createDishWithPairings('s2', 'Fries', 'side'),
      ];

      // Should still work and pick from available sides
      const result = suggest(dishes);

      expect(result).not.toBeNull();
      expect(result?.sides.length).toBeGreaterThanOrEqual(1);
      expect(['s1', 's2']).toContain(result?.sides[0].id);
    });
  });

  describe('no duplicate sides in meal', () => {
    it('avoids selecting the same side twice', () => {
      // Create dishes with an entree that pairs with one side
      const dishes = [
        createDishWithPairings('e1', 'Chicken', 'entree', ['s1']),
        createDishWithPairings('s1', 'Rice', 'side'),
        createDishWithPairings('s2', 'Fries', 'side'),
      ];

      // Run many times - should never get duplicate sides
      for (let i = 0; i < 50; i++) {
        const result = suggest(dishes);
        if (result && result.sides.length > 1) {
          const sideIds = result.sides.map(s => s.id);
          const uniqueIds = new Set(sideIds);
          expect(uniqueIds.size).toBe(sideIds.length);
        }
      }
    });
  });
});

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

