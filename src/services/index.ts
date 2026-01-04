/**
 * Services
 *
 * Central export point for all services used in DishCourse.
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

// Auth service for authentication operations
export {
  signInWithMagicLink,
  signOut,
  getCurrentUser,
  getSession,
  getProfile,
  updateProfile,
  onAuthStateChange,
  refreshSession,
} from './auth';

// Household service for household management
export {
  getHouseholds,
  getHousehold,
  getMembers,
  createHousehold,
  updateHousehold,
  addMember,
  removeMember,
  leaveHousehold,
  isMember,
  getMembership,
} from './households';

// Invite service for household invites
export {
  generateInvite,
  getInvite,
  validateInvite,
  useInvite,
  getInviteUrl,
  getActiveInvite,
} from './invites';
