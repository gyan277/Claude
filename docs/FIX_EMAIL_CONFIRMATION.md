# Fix Email Confirmation Issue

The signup/login is failing because Supabase requires email confirmation by default. Here's how to fix it:

## Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Scroll down to **"Confirm email"**
4. **UNCHECK** "Enable email confirmations"
5. Click **Save**

Now users can sign up and login immediately without email confirmation!

## Option 2: Enable Email in Development (For Testing)

If you want to test email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Keep "Enable email confirmations" CHECKED
3. Go to **Authentication** → **Email Templates**
4. You'll see the confirmation email template

**For development**: When a user signs up, check the Supabase logs to see the confirmation link, then manually confirm users in the dashboard.

## Manual User Confirmation

If you already have users that need confirmation:

1. Go to **Authentication** → **Users**
2. Find the user (gyandaniel599@gmail.com)
3. Click on the user
4. Look for **Email Confirmed** status
5. If not confirmed, click the three dots (...) menu
6. Select **"Send recovery email"** or manually confirm

## Quick Fix Right Now:

1. **Delete the existing user** (if needed):
   - Go to Authentication → Users
   - Find gyandaniel599@gmail.com
   - Click the three dots → Delete user
   - Also delete from Table Editor → users table

2. **Disable email confirmation**:
   - Authentication → Providers → Email
   - Uncheck "Enable email confirmations"
   - Save

3. **Try signing up again**
   - Go to /signup
   - Fill in the form
   - Should work instantly now!

## After Fixing

Try these steps:
1. Sign up with a new account
2. You should be logged in automatically
3. No email confirmation needed
4. You can start using the app right away

## For Production

In production, you'll want to:
- ✅ Enable email confirmation
- ✅ Configure proper email templates
- ✅ Set up custom SMTP (optional)
- ✅ Add email verification flow in the UI

But for development and testing, disabling email confirmation makes it much easier!
