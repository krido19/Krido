-- Create app_releases table
create table if not exists app_releases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  app_name text not null,
  version text not null,
  description text,
  apk_url text not null, -- Path in storage bucket
  download_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table app_releases enable row level security;

-- Policies for app_releases
create policy "Public apps are viewable by everyone." on app_releases
  for select using ( true );

create policy "Users can insert their own apps." on app_releases
  for insert with check ( auth.uid() = user_id );

create policy "Users can update their own apps." on app_releases
  for update using ( auth.uid() = user_id );

create policy "Users can delete their own apps." on app_releases
  for delete using ( auth.uid() = user_id );

-- Storage Policy for APKs (using 'apks' bucket)
-- Create 'apks' bucket manually in Supabase Dashboard if it doesn't exist

create policy "APKs are publicly accessible." on storage.objects
  for select using ( bucket_id = 'apks' );

create policy "Authenticated users can upload APKs." on storage.objects
  for insert with check ( bucket_id = 'apks' and auth.role() = 'authenticated' );

create policy "Users can update their own APKs." on storage.objects
  for update using ( bucket_id = 'apks' and auth.uid() = owner );

create policy "Users can delete their own APKs." on storage.objects
  for delete using ( bucket_id = 'apks' and auth.uid() = owner );
