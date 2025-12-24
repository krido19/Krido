export const DB_SCHEMA = `
-- SUPABASE SCHEMA BACKUP
-- EXECUTED ON: ${new Date().toISOString()}

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  github_url text,
  linkedin_url text,
  instagram_url text,
  resume_url text,
  phone text,
  constraint username_length check (char_length(username) >= 3)
);

-- Portfolio
CREATE TABLE IF NOT EXISTS public.portfolio (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  image_url text,
  project_url text,
  skills text[],
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activities
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  date date,
  image_url text,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- App Releases
CREATE TABLE IF NOT EXISTS public.app_releases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  app_name text not null,
  version text not null,
  description text,
  apk_url text not null,
  download_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title_en text not null,
  title_id text not null,
  price text not null,
  time_en text not null,
  time_id text not null,
  features_en jsonb not null default '[]'::jsonb,
  features_id jsonb not null default '[]'::jsonb,
  color text not null default 'from-cyan-400 to-blue-500',
  popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Stats
CREATE TABLE IF NOT EXISTS public.site_stats (
    id SERIAL PRIMARY KEY,
    visitor_count BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
`;
