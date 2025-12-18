/**
 * Services
 *
 * Central export point for all services used in AliCooks.
 */

// Storage service for localStorage operations
export {
  // Dishes
  getDishes,
  getDish,
  saveDish,
  updateDish,
  deleteDish,
  // Plans
  getPlans,
  getPlan,
  savePlan,
  updatePlan,
  deletePlan,
  // Export/Import
  exportData,
  importData,
  clearAllData,
} from './storage';

// Suggestion service for meal recommendations
export { suggest, suggestMany } from './suggestion';
