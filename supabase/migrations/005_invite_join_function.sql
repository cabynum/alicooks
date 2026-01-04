-- ============================================================================
-- MIGRATION 005: Invite Join Function
-- ============================================================================
-- Creates a SECURITY DEFINER function that allows users to join a household
-- via a valid invite code. This bypasses RLS since non-members can't
-- insert themselves into household_members directly.
-- ============================================================================

-- Function to join a household using an invite code
CREATE OR REPLACE FUNCTION join_household_with_invite(invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_household RECORD;
  v_user_id UUID;
  v_existing_member RECORD;
  v_new_member RECORD;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You must be signed in to join a household.'
    );
  END IF;

  -- Find and validate the invite
  SELECT * INTO v_invite
  FROM invites
  WHERE code = UPPER(TRIM(invite_code))
  LIMIT 1;

  IF v_invite IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invite code is not valid.'
    );
  END IF;

  IF v_invite.used_at IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invite has already been used.'
    );
  END IF;

  IF v_invite.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invite has expired.'
    );
  END IF;

  -- Check if user is already a member
  SELECT * INTO v_existing_member
  FROM household_members
  WHERE household_id = v_invite.household_id
    AND user_id = v_user_id;

  IF v_existing_member IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You are already a member of this household.'
    );
  END IF;

  -- Get household details
  SELECT * INTO v_household
  FROM households
  WHERE id = v_invite.household_id;

  IF v_household IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Household not found.'
    );
  END IF;

  -- Add the user as a member
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (v_invite.household_id, v_user_id, 'member')
  RETURNING * INTO v_new_member;

  -- Mark the invite as used
  UPDATE invites
  SET used_at = NOW(), used_by = v_user_id
  WHERE id = v_invite.id;

  -- Return success with household details
  RETURN json_build_object(
    'success', true,
    'household', json_build_object(
      'id', v_household.id,
      'name', v_household.name,
      'created_by', v_household.created_by,
      'created_at', v_household.created_at,
      'updated_at', v_household.updated_at
    ),
    'member', json_build_object(
      'id', v_new_member.id,
      'household_id', v_new_member.household_id,
      'user_id', v_new_member.user_id,
      'role', v_new_member.role,
      'joined_at', v_new_member.joined_at
    )
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION join_household_with_invite(TEXT) TO authenticated;

-- Also create a function to get household info for an invite
-- This allows non-members to see the household name before joining
CREATE OR REPLACE FUNCTION get_household_for_invite(invite_household_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_household RECORD;
BEGIN
  SELECT * INTO v_household
  FROM households
  WHERE id = invite_household_id;

  IF v_household IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'id', v_household.id,
    'name', v_household.name,
    'created_by', v_household.created_by,
    'created_at', v_household.created_at,
    'updated_at', v_household.updated_at
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_household_for_invite(UUID) TO authenticated;
