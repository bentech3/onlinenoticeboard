-- Add is_outdated column to notices table
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS is_outdated BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow updating this field (Admins and HODs already have update permissions usually, but let's be sure)
-- Assuming existing update policies cover this.
