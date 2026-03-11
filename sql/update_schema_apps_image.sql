-- Add image_url to app_releases
alter table app_releases 
add column if not exists image_url text;
