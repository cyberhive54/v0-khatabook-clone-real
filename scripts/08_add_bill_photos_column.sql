-- Add bill_photos column to transactions table if it doesn't exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS bill_photos TEXT[] DEFAULT '{}';

-- Update any existing records to have empty array for bill_photos
UPDATE transactions SET bill_photos = '{}' WHERE bill_photos IS NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_bill_photos ON transactions USING GIN (bill_photos);
