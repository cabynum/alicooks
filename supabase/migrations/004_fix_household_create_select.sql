-- DishCourse Household Create SELECT Fix
-- Migration: 004_fix_household_create_select
-- Date: 2025-01-04
--
-- Fixes 403 error when creating a household.
-- The problem: INSERT returns the created row via RETURNING, but Supabase
-- also checks the SELECT policy. Since the user isn't a member yet (we add
-- membership AFTER creating the household), the SELECT fails.
--
-- Solution: Add a SELECT policy that allows creators to read their own
-- households immediately (by created_by), not just via membership.

-- ============================================================================
-- ADD CREATOR SELECT POLICY
-- ============================================================================

-- Allow household creators to read their own households
-- This supplements the existing "Members can read household" policy
CREATE POLICY "Creator can read own household"
  ON households FOR SELECT
  USING (created_by = auth.uid());
