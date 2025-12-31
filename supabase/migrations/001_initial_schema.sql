-- DishCourse Family Collaboration Schema
-- Migration: 001_initial_schema
-- Date: 2024-12-28
--
-- This migration creates the database schema for household-based collaboration.
-- Run this in your Supabase SQL Editor or via the Supabase CLI.

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Role within a household (creator has removal rights)
CREATE TYPE member_role AS ENUM ('creator', 'member');

-- Dish categories
CREATE TYPE dish_type AS ENUM ('entree', 'side', 'other');

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- User profiles, auto-created when someone signs up via Supabase Auth.
-- The id matches auth.users.id for easy joins.

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email)
  VALUES (
    NEW.id,
    -- Use display_name from metadata if provided, otherwise use email prefix
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- HOUSEHOLDS TABLE
-- ============================================================================
-- A household is a group that shares dishes and meal plans.

CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HOUSEHOLD_MEMBERS TABLE
-- ============================================================================
-- Join table linking users to households. Users can belong to multiple households.

CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  -- A user can only be in a household once
  UNIQUE(household_id, user_id)
);

-- Indexes for efficient lookups
CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_household_members_household ON household_members(household_id);

-- ============================================================================
-- INVITES TABLE
-- ============================================================================
-- Invites allow new members to join a household via link or code.

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_household ON invites(household_id);

-- ============================================================================
-- DISHES TABLE
-- ============================================================================
-- Dishes belong to a household and track who added them.

CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type dish_type NOT NULL DEFAULT 'entree',
  cook_time_minutes INTEGER,
  recipe_url TEXT,
  added_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft delete for sync
);

-- Indexes for efficient lookups
CREATE INDEX idx_dishes_household ON dishes(household_id);
CREATE INDEX idx_dishes_added_by ON dishes(added_by);
-- Index for filtering out deleted dishes
CREATE INDEX idx_dishes_active ON dishes(household_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- MEAL_PLANS TABLE
-- ============================================================================
-- Meal plans belong to a household with locking for concurrent edit prevention.

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT,
  start_date DATE NOT NULL,
  -- Days stored as JSONB array: [{ date: "2024-12-16", dishIds: ["uuid", "uuid"], assignedBy: "uuid" }]
  days JSONB NOT NULL DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES profiles(id),
  -- Locking fields for concurrent edit prevention
  locked_by UUID REFERENCES profiles(id),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft delete for sync
);

-- Indexes for efficient lookups
CREATE INDEX idx_meal_plans_household ON meal_plans(household_id);
-- Partial index for active locks only
CREATE INDEX idx_meal_plans_locked ON meal_plans(locked_by) WHERE locked_by IS NOT NULL;
-- Index for filtering out deleted plans
CREATE INDEX idx_meal_plans_active ON meal_plans(household_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
-- Automatically update the updated_at column on any row update.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if a user is a member of a household
CREATE OR REPLACE FUNCTION is_household_member(p_household_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = p_household_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a user is the creator of a household
CREATE OR REPLACE FUNCTION is_household_creator(p_household_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = p_household_id AND user_id = p_user_id AND role = 'creator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate a random invite code (6 uppercase alphanumeric characters)
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- Removed confusing chars: I, O, 0, 1
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
