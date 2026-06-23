import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Clock, Calendar, MessageSquare, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', content: '' });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlogAndComments();
  }, [slug]);

  const fetchBlogAndComments = async () => {
    try {
      setLoading(true);
      // Fetch blog
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (blogError) throw blogError;
      setBlog(blogData);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_id', blogData.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    setCommentForm({ ...commentForm, [e.target.name]: e.target.value });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.content.trim()) return;

    try {
      setSubmittingComment(true);
      const { error } = await supabase.from('blog_comments').insert([{
        blog_id: blog.id,
        name: commentForm.name.trim(),
        content: commentForm.content.trim()
      }]);

      if (error) throw error;
      
      toast.success('Comment posted successfully');
      setCommentForm({ name: '', content: '' });
      fetchBlogAndComments(); // Refresh comments
    } catch (error) {
      console.error(error);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-black text-foreground mb-4">Post Not Found</h1>
          <p className="text-gray-500 mb-8">The article you are looking for does not exist or has been removed.</p>
          <Link to="/blog" className="btn-primary">Back to DevLog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={`${blog.title} - DevLog`} 
        description={blog.excerpt} 
        url={`${window.location.origin}/blog/${slug}`} 
        image={blog.cover_image ? `${SUPABASE_URL}/storage/v1/object/public/blog-covers/${blog.cover_image}` : null}
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container-max">
          <div className="max-w-4xl mx-auto mb-10 text-center">
            <div className="flex justify-center mb-6">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors bg-gray-50 px-4 py-2 rounded-full">
                <ArrowLeft className="w-4 h-4" /> Back to DevLog
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-8">
              {blog.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm font-bold text-gray-400">
              <div className="flex items-center gap-2 text-primary">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(blog.created_at), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{Math.max(1, Math.ceil(blog.content.length / 1000))} min read</span>
              </div>
            </div>
          </div>

          {blog.cover_image && (
            <div className="max-w-5xl mx-auto rounded-2xl md:rounded-[2rem] overflow-hidden bg-gray-50 mb-16 shadow-2xl shadow-blue-900/10 border border-gray-100 flex justify-center">
              <img
                src={`${SUPABASE_URL}/storage/v1/object/public/blog-covers/${blog.cover_image}`}
                alt={blog.title}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-6">
          <article className="prose prose-lg prose-blue max-w-none mb-16 prose-headings:font-extrabold prose-p:text-gray-600 prose-img:rounded-2xl prose-img:w-full prose-img:shadow-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </article>
          
          {/* Comments Section */}
          <div className="border-t border-gray-100 pt-16">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black text-foreground">Comments ({comments.length})</h2>
            </div>
            
            <form onSubmit={submitComment} className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-100">
              <h3 className="font-bold text-foreground mb-4">Leave a comment</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={commentForm.name}
                    onChange={handleCommentChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="sr-only">Comment</label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    value={commentForm.content}
                    onChange={handleCommentChange}
                    placeholder="Write your thoughts..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment || !commentForm.name.trim() || !commentForm.content.trim()}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                  Post Comment
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-foreground">{comment.name}</span>
                      <span className="text-xs text-gray-400 font-medium">{format(new Date(comment.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
