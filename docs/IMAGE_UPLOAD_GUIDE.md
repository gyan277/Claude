# 📸 Ghana News Image Upload Guide

## ✅ IMAGE UPLOAD FEATURE ADDED!

Super admins can now upload images directly when creating Ghana News!

---

## 🚀 HOW TO USE

### Method 1: Upload Image File (Recommended)
1. Go to **Admin Panel** → **News** tab
2. Click **"Add News Item"**
3. Fill in Title and Description
4. Click **"Choose File"** under News Image
5. Select an image from your computer
6. See instant preview
7. Fill in Source and Date
8. Click **"Create News"**
9. ✅ Image uploaded to Supabase Storage!

### Method 2: Use Image URL
1. Go to **Admin Panel** → **News** tab
2. Click **"Add News Item"**
3. Fill in Title and Description
4. Paste image URL in the text field (below "OR")
5. See instant preview
6. Fill in Source and Date
7. Click **"Create News"**
8. ✅ Uses external image URL!

---

## 🗄️ SETUP REQUIRED

### Step 1: Create Storage Bucket
Run `SETUP_IMAGE_STORAGE.sql` in Supabase SQL Editor:

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Copy and paste the SQL
4. Click **Run**

This creates:
- ✅ Storage bucket: `ghana-news-images`
- ✅ Public access policies
- ✅ Upload/download permissions

### Step 2: Verify Bucket Created
1. Go to **Storage** in Supabase Dashboard
2. You should see `ghana-news-images` bucket
3. Click on it to view uploaded images

---

## 📁 WHERE IMAGES ARE STORED

**Supabase Storage:**
- Bucket: `ghana-news-images`
- Path: `news/[timestamp]-[random].[ext]`
- Public URL: `https://your-project.supabase.co/storage/v1/object/public/ghana-news-images/news/...`

**Example:**
```
news/1738080000000-abc123.jpg
news/1738080001234-xyz789.png
```

---

## 🎨 FEATURES

### Image Upload:
- ✅ Drag & drop or click to browse
- ✅ Accepts: JPG, PNG, GIF, WEBP
- ✅ Auto-generates unique filename
- ✅ Instant preview after selection
- ✅ Progress indicator during upload
- ✅ Stores in Supabase Storage

### Image URL:
- ✅ Paste any public image URL
- ✅ Works with external images
- ✅ Instant preview
- ✅ Fallback if upload fails

### Smart Features:
- ✅ Choose file OR paste URL (your choice!)
- ✅ Preview before submitting
- ✅ Error handling with fallback image
- ✅ Upload progress indicator
- ✅ Automatic cleanup on error

---

## 🧪 TEST IT

### Test Upload:
1. Create a news item
2. Upload an image file
3. Submit form
4. Go to Home page
5. ✅ Your news should show with uploaded image!

### Test URL:
1. Create a news item
2. Paste this test URL:
   ```
   https://via.placeholder.com/600x400/228B22/FFFFFF?text=Ghana+News
   ```
3. Submit form
4. Go to Home page
5. ✅ Your news should show with the image!

---

## 📊 IMAGE REQUIREMENTS

**Recommended:**
- Format: JPG or PNG
- Size: Under 2MB
- Dimensions: 600x400px (or similar 3:2 ratio)
- Quality: Web-optimized

**Supported Formats:**
- JPG/JPEG ✅
- PNG ✅
- GIF ✅
- WEBP ✅

---

## ⚠️ TROUBLESHOOTING

### Issue: "Upload failed"
**Solutions:**
1. Check if storage bucket exists in Supabase
2. Run `SETUP_IMAGE_STORAGE.sql` again
3. Verify storage policies allow uploads
4. Check file size (should be under 50MB)

### Issue: "Image not showing"
**Solutions:**
1. Check if bucket is set to "public"
2. Verify image URL in database is correct
3. Try pasting the URL directly in browser
4. Check browser console for errors

### Issue: "Permission denied"
**Solution:**
Run this in Supabase SQL Editor:
```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'ghana-news-images';
```

---

## 🎯 UI PREVIEW

When creating news, you'll see:

```
News Image
[Choose File] my-image.jpg

        OR

[Or paste image URL: https://...]

Preview:
┌─────────────────┐
│                 │
│  Image Preview  │
│                 │
└─────────────────┘
```

---

## 🔐 SECURITY

**Safe:**
- ✅ Images stored in Supabase (not your server)
- ✅ Public access only (no private data)
- ✅ Auto-generated filenames prevent overwriting
- ✅ File type validation

**Storage Costs:**
- Supabase Free Tier: 1GB storage
- Should be sufficient for news images
- Monitor usage in Supabase Dashboard

---

## 📝 FILES MODIFIED

- ✅ `src/pages/Admin.tsx` - Added image upload UI and logic
- ✅ `SETUP_IMAGE_STORAGE.sql` - Storage bucket setup

---

## 🎉 READY TO USE!

1. Run `SETUP_IMAGE_STORAGE.sql` in Supabase
2. Refresh your admin panel
3. Try uploading an image!
4. Works instantly! 🚀

---

**Image upload is now live!** 📸
