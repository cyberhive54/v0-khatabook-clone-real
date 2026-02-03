-- Create a table for fake authentication
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default user
INSERT INTO auth_users (username, password)
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS (though for fake auth we might not strictly need it, it's good practice)
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Allow reading from this table for authentication purposes (simulated)
CREATE POLICY "Allow public read for auth_users" ON auth_users FOR SELECT USING (true);
