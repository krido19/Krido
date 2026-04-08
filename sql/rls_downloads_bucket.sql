-- ============================================================
-- RLS Policy untuk Storage Bucket 'downloads'
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Admin (authenticated user) bisa upload file
CREATE POLICY "Admin can upload downloads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'downloads');

-- 2. Admin bisa update/overwrite file
CREATE POLICY "Admin can update downloads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'downloads');

-- 3. Admin bisa hapus file
CREATE POLICY "Admin can delete downloads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'downloads');

-- 4. Semua orang (public) bisa baca/generate signed URL
CREATE POLICY "Public can read downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'downloads');
