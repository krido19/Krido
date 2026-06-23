import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { format } from 'date-fns';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, excerpt, cover_image, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO title="DevLog - Technical Blog & Updates" description="Read the latest thoughts, dev logs, and technical articles." url={`${window.location.origin}/blog`} />
      <Navbar />

      {/* ── Header ── */}
      <section className="section-primary pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-lg rotate-45 translate-y-1/2" />
        <div className="container-max relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <p className="section-label text-blue-200 mb-3">Articles & DevLogs</p>
          <h1 className="section-title-white">Technical Blog</h1>
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="section-white py-16 flex-1 flex flex-col">
        <div className="container-max flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No articles yet</h3>
              <p className="text-gray-500">I haven't published any articles yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                    {blog.cover_image ? (
                      <img
                        src={`${SUPABASE_URL}/storage/v1/object/public/blog-covers/${blog.cover_image}`}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="font-bold text-xl opacity-20">19</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{format(new Date(blog.created_at), 'dd MMM yyyy')}</span>
                    </div>
                    
                    <h3 className="text-xl font-extrabold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-secondary mt-auto group-hover:text-primary transition-colors">
                      Read Article <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blogs;
