-- Create settings table for storing app configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appName TEXT DEFAULT 'Khatabook',
  businessName TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all operations
CREATE POLICY "Allow all operations on settings" 
ON settings FOR ALL USING (true) WITH CHECK (true);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS settings_id_idx ON settings(id);
