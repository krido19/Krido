-- Enable moddatetime extension
create extension if not exists moddatetime schema extensions;

-- Create services table
create table public.services (
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

-- Enable RLS
alter table public.services enable row level security;

-- Create policies
create policy "Public services are viewable by everyone."
  on public.services for select
  using ( true );

create policy "Users can insert their own services."
  on public.services for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own services."
  on public.services for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own services."
  on public.services for delete
  using ( auth.uid() = user_id );

-- Create updated_at trigger
create trigger handle_updated_at before update on public.services
  for each row execute procedure moddatetime (updated_at);
