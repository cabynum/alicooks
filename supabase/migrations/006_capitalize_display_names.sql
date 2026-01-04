-- ============================================================================
-- MIGRATION 006: Capitalize Display Names
-- ============================================================================
-- Updates the handle_new_user trigger to capitalize display names when
-- creating profiles from email prefixes.
-- Also updates existing profiles to have properly capitalized names.
-- ============================================================================

-- Update the trigger function to capitalize display names
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email)
  VALUES (
    NEW.id,
    -- Use display_name from metadata if provided, otherwise use email prefix
    -- Capitalize the first letter of each word
    INITCAP(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles to have capitalized display names
UPDATE profiles
SET display_name = INITCAP(display_name)
WHERE display_name IS NOT NULL
  AND display_name != INITCAP(display_name);
