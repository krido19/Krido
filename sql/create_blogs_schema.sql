-- Create blogs table
CREATE TABLE public.blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id uuid REFERENCES public.blogs(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Policies for blogs
CREATE POLICY "Public blogs are viewable by everyone." ON public.blogs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view all blogs" ON public.blogs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert blogs" ON public.blogs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update blogs" ON public.blogs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete blogs" ON public.blogs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for blog_comments
-- Anyone can read comments for a blog
CREATE POLICY "Comments are viewable by everyone" ON public.blog_comments
  FOR SELECT USING (true);

-- Anyone can insert a comment (we allow anonymous comments for now)
CREATE POLICY "Anyone can insert comments" ON public.blog_comments
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can delete comments
CREATE POLICY "Users can delete comments" ON public.blog_comments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create storage bucket for blog covers
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-covers
CREATE POLICY "Blog covers are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated users can upload blog covers." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog covers." ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog covers." ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-covers' AND auth.role() = 'authenticated');
