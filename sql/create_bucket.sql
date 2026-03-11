-- Create 'apks' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('apks', 'apks', true)
on conflict (id) do nothing;

-- Ensure the bucket is public (optional, but good for safety)
update storage.buckets
set public = true
where id = 'apks';
