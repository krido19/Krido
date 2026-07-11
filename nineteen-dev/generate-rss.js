import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env. RSS generation skipped.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateRss() {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching blogs for RSS:", error);
    process.exit(1);
  }

  const siteUrl = 'https://nineteen-dev.vercel.app';
  
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Nineteen Dev Blog</title>
  <link>${siteUrl}</link>
  <description>Latest articles and dev logs from Nineteen Dev</description>
  <language>en-us</language>
`;

  if (blogs) {
    blogs.forEach(blog => {
      const postUrl = `${siteUrl}/blog/${blog.slug}`;
      const pubDate = new Date(blog.created_at).toUTCString();
      rss += `  <item>
    <title>${escapeXml(blog.title)}</title>
    <link>${postUrl}</link>
    <guid>${postUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(blog.excerpt)}</description>
  </item>\n`;
    });
  }

  rss += `</channel>\n</rss>`;

  // Write to public folder so it's served by Vite at /rss.xml
  fs.writeFileSync('./public/rss.xml', rss);
  console.log('Successfully generated public/rss.xml');
}

generateRss();
