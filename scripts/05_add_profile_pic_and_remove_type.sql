-- Add profile_pic column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_pic TEXT;

-- Remove type column constraint (making it optional for backward compatibility)
-- Note: Type column is kept in DB but will be ignored in UI
