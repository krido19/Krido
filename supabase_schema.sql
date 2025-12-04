-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for Portfolio items
create table portfolio (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  description text,
  image_url text,
  project_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table portfolio enable row level security;

create policy "Portfolio items are viewable by everyone." on portfolio
  for select using (true);

create policy "Users can insert their own portfolio items." on portfolio
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own portfolio items." on portfolio
  for update using (auth.uid() = user_id);

create policy "Users can delete their own portfolio items." on portfolio
  for delete using (auth.uid() = user_id);

-- Create a table for Activities (Kegiatan)
create table activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  description text,
  date date,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table activities enable row level security;

create policy "Activities are viewable by everyone." on activities
  for select using (true);

create policy "Users can insert their own activities." on activities
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own activities." on activities
  for update using (auth.uid() = user_id);

create policy "Users can delete their own activities." on activities
  for delete using (auth.uid() = user_id);

-- Set up Storage!
-- We need to create buckets for images.
-- Note: You can't create buckets via SQL in the standard editor easily, 
-- but you can set up policies. 
-- PLEASE CREATE THESE BUCKETS MANUALLY IN SUPABASE DASHBOARD: 'avatars', 'portfolio', 'activities'

-- Storage Policies (assuming buckets exist)
-- Avatars
create policy "Avatar images are publicly accessible." on storage.objects
  for select using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check ( bucket_id = 'avatars' );

create policy "Anyone can update an avatar." on storage.objects
  for update with check ( bucket_id = 'avatars' );

-- Portfolio Images
create policy "Portfolio images are publicly accessible." on storage.objects
  for select using ( bucket_id = 'portfolio' );

create policy "Authenticated users can upload portfolio images." on storage.objects
  for insert with check ( bucket_id = 'portfolio' and auth.role() = 'authenticated' );

create policy "Users can update their own portfolio images." on storage.objects
  for update using ( bucket_id = 'portfolio' and auth.uid() = owner );

create policy "Users can delete their own portfolio images." on storage.objects
  for delete using ( bucket_id = 'portfolio' and auth.uid() = owner );

-- Activity Images
create policy "Activity images are publicly accessible." on storage.objects
  for select using ( bucket_id = 'activities' );

create policy "Authenticated users can upload activity images." on storage.objects
  for insert with check ( bucket_id = 'activities' and auth.role() = 'authenticated' );

create policy "Users can update their own activity images." on storage.objects
  for update using ( bucket_id = 'activities' and auth.uid() = owner );

create policy "Users can delete their own activity images." on storage.objects
  for delete using ( bucket_id = 'activities' and auth.uid() = owner );
