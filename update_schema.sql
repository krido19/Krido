-- Add Social Media Links and Phone to Profiles
alter table profiles 
add column if not exists github_url text,
add column if not exists linkedin_url text,
add column if not exists instagram_url text,
add column if not exists resume_url text,
add column if not exists phone text;

-- Add Skills and Views to Portfolio
alter table portfolio 
add column if not exists skills text[],
add column if not exists views integer default 0;

-- Add Views to Activities
alter table activities 
add column if not exists views integer default 0;

-- Storage Policy for Resume (using 'resumes' bucket)
-- Create 'resumes' bucket manually in Supabase Dashboard

create policy "Resumes are publicly accessible." on storage.objects
  for select using ( bucket_id = 'resumes' );

create policy "Authenticated users can upload resumes." on storage.objects
  for insert with check ( bucket_id = 'resumes' and auth.role() = 'authenticated' );

create policy "Users can update their own resume." on storage.objects
  for update using ( bucket_id = 'resumes' and auth.uid() = owner );

create policy "Users can delete their own resume." on storage.objects
  for delete using ( bucket_id = 'resumes' and auth.uid() = owner );
