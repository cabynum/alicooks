-- Migration: Add pairs_well_with column for Smart Meal Pairing
-- 
-- Allows entrees to define which sides pair well with them.
-- Suggestions will prefer these pairings over random selection.

ALTER TABLE dishes 
ADD COLUMN pairs_well_with UUID[] DEFAULT '{}';

-- Add a comment explaining the column
COMMENT ON COLUMN dishes.pairs_well_with IS 'Array of side dish IDs that pair well with this entree';
