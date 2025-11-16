-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('lider', 'vocal', 'instrumental');

-- Add role column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'vocal';
  END IF;
END $$;

-- Add name column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN name TEXT;
  END IF;
END $$;

-- Add avatar_url column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Update existing users to extract name from email if name is null
UPDATE profiles
SET name = COALESCE(name, split_part(email, '@', 1))
WHERE name IS NULL;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add comment explaining the role hierarchy
COMMENT ON COLUMN profiles.role IS 'User role hierarchy: lider (full access) > vocal (medium access) > instrumental (basic access)';
