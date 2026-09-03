# Supabase Keep-Alive System Setup

## Overview
This system automatically pings your Supabase database every 5 days to prevent the free tier from pausing due to inactivity. A record is inserted into the `keep_alive_pings` table, maintaining database activity.

## Architecture

### 1. **SQL Migration** (`scripts/10_create_keep_alive_table.sql`)
- Creates `keep_alive_pings` table with automatic timestamps
- Includes indexes on `ping_timestamp` and `created_at` for performance
- Can be manually run or auto-executed during deployment

### 2. **API Endpoint** (`app/api/cron/keep-alive/route.ts`)
- POST endpoint at `/api/cron/keep-alive`
- Requires `CRON_SECRET` header for security
- Inserts a ping record into the database
- Logs success/failure for monitoring

### 3. **Vercel Cron Configuration** (`vercel.json`)
- Runs every 5 days at midnight UTC: `0 0 */5 * * ` (cron syntax)
- Automatically triggers the keep-alive endpoint
- Vercel handles authentication automatically

## Setup Instructions

### Step 1: Run the SQL Migration
Execute the SQL migration to create the `keep_alive_pings` table:

```sql
-- Run in Supabase SQL Editor
-- From: scripts/10_create_keep_alive_table.sql
```

### Step 2: Set Environment Variable
Add `CRON_SECRET` to your Vercel project:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** Generate a random secret (e.g., `your-secret-key-here`)
   - **Environments:** Select all (Production, Preview, Development)

**Example secret generation:**
```bash
openssl rand -base64 32
# Output: YourRandomSecret123...
```

### Step 3: Add Service Role Key (Optional but Recommended)
For better security, use the Supabase service role key:

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **API**
2. Copy the **Service Role Key** (secret key with elevated permissions)
3. Add to Vercel:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Your service role key
   - **Environments:** Production (use anon key for Preview/Development)

### Step 4: Deploy
Commit and push your changes. Vercel will:
1. Detect the cron configuration in `vercel.json`
2. Deploy the endpoint
3. Schedule the cron job to run every 5 days

## Cron Schedule Explanation

- **Schedule:** `0 0 */5 * *`
- **Meaning:** At 00:00 UTC, every 5 days
- **Examples:**
  - Day 1 (initial): Runs
  - Day 6: Runs
  - Day 11: Runs
  - Day 16: Runs
  - etc.

## Monitoring

### Check Recent Pings
Query the keep-alive pings in Supabase:

```sql
-- View recent keep-alive pings
SELECT * FROM keep_alive_pings 
ORDER BY created_at DESC 
LIMIT 20;

-- Check if database has been active recently
SELECT COUNT(*) as total_pings FROM keep_alive_pings 
WHERE created_at > NOW() - INTERVAL '30 days';

-- View ping frequency
SELECT 
  DATE(created_at) as ping_date,
  COUNT(*) as ping_count
FROM keep_alive_pings
GROUP BY DATE(created_at)
ORDER BY ping_date DESC;
```

### View Cron Logs
1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on latest deployment
3. Go to **Logs** tab → **Cron**

## Important Notes

⚠️ **Free Tier Database Pause:**
- Supabase pauses free tier databases after 7 days of inactivity
- This system keeps your database active by pinging it every 5 days
- Keeps your database running 24/7

✅ **Benefits:**
- No manual intervention needed
- Automatic and reliable
- Minimal database load (single record insert)
- Easy to monitor and verify

📝 **Customization:**
To change the ping frequency, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 0 */3 * *"  // Change to every 3 days
    }
  ]
}
```

## Troubleshooting

### Cron not running?
- Check `CRON_SECRET` is set in Vercel environment variables
- Verify endpoint is deployed: `https://your-domain/api/cron/keep-alive`
- Check Vercel Cron Logs for errors

### Keep-alive pings not appearing?
- Ensure `keep_alive_pings` table was created (run SQL migration)
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set (if using)
- Verify Supabase connection is working

### Database still pausing?
- If pings exist but database pauses, you may need to run the migration manually
- Contact Supabase support if issues persist

## API Response Examples

### Success Response (200)
```json
{
  "success": true,
  "message": "Keep-alive ping recorded successfully",
  "recordCount": 1,
  "timestamp": "2026-02-10T00:00:00.000Z"
}
```

### Error Response (500)
```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2026-02-10T00:00:00.000Z"
}
```

### Unauthorized Response (401)
```json
{
  "error": "Unauthorized"
}
```

## Security Considerations

1. **CRON_SECRET:** Vercel automatically validates cron requests, but we add an extra layer
2. **Service Role Key:** Only used server-side, never exposed to client
3. **Public Endpoint:** Even though public, it's protected by the secret header
4. **Database:** Records are minimal and only used for keep-alive purposes

---

**Last Updated:** February 2026
**Status:** ✅ Production Ready
