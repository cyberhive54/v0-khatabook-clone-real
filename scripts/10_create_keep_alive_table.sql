-- Create keep_alive_pings table to prevent Supabase free tier database pause
-- This table stores automatic ping records to keep the database active
CREATE TABLE IF NOT EXISTS keep_alive_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ping_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cron_job_name TEXT DEFAULT 'vercel-cron',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on ping_timestamp for faster queries
CREATE INDEX IF NOT EXISTS keep_alive_pings_timestamp_idx ON keep_alive_pings(ping_timestamp);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS keep_alive_pings_created_at_idx ON keep_alive_pings(created_at);

-- Add comment explaining the table purpose
COMMENT ON TABLE keep_alive_pings IS 'Automatically generated pings to keep Supabase free tier database from pausing due to inactivity';
