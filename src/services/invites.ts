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

  // Fetch invite (without household join - RLS may block it for non-members)
  const { data: inviteData, error: inviteError } = await supabase
    .from('invites')
    .select('id, household_id, code, created_by, expires_at, used_at, used_by, created_at')
    .eq('code', normalizedCode)
    .single();

  if (inviteError || !inviteData) {
    return { valid: false, reason: 'not_found' };
  }

  // Check if already used
  if (inviteData.used_at) {
    return { valid: false, reason: 'used' };
  }

  // Check if expired
  const now = new Date();
  const expiresAt = new Date(inviteData.expires_at);
  if (now > expiresAt) {
    return { valid: false, reason: 'expired' };
  }

  // Fetch household using SECURITY DEFINER function (bypasses RLS)
  const { data: householdData, error: householdError } = await supabase
    .rpc('get_household_for_invite', { invite_household_id: inviteData.household_id });

  let household: Household;
  
  if (householdError || !householdData) {
    // RPC might not exist yet or failed - use placeholder
    // This is a fallback until the migration is applied
    household = {
      id: inviteData.household_id,
      name: 'A Household', // Placeholder - will be revealed after joining
      createdBy: inviteData.created_by,
      createdAt: inviteData.created_at,
      updatedAt: inviteData.created_at,
    };
  } else {
    // RPC returns JSON object
    const hData = householdData as {
      id: string;
      name: string;
      created_by: string;
      created_at: string;
      updated_at: string;
    };
    household = {
      id: hData.id,
      name: hData.name,
      createdBy: hData.created_by,
      createdAt: hData.created_at,
      updatedAt: hData.updated_at,
    };
  }

  const invite: Invite = {
    id: inviteData.id,
    householdId: inviteData.household_id,
    code: inviteData.code,
    createdBy: inviteData.created_by,
    expiresAt: inviteData.expires_at,
    usedAt: inviteData.used_at ?? undefined,
    usedBy: inviteData.used_by ?? undefined,
    createdAt: inviteData.created_at,
  };

  return { valid: true, invite, household };
}

/**
 * Uses an invite code to join a household.
 *
 * Uses a SECURITY DEFINER function to bypass RLS and allow non-members
 * to add themselves to a household via a valid invite.
 *
 * @param code - The 6-character invite code
 * @param userId - The user joining the household (used for validation)
 * @returns The household that was joined
 * @throws Error if the invite is invalid or joining fails
 */
export async function useInvite(
  code: string,
  // userId is kept for API compatibility but not used - RPC uses auth.uid()
  _userId?: string
): Promise<Household> {
  // Use the RPC function which handles validation, membership, and invite marking
  const { data, error } = await supabase.rpc('join_household_with_invite', {
    invite_code: code,
  });

  if (error) {
    console.error('Join household RPC error:', error);
    throw new Error('Unable to join household. Please try again.');
  }

  // The RPC returns a JSON object with success, error, and household
  const result = data as {
    success: boolean;
    error?: string;
    household?: {
      id: string;
      name: string;
      created_by: string;
      created_at: string;
      updated_at: string;
    };
  };

  if (!result.success) {
    throw new Error(result.error || 'Unable to join household.');
  }

  if (!result.household) {
    throw new Error('Household data not returned.');
  }

  return {
    id: result.household.id,
    name: result.household.name,
    createdBy: result.household.created_by,
    createdAt: result.household.created_at,
    updatedAt: result.household.updated_at,
  };
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
