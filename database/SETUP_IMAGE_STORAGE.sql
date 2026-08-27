-- Setup Image Storage for Ghana News
-- Run this in your Supabase SQL Editor

-- 1. Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ghana-news-images', 'ghana-news-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies to allow public access for uploads and reads
-- Allow anyone to upload images (authenticated or not)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ghana-news-images');

-- Allow anyone to view images
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'ghana-news-images');

-- Allow anyone to update images
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ghana-news-images');

-- Allow anyone to delete images
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'ghana-news-images');

-- 3. Verify setup
SELECT 
    'Storage bucket created successfully!' as status,
    id,
    name,
    public
FROM storage.buckets
WHERE id = 'ghana-news-images';
