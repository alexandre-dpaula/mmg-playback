-- Add original_tom column to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS original_tom TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tracks_original_tom ON tracks(original_tom);

-- Update existing records: set original_tom = tom where original_tom is null
UPDATE tracks
SET original_tom = COALESCE(tom, 'D')
WHERE original_tom IS NULL;

-- Add comment
COMMENT ON COLUMN tracks.original_tom IS 'Tom original da cifra quando foi importada (usado como base para transposição)';
