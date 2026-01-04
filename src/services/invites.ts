/**
 * Invite Service
 *
 * Handles household invite operations: generating codes, validating,
 * and using invites to join households.
 *
 * @example
 * ```typescript
 * // Generate an invite
 * const invite = await generateInvite(householdId, userId);
 *
 * // Validate a code
 * const result = await validateInvite('ABC123');
 * if (result.valid) {
 *   console.log('Joining:', result.household.name);
 * }
 *
 * // Use an invite to join
 * const member = await useInvite('ABC123', userId);
 * ```
 */

import { supabase } from '@/lib/supabase';
import type { Invite, InviteValidation, Household } from '@/types';
import { addMember } from './households';

/**
 * Generates a random 6-character alphanumeric code.
 * Uses uppercase letters and numbers for easy sharing.
 */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars: I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculates the expiry date (7 days from now).
 */
function getExpiryDate(): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry.toISOString();
}

/**
 * Generates a new invite for a household.
 *
 * The invite code is 6 alphanumeric characters and expires in 7 days.
 * Each invite can only be used once.
 *
 * @param householdId - The household to invite to
 * @param createdBy - The user creating the invite
 * @returns The created invite
 * @throws Error if creation fails
 */
export async function generateInvite(
  householdId: string,
  createdBy: string
): Promise<Invite> {
  const code = generateCode();
  const expiresAt = getExpiryDate();

  const { data, error } = await supabase
    .from('invites')
    .insert({
      household_id: householdId,
      code,
      created_by: createdBy,
      expires_at: expiresAt,
    })
    .select('id, household_id, code, created_by, expires_at, used_at, used_by, created_at')
    .single();

  if (error) {
    // If code collision (very rare), try once more with a new code
    if (error.code === '23505') {
      return generateInvite(householdId, createdBy);
    }
    throw new Error('Unable to create invite. Please try again.');
  }

  return {
    id: data.id,
    householdId: data.household_id,
    code: data.code,
    createdBy: data.created_by,
    expiresAt: data.expires_at,
    usedAt: data.used_at ?? undefined,
    usedBy: data.used_by ?? undefined,
    createdAt: data.created_at,
  };
}

/**
 * Fetches an invite by its code.
 *
 * @param code - The 6-character invite code
 * @returns The invite, or null if not found
 */
export async function getInvite(code: string): Promise<Invite | null> {
  const normalizedCode = code.toUpperCase().trim();

  const { data, error } = await supabase
    .from('invites')
    .select('id, household_id, code, created_by, expires_at, used_at, used_by, created_at')
    .eq('code', normalizedCode)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    householdId: data.household_id,
    code: data.code,
    createdBy: data.created_by,
    expiresAt: data.expires_at,
    usedAt: data.used_at ?? undefined,
    usedBy: data.used_by ?? undefined,
    createdAt: data.created_at,
  };
}

/**
 * Validates an invite code.
 *
 * Checks if the invite exists, hasn't expired, and hasn't been used.
 *
 * @param code - The 6-character invite code
 * @returns Validation result with invite and household details if valid
 */
export async function validateInvite(code: string): Promise<InviteValidation> {
  const normalizedCode = code.toUpperCase().trim();

  // Fetch invite with household details
  const { data, error } = await supabase
    .from('invites')
    .select(`
      id,
      household_id,
      code,
      created_by,
      expires_at,
      used_at,
      used_by,
      created_at,
      households:household_id (
        id,
        name,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('code', normalizedCode)
    .single();

  if (error || !data) {
    return { valid: false, reason: 'not_found' };
  }

  // Check if already used
  if (data.used_at) {
    return { valid: false, reason: 'used' };
  }

  // Check if expired
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  if (now > expiresAt) {
    return { valid: false, reason: 'expired' };
  }

  // Build household object from joined data
  const householdData = data.households as unknown as {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  };

  const household: Household = {
    id: householdData.id,
    name: householdData.name,
    createdBy: householdData.created_by,
    createdAt: householdData.created_at,
    updatedAt: householdData.updated_at,
  };

  const invite: Invite = {
    id: data.id,
    householdId: data.household_id,
    code: data.code,
    createdBy: data.created_by,
    expiresAt: data.expires_at,
    usedAt: data.used_at ?? undefined,
    usedBy: data.used_by ?? undefined,
    createdAt: data.created_at,
  };

  return { valid: true, invite, household };
}

/**
 * Uses an invite code to join a household.
 *
 * Validates the invite, adds the user as a member, and marks the invite as used.
 *
 * @param code - The 6-character invite code
 * @param userId - The user joining the household
 * @returns The household that was joined
 * @throws Error if the invite is invalid or joining fails
 */
export async function useInvite(
  code: string,
  userId: string
): Promise<Household> {
  // Validate the invite first
  const validation = await validateInvite(code);

  if (!validation.valid) {
    switch (validation.reason) {
      case 'not_found':
        throw new Error('This invite code is not valid. Please check and try again.');
      case 'used':
        throw new Error('This invite has already been used.');
      case 'expired':
        throw new Error('This invite has expired. Please ask for a new one.');
      default:
        throw new Error('Unable to use invite. Please try again.');
    }
  }

  const { invite, household } = validation;

  // Add the user as a member
  await addMember(household!.id, userId);

  // Mark the invite as used
  await supabase
    .from('invites')
    .update({
      used_at: new Date().toISOString(),
      used_by: userId,
    })
    .eq('id', invite!.id);

  return household!;
}

/**
 * Gets the invite URL for sharing.
 *
 * @param code - The invite code
 * @returns The full URL to join via this invite
 */
export function getInviteUrl(code: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://havedishcourse.vercel.app';
  return `${baseUrl}/join/${code}`;
}

/**
 * Gets a valid (not expired, not used) invite for a household.
 *
 * Useful for showing an existing invite instead of generating a new one.
 *
 * @param householdId - The household ID
 * @returns A valid invite if one exists, null otherwise
 */
export async function getActiveInvite(householdId: string): Promise<Invite | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('invites')
    .select('id, household_id, code, created_by, expires_at, used_at, used_by, created_at')
    .eq('household_id', householdId)
    .is('used_at', null)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    // No active invite exists - this is expected for new households
    return null;
  }

  return {
    id: data.id,
    householdId: data.household_id,
    code: data.code,
    createdBy: data.created_by,
    expiresAt: data.expires_at,
    usedAt: data.used_at ?? undefined,
    usedBy: data.used_by ?? undefined,
    createdAt: data.created_at,
  };
}
