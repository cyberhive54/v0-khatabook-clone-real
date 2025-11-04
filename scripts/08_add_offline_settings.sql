-- Add offline and network check settings to the settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS live_network_check BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS offline_mode BOOLEAN DEFAULT false;
