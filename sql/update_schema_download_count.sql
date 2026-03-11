-- Create RPC function to increment download count
create or replace function increment_download_count(app_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update app_releases
  set download_count = download_count + 1
  where id = app_id;
end;
$$;
