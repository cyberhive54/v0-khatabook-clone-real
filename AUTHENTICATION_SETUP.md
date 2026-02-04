# Khatabook Multi-User Authentication Setup Guide

This document provides complete instructions for implementing multi-user authentication and data isolation in Khatabook.

## Overview

The Khatabook app has been updated to support:
- Multi-user authentication with Supabase Auth
- Email/Password login and signup
- Password reset via email
- Row-Level Security (RLS) policies for data isolation
- Protected routes and middleware
- User profile management

## Architecture

### Database Changes

All tables now include a `user_id` column that references `auth.users(id)`:
- `contacts` - user_id column added
- `transactions` - user_id column added
- `accounts` - user_id column added
- `settings` - user_id column added
- `audit_logs` - new table for tracking user actions (optional)

### RLS Policies

Each table has secure Row-Level Security policies that:
- Allow users to only VIEW their own data
- Allow users to only INSERT their own data
- Allow users to only UPDATE their own data
- Allow users to only DELETE their own data

### Authentication Flow

1. **Signup**: Users create an account with email/password
2. **Email Verification**: Optional - currently skipped for immediate access
3. **Login**: Users authenticate with credentials
4. **Session Management**: Supabase handles token-based sessions
5. **Password Reset**: Users can reset forgotten passwords via email
6. **Logout**: Users can sign out from settings

## Step 1: Run SQL Migrations

You need to run the SQL migration script to add user_id columns and RLS policies:

**File**: `scripts/02_add_auth.sql`

**How to run:**

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `scripts/02_add_auth.sql`
5. Click "Run" to execute
6. Verify success (no errors should appear)

**What this does:**
- Adds `user_id` columns to all data tables
- Creates indexes for better query performance
- Drops old permissive RLS policies
- Creates strict RLS policies for data isolation
- Creates audit_logs table for tracking changes

## Step 2: Environment Variables

Ensure your Supabase environment variables are set in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

These should already be configured from your Supabase integration.

## Step 3: File Structure

New files added for authentication:

```
lib/auth/
├── types.ts              # Type definitions for auth
└── auth-service.ts       # Auth service methods

hooks/
└── use-auth.ts          # React hook for authentication

components/
├── auth-provider.tsx     # Auth provider component
└── user-profile-section.tsx  # User profile & settings UI

app/auth/
├── login/page.tsx        # Login page
├── signup/page.tsx       # Signup page
├── forgot-password/page.tsx  # Forgot password page
└── reset-password/page.tsx   # Password reset page

middleware.ts            # Route protection middleware
```

## Step 4: Route Protection

### Public Routes (No auth required)
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/forgot-password` - Forgot password page
- `/auth/reset-password` - Reset password page

### Protected Routes (Auth required)
- `/` - Dashboard
- `/contacts` - Contacts management
- `/transactions` - Transactions
- `/ledger` - Ledger view
- `/reports` - Reports
- `/settings` - Settings

The middleware in `middleware.ts` automatically:
- Redirects unauthenticated users to `/auth/login`
- Redirects authenticated users away from auth pages (to `/`)

## Step 5: User Data Isolation

### Automatic Isolation

When users perform operations through the app:
1. RLS policies automatically filter data by current user
2. Users cannot access other users' data even if they try to query it directly
3. Insert operations automatically include user_id (handled by Supabase)

### Data Hooks

Data fetching hooks have been updated:
- `useContacts()` - Fetches only current user's contacts
- `useTransactions()` - Fetches only current user's transactions
- `useSettings()` - Fetches only current user's settings

## Step 6: User Management Features

### Login
**File**: `app/auth/login/page.tsx`
- Email and password login
- "Forgot password?" link
- Sign up link
- Error handling

### Signup
**File**: `app/auth/signup/page.tsx`
- Full name, email, password input
- Password confirmation with visual validation
- Error handling
- Redirects to login on success

### Password Reset Flow
1. User clicks "Forgot password?" on login page
2. Enters email on `/auth/forgot-password`
3. Receives email with reset link
4. Clicks link (goes to `/auth/reset-password`)
5. Sets new password
6. Redirected to login

### User Profile & Security
**File**: `app/settings/page.tsx` (new tab: "Profile & Security")
- View full name and email
- View account creation date
- Change password
- Sign out

## Testing the Implementation

### Test User Flow

1. **Signup Test**
   - Go to `/auth/signup`
   - Fill in details and create account
   - Should redirect to login with message

2. **Login Test**
   - Use credentials from signup
   - Should redirect to dashboard

3. **Data Isolation Test**
   - Create contact as User A
   - Logout and login as User B
   - User B should NOT see User A's contacts
   - (Note: This requires multiple test accounts)

4. **Password Reset Test**
   - Go to `/auth/forgot-password`
   - Enter email
   - Check email for reset link
   - Click link and set new password
   - Login with new password

5. **Protected Routes Test**
   - Logout
   - Try to access `/` (should redirect to login)
   - Try to access `/contacts` (should redirect to login)
   - Manually set auth cookie to invalid value - routes should fail gracefully

## Troubleshooting

### "User not authenticated" error

**Cause**: Middleware couldn't verify user session
**Solution**: 
- Check Supabase environment variables are correct
- Check browser cookies (should have `sb-*` cookies)
- Try clearing cookies and logging in again

### "Row-level security" error

**Cause**: RLS policies not properly applied
**Solution**:
- Verify `scripts/02_add_auth.sql` ran successfully
- Check Supabase dashboard for RLS policies on tables
- Ensure user_id column exists on all data tables

### "Email not found" when resetting password

**Cause**: Email setup not configured in Supabase
**Solution**:
- Go to Supabase dashboard
- Navigate to Email Templates
- Configure SMTP or use Supabase's default email service
- Test email sending with a test account

### Data appears to disappear after login

**Cause**: Old data doesn't have user_id set
**Solution**:
- This is expected - old data won't be accessible due to RLS
- Either migrate old data or accept data reset
- New data will be properly isolated

## Migration from Single-User to Multi-User

If you had existing data:

### Option A: Keep existing data (Recommended for development)
Run this additional SQL after the main migration:

```sql
-- Update all existing records to belong to a specific user
-- Replace 'your-user-id' with the actual user ID
UPDATE contacts SET user_id = 'your-user-id' WHERE user_id IS NULL;
UPDATE transactions SET user_id = 'your-user-id' WHERE user_id IS NULL;
UPDATE accounts SET user_id = 'your-user-id' WHERE user_id IS NULL;
UPDATE settings SET user_id = 'your-user-id' WHERE user_id IS NULL;
```

### Option B: Fresh start (Recommended for production)
Simply clear all old data - new data will be properly isolated:

```sql
DELETE FROM transactions WHERE user_id IS NULL;
DELETE FROM contacts WHERE user_id IS NULL;
DELETE FROM accounts WHERE user_id IS NULL;
```

## Security Best Practices

1. **Never share sessions**: Each user has their own session token
2. **HTTPS only**: Always use HTTPS (Vercel handles this)
3. **Secure passwords**: Passwords are hashed by Supabase using bcrypt
4. **RLS enforcement**: Database-level security, not just client-side
5. **Audit logs**: All user actions can be tracked (audit_logs table)

## Advanced Features

### Audit Logging
The `audit_logs` table records all data changes:
- Who made the change
- When they made it
- What operation (INSERT, UPDATE, DELETE)
- Old and new values

### Session Management
Supabase automatically manages:
- Token refresh
- Session expiration
- Device management (optional)

### Multi-Device Support
Users can:
- Login on multiple devices
- Logout from settings (affects all devices)
- See active sessions (custom feature - not yet implemented)

## What's Next?

### Recommended Enhancements

1. **Team/Business Management**
   - Allow users to manage multiple businesses
   - Invite team members to collaborate
   - Role-based access control

2. **API Keys**
   - Generate API keys for mobile/desktop apps
   - Rate limiting per API key
   - Usage tracking

3. **OAuth Integration**
   - Google login
   - GitHub login
   - Apple login

4. **Advanced Security**
   - Two-factor authentication
   - IP whitelist/blacklist
   - Device fingerprinting

5. **Data Export**
   - CSV export of contacts/transactions
   - PDF reports
   - Bulk import

## Support & Questions

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Next.js authentication examples: https://nextjs.org/examples

## Deployment Checklist

Before deploying to production:

- [ ] Run SQL migrations on production database
- [ ] Verify environment variables are set
- [ ] Test signup/login/reset password flow
- [ ] Test data isolation with multiple accounts
- [ ] Enable email verification (currently disabled)
- [ ] Set up email service for password resets
- [ ] Review RLS policies are correctly applied
- [ ] Backup database before migration
- [ ] Test on staging environment first
- [ ] Monitor for errors after deployment

---

**Last Updated**: 2024
**Supabase Version**: Latest
**Next.js Version**: 16
