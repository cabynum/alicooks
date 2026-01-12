/**
 * Suggestion Service
 *
 * Generates random meal suggestions by pairing entrees with side dishes.
 * This is the "magic" behind the "What should I make for dinner?" feature.
 */

import type { Dish, MealSuggestion } from '@/types';

// ============================================================================
// Configuration
// ============================================================================

/**
 * How many side dishes to include in a suggestion.
 * Using 1-2 sides creates realistic meal combinations.
 */
const MIN_SIDES = 1;
const MAX_SIDES = 2;

/**
 * Probability of selecting a paired side (if available) vs. random.
 * 0.8 = 80% chance to pick from paired sides, 20% random for variety.
 */
const PAIRING_PREFERENCE = 0.8;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Picks a random item from an array.
 * Returns undefined if the array is empty.
 */
function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

/**
 * Picks N unique random items from an array.
 * Returns fewer items if the array doesn't have enough.
 */
function pickRandomMany<T>(items: T[], count: number): T[] {
  if (items.length === 0 || count <= 0) return [];

  // If we want more than available, return shuffled copy of all items
  if (count >= items.length) {
    return shuffleArray([...items]);
  }

  // Fisher-Yates partial shuffle to pick `count` items
  const copy = [...items];
  const result: T[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * (copy.length - i)) + i;
    // Swap
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
    result.push(copy[i]);
  }

  return result;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Determines how many sides to include based on availability.
 * Randomly picks between MIN_SIDES and MAX_SIDES, capped by what's available.
 */
function determineSideCount(availableSides: number): number {
  const maxPossible = Math.min(availableSides, MAX_SIDES);
  if (maxPossible <= MIN_SIDES) return maxPossible;

  // Random number between MIN_SIDES and maxPossible (inclusive)
  return MIN_SIDES + Math.floor(Math.random() * (maxPossible - MIN_SIDES + 1));
}

/**
 * Picks a side dish with preference for paired sides.
 * 
 * If the entree has defined pairings:
 * - 80% chance to pick from paired sides (if any are available)
 * - 20% chance to pick randomly for variety
 * 
 * Falls back to random selection if no pairings exist.
 * 
 * @param entree - The entree to find pairings for
 * @param allSides - All available side dishes
 * @param excludeIds - IDs of sides already selected (to avoid duplicates)
 * @returns A side dish, or undefined if none available
 */
function pickSideWithPairing(
  entree: Dish,
  allSides: Dish[],
  excludeIds: string[] = []
): Dish | undefined {
  // Filter out already-selected sides
  const availableSides = allSides.filter((s) => !excludeIds.includes(s.id));
  
  if (availableSides.length === 0) return undefined;

  // Get paired sides that are available
  const pairedIds = entree.pairsWellWith ?? [];
  const pairedSides = availableSides.filter((s) => pairedIds.includes(s.id));

  // If we have paired sides and roll under the preference threshold, pick from pairs
  if (pairedSides.length > 0 && Math.random() < PAIRING_PREFERENCE) {
    return pickRandom(pairedSides);
  }

  // Otherwise pick randomly from all available sides
  return pickRandom(availableSides);
}

/**
 * Picks multiple side dishes with preference for paired sides.
 * Ensures no duplicates in the selection.
 * 
 * @param entree - The entree to find pairings for  
 * @param allSides - All available side dishes
 * @param count - How many sides to pick
 * @returns Array of side dishes (may be fewer than requested)
 */
function pickSidesWithPairing(
  entree: Dish,
  allSides: Dish[],
  count: number
): Dish[] {
  const selected: Dish[] = [];
  const excludeIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const side = pickSideWithPairing(entree, allSides, excludeIds);
    if (side) {
      selected.push(side);
      excludeIds.push(side.id);
    } else {
      // No more sides available
      break;
    }
  }

  return selected;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Generates a single meal suggestion from the given dishes.
 *
 * A suggestion pairs one random entree with 1-2 side dishes.
 * Sides are selected with preference for user-defined pairings (80% paired / 20% random).
 * Returns null if there are no entrees available.
 *
 * @param dishes - The user's dish collection
 * @returns A meal suggestion, or null if not enough dishes
 *
 * @example
 * ```ts
 * const suggestion = suggest(myDishes);
 * if (suggestion) {
 *   console.log(`Make ${suggestion.entree.name} with ${suggestion.sides.map(s => s.name).join(' and ')}`);
 * }
 * ```
 */
export function suggest(dishes: Dish[]): MealSuggestion | null {
  // Separate dishes by type
  const entrees = dishes.filter((d) => d.type === 'entree');
  const sides = dishes.filter((d) => d.type === 'side');

  // Must have at least one entree
  if (entrees.length === 0) {
    return null;
  }

  // Pick a random entree
  const entree = pickRandom(entrees);
  if (!entree) return null; // Type guard, shouldn't happen

  // Pick 1-2 sides with preference for paired sides
  const sideCount = determineSideCount(sides.length);
  const selectedSides = pickSidesWithPairing(entree, sides, sideCount);

  return {
    entree,
    sides: selectedSides,
  };
}

/**
 * Generates multiple unique meal suggestions.
 *
 * Each suggestion uses a different entree to provide variety.
 * Sides are selected with preference for user-defined pairings (80% paired / 20% random).
 * Returns fewer suggestions if there aren't enough entrees.
 *
 * @param dishes - The user's dish collection
 * @param count - How many suggestions to generate
 * @returns Array of meal suggestions (may be fewer than requested)
 *
 * @example
 * ```ts
 * const suggestions = suggestMany(myDishes, 3);
 * suggestions.forEach((s, i) => {
 *   console.log(`Option ${i + 1}: ${s.entree.name}`);
 * });
 * ```
 */
export function suggestMany(dishes: Dish[], count: number): MealSuggestion[] {
  if (count <= 0) return [];

  const entrees = dishes.filter((d) => d.type === 'entree');
  const sides = dishes.filter((d) => d.type === 'side');

  if (entrees.length === 0) return [];

  // Pick unique entrees for each suggestion
  const selectedEntrees = pickRandomMany(entrees, count);
  const suggestions: MealSuggestion[] = [];

  for (const entree of selectedEntrees) {
    const sideCount = determineSideCount(sides.length);
    const selectedSides = pickSidesWithPairing(entree, sides, sideCount);

    suggestions.push({
      entree,
      sides: selectedSides,
    });
  }

  return suggestions;
}

