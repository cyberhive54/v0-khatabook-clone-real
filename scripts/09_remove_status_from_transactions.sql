-- Remove status column from transactions table
-- The status field is no longer needed in the application
ALTER TABLE transactions DROP COLUMN IF EXISTS status;
