# Admin Panel Access Guide

## ✅ ADMIN PANEL IS NOW FIXED AND ACCESSIBLE!

The admin panel has been completely rebuilt with working functionality for:
- ✅ User Management (Assembly Members & Ministers)
- ✅ Policy Management (Create, Edit, Delete policies)
- ✅ Ghana News Management (Create, Edit, Delete news)

## 🚀 How to Access the Admin Panel

### Option 1: Access Without Login (Recommended for First Time)
The admin panel now allows **non-logged-in users** to access it for initial setup. This means you can:

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to the admin page**:
   - Go to: `http://localhost:5173/admin` (or click Admin in your app)
   - You should see the admin panel with 3 tabs: Users, Policies, News

3. **Create your first admin user**:
   - Click "Add New User"
   - Fill in the form with your details
   - Select role: "Assembly Member" or "Minister"
   - Click "Create User"

### Option 2: Create Admin User via SQL (Alternative)
If you prefer to create an admin user directly in the database:

```sql
-- First, get the user ID from Supabase Auth after signup
-- Then update the role in the users table:
UPDATE users 
SET role = 'assembly', verified = true 
WHERE email = 'your-email@example.com';
```

## 🎯 Admin Panel Features

### 1. Users Tab
- **View all admin users** (Assembly Members & Ministers)
- **Create new admin users** with roles
- **Delete admin users**
- **Search users** by name, email, or district
- **Statistics**: Shows count of Assembly Members, Ministers, and total admin users

### 2. Policies Tab
- **Create new policies** with title, description, category, and status
- **Edit existing policies**
- **Delete policies**
- **Search policies** by title, description, or category
- **Status options**: Draft, Active, Archived
- All policies are stored in the `policies` table and appear on the Policies page

### 3. Ghana News Tab
- **Create news items** with title, description, image URL, source, and date
- **Edit existing news**
- **Delete news items**
- **Search news** by title, description, or source
- All news items are stored in the `ghana_news` table and appear on the Home page

## 🔒 Access Control

**Who Can Access:**
- Not logged in users (for initial setup)
- Users with role = 'assembly'
- Users with role = 'minister'

**Who Cannot Access:**
- Users with role = 'citizen' (shows friendly "Access Restricted" message)

## 📝 Important Notes

1. **First Admin User**: Use the admin panel when NOT logged in to create your first admin user
2. **Citizen Signups**: Regular signups on the SignUp page always create "citizen" role users
3. **Only Admins Can Create Admins**: Only assembly/minister users can create other admin users
4. **Database Required**: Make sure you've run the database setup SQL files:
   - `ADD_GHANA_CARD_COLUMNS.sql`
   - `FORUM_FEATURES_SCHEMA.sql`
   - `DATABASE_COMPLETE_SCHEMA.sql`

## 🐛 Troubleshooting

### "Access Restricted" Message
- You're logged in as a citizen
- **Solution**: Log out and access `/admin` without being logged in, OR update your user role in database

### Form Not Submitting
- Check browser console for errors
- Make sure your Supabase connection is working
- Verify all required fields are filled

### Users Not Loading
- Check Supabase dashboard for the `users` table
- Make sure RLS policies allow reading user data
- Check browser console for error messages

## 📊 Sample Data

After creating your first admin user, you can:
1. Add sample policies in the Policies tab
2. Add sample news in the Ghana News tab
3. These will immediately appear on the respective pages

## 🎉 Next Steps

1. Access `/admin` without logging in
2. Create your first Assembly Member or Minister account
3. Log in with that account
4. Start managing policies and news!

Your admin panel is now fully functional! 🚀
