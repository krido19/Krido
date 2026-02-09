-- Add video_url column to portfolio table
-- Run this in Supabase SQL Editor

ALTER TABLE portfolio
ADD COLUMN IF NOT EXISTS video_url text;

-- This allows storing YouTube video URLs for each portfolio item
-- The video will be displayed in a lightbox modal with a play button overlay
