# Quick Start: Authentication Setup

## 1. Run SQL Migration (CRITICAL - Do This First!)

You must run this SQL to enable authentication. Without it, the app won't work.

**Steps:**
1. Open your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "+ New query"
4. Copy the entire contents of `scripts/02_add_auth.sql`
5. Paste into the SQL Editor
6. Click "Run" button
7. Wait for execution to complete
8. You should see "success" messages - no errors

**What it does:**
- Adds `user_id` column to contacts, transactions, accounts, settings tables
- Creates strict security policies (RLS)
- Prevents users from seeing each other's data

## 2. Test Authentication

**Test Signup:**
```
1. Go to http://localhost:3000/auth/signup
   (or your app URL if deployed)
2. Fill in:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create account"
4. Should redirect to login with success message
```

**Test Login:**
```
1. Use email and password from signup
2. Click "Sign in"
3. Should redirect to dashboard
4. Try creating a contact
```

**Test Data Isolation:**
```
1. Logout (Settings → Danger Zone → Sign Out)
2. Signup with different email: jane@example.com
3. Login as Jane
4. Jane should NOT see John's contacts (they're hidden)
5. Create a contact as Jane
6. Logout
7. Login as John - John shouldn't see Jane's contact
```

## 3. Environment Variables (Already Set)

These should already be configured:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

If not set, add them in Vercel Dashboard → Settings → Environment Variables

## 4. Features Available Now

After running the SQL:

**Authentication Pages:**
- `/auth/login` - Login page
- `/auth/signup` - Create account
- `/auth/forgot-password` - Password recovery
- `/auth/reset-password` - Reset password from email

**User Management:**
- Settings → Profile & Security tab
- View profile info
- Change password
- Sign out

**Data Isolation:**
- Each user only sees their own contacts
- Each user only sees their own transactions
- Offline sync respects user boundaries

## 5. Troubleshooting

### "Permission denied" when running SQL
**Solution**: Make sure you're logged in as Supabase project owner

### "Table already exists" error
**Solution**: Normal if running twice - script checks with `IF NOT EXISTS`

### Cannot login after migration
**Solution**: 
- Check Supabase auth is enabled
- Verify environment variables
- Check browser console for errors

### Old contacts disappeared
**Solution**: Expected - RLS hides old data without user_id. See migration options in AUTHENTICATION_SETUP.md

### Password reset email not received
**Solution**:
- Check Supabase email settings
- Configure SMTP in Supabase Dashboard
- May take a few seconds to arrive

## 6. Common Commands

**Clear all data (fresh start):**
```sql
DELETE FROM transactions;
DELETE FROM contacts;
DELETE FROM accounts;
DELETE FROM settings;
```

**See user_id columns were added:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'contacts';
```

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'contacts';
```

**Reset user password (admin only):**
```sql
-- In Supabase auth section, click user → Reset password
```

## 7. Next Steps

After basic testing:

1. **Enable Email Verification** (optional)
   - Better security for production
   - Users verify email before accessing app

2. **Set up OAuth** (optional)
   - Google login
   - GitHub login
   - Easier signup for users

3. **Configure Email Service**
   - Use Supabase SMTP or external service
   - Customize password reset emails

4. **Deploy to Production**
   - Run migration on production database
   - Test full flow on staging first
   - Monitor for errors

## 8. Useful Links

- Supabase Dashboard: https://app.supabase.com
- Project Settings: Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Full Docs: See AUTHENTICATION_SETUP.md
- Implementation Details: See IMPLEMENTATION_SUMMARY.md

## 9. Getting Help

**If something isn't working:**

1. Check SQL migration ran successfully (no errors in Supabase)
2. Check Supabase project is active and accessible
3. Check environment variables in Vercel
4. Clear browser cookies and try again
5. Check browser console for JavaScript errors
6. See AUTHENTICATION_SETUP.md troubleshooting section

---

**Status**: Ready to use - Just run the SQL migration!

**Remember**: You MUST run `scripts/02_add_auth.sql` for authentication to work.
