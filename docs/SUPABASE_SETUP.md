# Supabase Setup Guide for Dodow Amanmuo

This guide will help you set up Supabase as the backend database for your civic engagement platform.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (no credit card required)
3. Click "New Project"
4. Fill in the details:
   - **Name**: Dodow Amanmuo
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to Ghana (e.g., Frankfurt, London)
5. Click "Create new project"
6. Wait 2-3 minutes for your project to be ready

## Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## Step 3: Add Credentials to Your .env File

1. Open your `.env` file in the project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file
4. **Restart your dev server** (`npm run dev`)

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content of `SUPABASE_SETUP.sql`
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. You should see success messages for all tables created

## Step 5: Verify Setup

### Check Tables
1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `users`
   - `policies`
   - `forum_posts`
   - `policy_votes`
   - `official_responses`
   - `forum_replies`

### Check Seed Data
1. Click on the `policies` table
2. You should see 3 policies already inserted
3. Check the `users` table (will be empty until first signup)

## Step 6: Test Your Application

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Sign in with your new account
3. **Create Forum Post**: Go to Forums and create a post
4. **Vote on Policy**: Go to Policies and vote on a policy
5. Check Supabase dashboard to see data being created in real-time!

## Features Now Using Supabase

✅ **User Authentication**
- Sign up, login, logout
- Password hashing (handled by Supabase)
- Session management

✅ **User Profiles**
- Name, email, district, role
- Verification status
- Profile viewing/editing

✅ **Policies**
- Create, read, update policies
- Vote counting
- Public/private status

✅ **Forums**
- National and district-specific posts
- Anonymous posting (shows Citizen_XXXX)
- Reply counts

✅ **Official Responses**
- Ministers/Assembly members can respond
- Linked to specific policies
- Timestamped responses

✅ **Voting System**
- Support/Oppose voting
- One vote per user per policy
- Real-time vote counting

## Database Schema Overview

### Users Table
```sql
- id: UUID (primary key)
- email: TEXT (unique)
- name: TEXT
- password_hash: TEXT
- district: TEXT
- role: TEXT (citizen/assembly/minister)
- verified: BOOLEAN
- created_at: TIMESTAMP
```

### Policies Table
```sql
- id: UUID (primary key)
- title: TEXT
- ministry: TEXT
- bullets: TEXT[] (array)
- status: TEXT
- support_count: INTEGER
- oppose_count: INTEGER
```

### Forum Posts Table
```sql
- id: UUID (primary key)
- scope: TEXT (national/district)
- district: TEXT (optional)
- title: TEXT
- author_id: UUID (foreign key)
- author_name: TEXT (anonymous)
- replies_count: INTEGER
```

## Row Level Security (RLS)

Supabase RLS is enabled to protect your data:

- **Users**: Can view all profiles, update own profile
- **Policies**: Anyone can view, only ministers can create/update
- **Forum Posts**: 
  - National posts visible to all
  - District posts only visible to district residents
- **Votes**: Verified users can vote, one vote per policy
- **Official Responses**: Ministers/Assembly members can create

## Security Best Practices

1. ✅ **Never commit `.env` file** - Already in `.gitignore`
2. ✅ **Use anon key for client** - Public key for frontend
3. ✅ **RLS enabled** - Database-level security
4. ✅ **Password hashing** - Handled by Supabase Auth
5. ✅ **HTTPS only** - Supabase enforces HTTPS

## Troubleshooting

### "Relation does not exist" error
- Run the SQL schema setup again
- Check that all tables were created in Table Editor

### "Cannot read properties of null" error
- Check that Supabase credentials are in `.env`
- Restart dev server after adding credentials
- Verify credentials are correct in Supabase dashboard

### RLS Policy errors
- Make sure user is logged in for protected operations
- Check that user role matches required role
- Verify user is verified for voting/posting

### Slow queries
- Check indexes are created (they're in the SQL setup)
- Monitor query performance in Supabase dashboard
- Use query planner for complex queries

## Production Deployment

When deploying to production:

1. **Environment Variables**
   - Set `VITE_SUPABASE_URL` in your hosting provider
   - Set `VITE_SUPABASE_ANON_KEY` in your hosting provider
   - Never expose service role key to client

2. **Database Backup**
   - Enable automatic backups in Supabase
   - Export data regularly
   - Test restore procedures

3. **Monitoring**
   - Set up alerts for failed queries
   - Monitor database size
   - Track API usage

## Next Steps

- [ ] Test all features with Supabase
- [ ] Set up database backups
- [ ] Configure email authentication (optional)
- [ ] Add more seed data for testing
- [ ] Set up production environment

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: Report bugs in your repo

Happy building! 🇬🇭
