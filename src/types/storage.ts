/**
 * Storage Types
 *
 * Constants and types for localStorage persistence.
 */

/**
 * Keys used in localStorage for persisting app data.
 * Using a prefix ensures we don't conflict with other apps.
 */
export const STORAGE_KEYS = {
  /** Array of Dish objects */
  dishes: 'dishcourse_dishes',

  /** Array of MealPlan objects */
  plans: 'dishcourse_plans',

  /** Schema version number (for future migrations) */
  version: 'dishcourse_version',
} as const;

/**
 * Current schema version.
 * Increment this when making breaking changes to data structure.
 */
export const SCHEMA_VERSION = 1;

/**
 * Format for exported data (for portability per Constitution principle IV).
 */
export interface ExportData {
  /** ISO 8601 timestamp when the export was created */
  exportedAt: string;

  /** Schema version of the exported data */
  version: number;

  /** All user dishes */
  dishes: import('./dish').Dish[];

  /** All user meal plans */
  plans: import('./plan').MealPlan[];

  /** Household info (synced mode only) */
  household?: {
    id: string;
    name: string;
  };
}

