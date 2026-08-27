# 🔧 Fix Admin Policies Issue

## ❌ Problem
You're seeing an error: **"Could not find the 'category' column of 'policies' in the schema cache"**

This means your database `policies` table is missing required columns.

---

## ✅ Solution

### Step 1: Run SQL Fix
1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `COMPLETE_POLICIES_FIX.sql`
5. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify It Worked
After running the SQL, you should see:
- ✅ "Setup complete! Policy table structure:"
- ✅ List of all columns in policies table
- ✅ No errors

### Step 3: Refresh Admin Page
1. Go back to your app
2. Refresh the page (F5)
3. Try creating a policy again
4. It should work now!

---

## 🗄️ What the SQL Does

The `COMPLETE_POLICIES_FIX.sql` file:

1. ✅ Adds missing columns to `policies` table:
   - `category` - Policy category (Education, Health, etc.)
   - `ministry` - Responsible ministry
   - `status` - Policy status (draft, active, archived)
   - `created_by` - Who created it
   - `created_at` - When it was created

2. ✅ Creates related tables:
   - `policy_votes` - For citizen votes
   - `official_responses` - For official responses

3. ✅ Sets up proper foreign keys with CASCADE delete
   - When you delete a policy, votes and responses are deleted too

4. ✅ Configures Row Level Security (RLS) policies
   - Allows all operations for now (super admin access)

5. ✅ Adds database indexes for better performance

---

## 📋 Expected Table Structure

After running the fix, your `policies` table should have:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Policy title |
| description | TEXT | Policy description |
| category | TEXT | Policy category |
| ministry | TEXT | Responsible ministry |
| status | TEXT | draft/active/archived |
| created_by | UUID | User who created it |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

## 🧪 Test It

After fixing:

1. **Create a policy:**
   - Go to Admin Panel → Policies tab
   - Click "Add New Policy"
   - Fill in: Title, Description, Category, Status
   - Click "Create Policy"
   - ✅ Should work!

2. **Edit a policy:**
   - Click edit icon on any policy
   - Change details
   - Click "Update Policy"
   - ✅ Should work!

3. **Delete a policy:**
   - Click trash icon on any policy
   - Confirm deletion
   - ✅ Should work!

---

## ⚠️ If Still Having Issues

### Issue: "Permission denied"
**Solution:** The RLS policies might be too restrictive. Run:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE policy_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE official_responses DISABLE ROW LEVEL SECURITY;
```

### Issue: "Policies not showing"
**Solution:** Check if policies table exists and has data:
```sql
-- Check if table exists
SELECT * FROM policies LIMIT 5;

-- If empty, insert sample data
INSERT INTO policies (title, description, category, status)
VALUES 
('Sample Policy 1', 'This is a test policy', 'Education', 'active'),
('Sample Policy 2', 'Another test policy', 'Health', 'draft');
```

### Issue: "Error loading policies"
**Solution:** Check browser console (F12) for detailed error message, then:
- Verify Supabase connection in `.env` file
- Check Supabase dashboard to see if policies table exists
- Run the `COMPLETE_POLICIES_FIX.sql` again

---

## 🎉 After Fixing

Once fixed, you should be able to:
- ✅ View all policies from database
- ✅ Create new policies
- ✅ Edit existing policies
- ✅ Delete policies (with related data)
- ✅ Search policies
- ✅ Filter by status

---

## 📁 Files to Use

1. **`COMPLETE_POLICIES_FIX.sql`** - Run this in Supabase SQL Editor
2. **`FIX_POLICY_DELETE.sql`** - Additional fixes for delete operations
3. **`DATABASE_COMPLETE_SCHEMA.sql`** - Complete database schema (reference)

---

**Run the SQL fix and you're good to go!** 🚀
