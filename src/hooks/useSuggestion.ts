/**
 * useSuggestion Hook
 *
 * Provides React components with meal suggestion functionality.
 * Combines the useDishes hook with the suggestion service to generate
 * and manage meal suggestions.
 *
 * @example
 * ```tsx
 * function SuggestionView() {
 *   const { suggestion, generate, isAvailable, message } = useSuggestion();
 *
 *   if (!isAvailable) {
 *     return <p>{message}</p>;
 *   }
 *
 *   return (
 *     <div>
 *       {suggestion && <SuggestionCard suggestion={suggestion} />}
 *       <button onClick={generate}>Try Another</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { MealSuggestion } from '@/types';
import { suggest } from '@/services';
import { useDishes } from './useDishes';

/**
 * Return type for the useSuggestion hook.
 */
export interface UseSuggestionReturn {
  /** The current meal suggestion, or null if none generated yet */
  suggestion: MealSuggestion | null;

  /** Generate a new random suggestion */
  generate: () => void;

  /** True if there are enough dishes to generate suggestions */
  isAvailable: boolean;

  /** Helpful message explaining availability status */
  message: string;

  /** True while dishes are still loading from storage */
  isLoading: boolean;
}

/**
 * Hook for generating and managing meal suggestions.
 *
 * Automatically loads dishes and determines if suggestions are possible.
 * Provides helpful messages to guide users when they need more dishes.
 */
export function useSuggestion(): UseSuggestionReturn {
  const { dishes, isLoading } = useDishes();
  const [suggestion, setSuggestion] = useState<MealSuggestion | null>(null);

  /**
   * Count dishes by type for availability checking.
   */
  const dishCounts = useMemo(() => {
    return {
      entrees: dishes.filter((d) => d.type === 'entree').length,
      sides: dishes.filter((d) => d.type === 'side').length,
      total: dishes.length,
    };
  }, [dishes]);

  /**
   * Determine if we can generate suggestions.
   * Need at least one entree.
   */
  const isAvailable = dishCounts.entrees > 0;

  /**
   * Generate a helpful message based on dish availability.
   */
  const message = useMemo(() => {
    if (isLoading) {
      return 'Loading your dishes...';
    }

    if (dishCounts.total === 0) {
      return 'Add some dishes to get meal suggestions!';
    }

    if (dishCounts.entrees === 0) {
      return 'Add an entree to get meal suggestions!';
    }

    if (dishCounts.sides === 0) {
      return 'Looking good! Add some side dishes for better suggestions.';
    }

    if (dishCounts.entrees === 1) {
      return 'Add more entrees for variety in your suggestions.';
    }

    return 'Ready to suggest meals!';
  }, [isLoading, dishCounts]);

  /**
   * Generate a new random meal suggestion.
   */
  const generate = useCallback(() => {
    if (!isAvailable) {
      setSuggestion(null);
      return;
    }

    const newSuggestion = suggest(dishes);
    setSuggestion(newSuggestion);
  }, [dishes, isAvailable]);

  /**
   * Auto-generate first suggestion when dishes become available.
   */
  useEffect(() => {
    if (!isLoading && isAvailable && suggestion === null) {
      generate();
    }
  }, [isLoading, isAvailable, suggestion, generate]);

  return {
    suggestion,
    generate,
    isAvailable,
    message,
    isLoading,
  };
}

