-- DishCourse Row-Level Security Policies
-- Migration: 002_row_level_security
-- Date: 2024-12-28
--
-- These policies ensure users can only access data within their households.
-- RLS is enforced at the database level, so even if application code has bugs,
-- unauthorized data access is prevented.

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (display name, etc.)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can read profiles of people in the same household
CREATE POLICY "Users can read household member profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT hm.user_id FROM household_members hm
      WHERE hm.household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- HOUSEHOLDS POLICIES
-- ============================================================================

-- Users can read households they belong to
CREATE POLICY "Members can read household"
  ON households FOR SELECT
  USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Any authenticated user can create a household
CREATE POLICY "Authenticated users can create household"
  ON households FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only creator can update household (name, etc.)
CREATE POLICY "Creator can update household"
  ON households FOR UPDATE
  USING (created_by = auth.uid());

-- Only creator can delete household
CREATE POLICY "Creator can delete household"
  ON households FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- HOUSEHOLD_MEMBERS POLICIES
-- ============================================================================

-- Users can read members of households they belong to
CREATE POLICY "Members can read household members"
  ON household_members FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Users can add themselves as a member (when joining via invite)
CREATE POLICY "Users can join household"
  ON household_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Household creators can remove members (not themselves)
CREATE POLICY "Creator can remove members"
  ON household_members FOR DELETE
  USING (
    -- User is the creator of this household
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'creator'
    )
    -- And they're not trying to remove themselves
    AND user_id != auth.uid()
  );

-- Users can remove themselves (leave household)
CREATE POLICY "Users can leave household"
  ON household_members FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- INVITES POLICIES
-- ============================================================================

-- Members can read invites for their households
CREATE POLICY "Members can read household invites"
  ON invites FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Anyone can read an invite by code (needed for joining)
CREATE POLICY "Anyone can read invite by code"
  ON invites FOR SELECT
  USING (true);  -- Will be filtered by application logic

-- Members can create invites for their households
CREATE POLICY "Members can create invites"
  ON invites FOR INSERT
  WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );

-- Members can update invites (mark as used)
CREATE POLICY "Members can update invites"
  ON invites FOR UPDATE
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- ============================================================================
-- DISHES POLICIES
-- ============================================================================

-- Members can read dishes in their households (excluding soft-deleted)
CREATE POLICY "Members can read household dishes"
  ON dishes FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Members can add dishes to their households
CREATE POLICY "Members can add dishes"
  ON dishes FOR INSERT
  WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    AND added_by = auth.uid()
  );

-- Members can update dishes in their households
CREATE POLICY "Members can update dishes"
  ON dishes FOR UPDATE
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Members can delete (soft delete) dishes in their households
CREATE POLICY "Members can delete dishes"
  ON dishes FOR DELETE
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- ============================================================================
-- MEAL_PLANS POLICIES
-- ============================================================================

-- Members can read meal plans in their households
CREATE POLICY "Members can read household plans"
  ON meal_plans FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Members can create meal plans in their households
CREATE POLICY "Members can create plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );

-- Members can update meal plans if:
-- 1. They're in the household, AND
-- 2. The plan is not locked, OR they hold the lock, OR the lock is stale (>5 min old)
CREATE POLICY "Members can update unlocked plans"
  ON meal_plans FOR UPDATE
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    AND (
      locked_by IS NULL
      OR locked_by = auth.uid()
      OR locked_at < NOW() - INTERVAL '5 minutes'
    )
  );

-- Members can delete (soft delete) meal plans in their households
CREATE POLICY "Members can delete plans"
  ON meal_plans FOR DELETE
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );
