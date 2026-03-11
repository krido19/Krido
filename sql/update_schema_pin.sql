-- Add is_pinned column to app_releases table
alter table app_releases 
add column if not exists is_pinned boolean default false;
