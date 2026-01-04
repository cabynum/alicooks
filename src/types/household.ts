/**
 * Household Types
 *
 * Type definitions for households, members, and invites.
 * These map to the Supabase public.households, public.household_members,
 * and public.invites tables.
 */

/**
 * A household - a group of users who share dishes and meal plans.
 *
 * Maps to the public.households table.
 */
export interface Household {
  /** Unique identifier */
  id: string;
  /** User-provided name (e.g., "Smith Family") */
  name: string;
  /** Profile ID of the user who created this household */
  createdBy: string;
  /** When the household was created */
  createdAt: string;
  /** When the household was last updated */
  updatedAt: string;
}

/**
 * Input for creating a new household.
 */
export interface CreateHouseholdInput {
  /** Name for the household */
  name: string;
}

/**
 * Input for updating a household.
 */
export interface UpdateHouseholdInput {
  /** New name for the household */
  name?: string;
}

/**
 * The role a member has in a household.
 */
export type MemberRole = 'creator' | 'member';

/**
 * A household member - links a user to a household.
 *
 * Maps to the public.household_members table.
 */
export interface HouseholdMember {
  /** Unique identifier */
  id: string;
  /** The household this membership belongs to */
  householdId: string;
  /** The user's profile ID */
  userId: string;
  /** Role in the household */
  role: MemberRole;
  /** When the user joined this household */
  joinedAt: string;
}

/**
 * A household member with their profile included.
 * Used when displaying member lists.
 */
export interface HouseholdMemberWithProfile extends HouseholdMember {
  /** The member's profile information */
  profile: {
    id: string;
    displayName: string;
    email: string;
  };
}

/**
 * An invite to join a household.
 *
 * Maps to the public.invites table.
 */
export interface Invite {
  /** Unique identifier */
  id: string;
  /** The household being invited to */
  householdId: string;
  /** 6-character alphanumeric code */
  code: string;
  /** Profile ID of the user who created the invite */
  createdBy: string;
  /** When the invite expires (7 days from creation) */
  expiresAt: string;
  /** When the invite was used (null if not yet used) */
  usedAt?: string;
  /** Profile ID of the user who used the invite */
  usedBy?: string;
  /** When the invite was created */
  createdAt: string;
}

/**
 * Result of validating an invite code.
 */
export interface InviteValidation {
  /** Whether the invite is valid */
  valid: boolean;
  /** Reason for invalidity (if invalid) */
  reason?: 'expired' | 'used' | 'not_found';
  /** The invite details (if valid) */
  invite?: Invite;
  /** The household being invited to (if valid) */
  household?: Household;
}

/**
 * Household context for the app - tracks which household is active.
 */
export interface HouseholdState {
  /** All households the user belongs to */
  households: Household[];
  /** The currently active household */
  currentHousehold: Household | null;
  /** Members of the current household */
  members: HouseholdMemberWithProfile[];
  /** True while loading household data */
  isLoading: boolean;
  /** Whether the current user is the creator of the current household */
  isCreator: boolean;
}
