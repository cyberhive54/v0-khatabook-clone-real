-- Add user_id columns to all tables for multi-user support
-- This migration enables user data isolation

-- 1. Contacts table - add user_id column
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

-- 2. Transactions table - add user_id column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- 3. Accounts table - add user_id column
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- 4. Settings table - ensure proper structure
-- (settings already has user_id, but let's ensure it's correct)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- 5. Drop old non-authenticated policies
DROP POLICY IF EXISTS "Allow all operations on contacts" ON contacts;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all operations on accounts" ON accounts;

-- 6. Create secure RLS policies for contacts table
-- Users can only view their own contacts
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own contacts
CREATE POLICY "Users can create their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own contacts
CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create secure RLS policies for transactions table
-- Users can only view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can create their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Create secure RLS policies for accounts table
-- Users can only view their own accounts
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own accounts
CREATE POLICY "Users can create their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own accounts
CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own accounts
CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- 9. Create secure RLS policies for settings table
-- Users can only view their own settings
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own settings
CREATE POLICY "Users can create their own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete their own settings"
  ON settings FOR DELETE
  USING (auth.uid() = user_id);

-- 10. Verify RLS is enabled on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 11. Create audit log table for tracking user actions (optional but recommended)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- This script is complete and ready to run.
-- After running this, users will be authenticated through Supabase Auth.
