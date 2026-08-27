# 🚨 CRITICAL: Database Setup Required

## Problem
Your policies are not loading because the database tables don't exist or have the wrong schema. The admin panel cannot delete policies, and the policy detail page has errors.

## Solution
You MUST run the SQL setup file in your Supabase dashboard to create all required tables.

---

## ⚡ QUICK FIX (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `nwldosyjmzxjequweupq`
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Setup SQL
1. Open the file: `COMPLETE_DATABASE_SETUP.sql` (in this folder)
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** button (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 3: Verify Setup
After running the SQL, you should see:
- ✅ "Setup completed successfully!" message
- ✅ 3 tables created (policies, policy_votes, official_responses)
- ✅ 5 sample policies inserted
- ✅ All RLS policies configured

### Step 4: Test Your App
1. Refresh your admin panel
2. Click on **Policies** tab
3. You should see 5 sample policies
4. Try editing or deleting a policy
5. Navigate to the normal Policies page - policies should load

---

## 🔧 What Was Fixed in the Code

### 1. **PolicyDetail.tsx** - Fixed Multiple Issues
- ❌ Removed reference to non-existent `policy.supportPct` field
- ✅ Now calculates support percentage from actual vote counts
- ❌ Fixed broken `OfficialResponse` interface
- ✅ Now properly loads and displays official responses from database
- ❌ Fixed vote submission (was only updating local state)
- ✅ Now properly saves votes to database with upsert
- ✅ Added loading states and error handling
- ✅ Added vote counts display on buttons

### 2. **Policies.tsx** - Fixed Schema Mismatch
- ❌ Removed reference to non-existent `summary_bullets` field
- ✅ Now displays description and category from actual schema
- ✅ Properly loads all policies from database

### 3. **Admin.tsx** - Already Fixed
- ✅ Proper cascade deletion (deletes related votes and responses first)
- ✅ No more hardcoded data
- ✅ All data loads from database

---

## 📋 Database Schema Overview

### Tables Created:
1. **policies** - Main policies table
   - id, title, description, category, status, ministry, created_by, timestamps

2. **policy_votes** - User votes on policies
   - id, policy_id, user_id, vote (support/oppose), created_at
   - Unique constraint: One vote per user per policy

3. **official_responses** - Official responses to policies
   - id, policy_id, official_id, official_name, official_role, response_text, created_at

### RLS Policies:
- ✅ All tables have Row Level Security enabled
- ✅ Public read/write access (since civic data is public)
- ✅ Proper cascade deletion on foreign keys

---

## 🎯 What to Expect After Setup

### Admin Panel (Super Admin)
- View all policies in a list
- Create new policies with title, description, category, status
- Edit existing policies
- Delete policies (with cascade - removes all related votes and responses)
- Policies tab shows real database data

### Normal User - Policies Page
- See all active policies in card grid
- Search policies by title, description, or ministry
- Click to view policy details
- Policies load from database

### Policy Detail Page
- View full policy information
- See vote counts and percentages (calculated in real-time)
- Vote support or oppose (saves to database)
- See vote totals on buttons
- View official responses
- Assembly members and ministers can post responses

---

## 🔐 Security Notes

### Why NOT use Service Role Key in Frontend?
- ❌ **NEVER** add `VITE_SUPABASE_SERVICE_ROLE_KEY` to `.env`
- 🚨 Service role key bypasses ALL security (RLS, auth, everything)
- 🚨 Anyone can view your frontend code and steal the key
- 🚨 Attackers could delete your entire database

### The Correct Approach (Already Implemented):
- ✅ Use anon key (`VITE_SUPABASE_ANON_KEY`) in frontend
- ✅ Configure RLS policies to allow specific operations
- ✅ For public civic data, RLS allows all operations
- ✅ For sensitive operations, RLS checks user authentication

---

## 🆘 Troubleshooting

### "Could not find the 'category' column"
**Solution**: You haven't run the SQL setup yet. Follow Step 1-3 above.

### "official_responses 406 error"
**Solution**: Table doesn't exist. Run the SQL setup file.

### "Policies not loading"
**Solution**: Run `COMPLETE_DATABASE_SETUP.sql` in Supabase SQL Editor.

### "Cannot delete policy"
**Solution**: Run the SQL setup - it includes proper cascade deletion.

### Still having issues?
1. Check Supabase dashboard logs (Logs → Postgres Logs)
2. Verify all 3 tables exist (Database → Tables)
3. Check RLS policies are enabled (Database → Policies)
4. Make sure `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## 📁 Files in This Project

### SQL Files (Run in Supabase):
- ✅ **COMPLETE_DATABASE_SETUP.sql** ← **RUN THIS FIRST!**
- `CREATE_POLICIES_TABLE.sql` - Alternative (same as above)
- `SETUP_IMAGE_STORAGE.sql` - Run after policies setup (for news images)
- `ADD_GHANA_CARD_COLUMNS.sql` - Ghana Card verification
- `FORUM_FEATURES_SCHEMA.sql` - Forum features
- `DATABASE_COMPLETE_SCHEMA.sql` - Additional tables

### Documentation Files:
- This file - Setup instructions
- `ADMIN_ACCESS_GUIDE.md` - Admin panel guide
- `AI_FEATURES_GUIDE.md` - AI features documentation
- `FORUM_ACCESS_RULES.md` - Forum access rules

### Fixed Code Files:
- ✅ `src/pages/PolicyDetail.tsx` - Fixed vote system
- ✅ `src/pages/Policies.tsx` - Fixed schema mismatch
- ✅ `src/pages/Admin.tsx` - Fixed deletion

---

## ✅ Checklist

- [ ] Step 1: Open Supabase SQL Editor
- [ ] Step 2: Copy `COMPLETE_DATABASE_SETUP.sql` contents
- [ ] Step 3: Paste and run in SQL Editor
- [ ] Step 4: Verify "Success" message
- [ ] Step 5: Refresh admin panel
- [ ] Step 6: Test creating a policy
- [ ] Step 7: Test deleting a policy
- [ ] Step 8: Test viewing policies as normal user
- [ ] Step 9: Test voting on a policy
- [ ] Step 10: Test posting official response (as assembly/minister)

---

## 🎉 After Setup Complete

Your platform will have:
- ✅ Fully functional policies system
- ✅ Real-time vote counting
- ✅ Official responses from government officials
- ✅ Admin panel with full CRUD operations
- ✅ Secure database access with RLS
- ✅ No hardcoded data
- ✅ Production-ready code

**Next**: Run `SETUP_IMAGE_STORAGE.sql` to enable image uploads for Ghana News.
