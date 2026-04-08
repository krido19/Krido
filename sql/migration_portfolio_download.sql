-- ============================================================
-- Migration: Tambah kolom download_url & download_file_name
-- ke tabel portfolio untuk fitur unduhan file proyek
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom download_url (path file di storage bucket 'downloads')
ALTER TABLE portfolio
  ADD COLUMN IF NOT EXISTS download_url TEXT DEFAULT NULL;

-- 2. Tambah kolom download_file_name (nama file asli supaya lebih user-friendly)
ALTER TABLE portfolio
  ADD COLUMN IF NOT EXISTS download_file_name TEXT DEFAULT NULL;

-- ============================================================
-- Setelah jalankan SQL di atas, buat Storage Bucket di Supabase:
-- Dashboard > Storage > New Bucket
--   Name    : downloads
--   Public  : FALSE (private, pakai signed URL)
-- ============================================================
