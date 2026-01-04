-- DishCourse RLS Recursion Fix
-- Migration: 003_fix_rls_recursion
-- Date: 2025-01-03
--
-- Fixes infinite recursion in household_members RLS policy.
-- The original policy referenced itself in the USING clause, causing
-- PostgreSQL to loop infinitely when evaluating access.
--
-- Solution: Use a SECURITY DEFINER function to safely check membership,
-- which bypasses RLS when checking household membership.

-- ============================================================================
-- DROP PROBLEMATIC POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Members can read household members" ON household_members;
DROP POLICY IF EXISTS "Users can read household member profiles" ON profiles;

-- ============================================================================
-- CREATE HELPER FUNCTION
-- ============================================================================

-- SECURITY DEFINER function to safely check membership without RLS recursion
CREATE OR REPLACE FUNCTION get_user_household_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM household_members WHERE user_id = p_user_id;
$$;

-- ============================================================================
-- RECREATE POLICIES WITH SAFE FUNCTION
-- ============================================================================

-- Recreate household_members SELECT policy using the safe function
CREATE POLICY "Members can read household members"
  ON household_members FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

-- Recreate profiles SELECT policy for household members
CREATE POLICY "Users can read household member profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (SELECT get_user_household_ids(auth.uid()))
    )
  );
