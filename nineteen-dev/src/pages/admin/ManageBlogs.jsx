import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import WorldCupBracket from '../../components/WorldCupBracket';

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Blog deleted successfully');
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Blog ${!currentStatus ? 'published' : 'unpublished'}`);
      setBlogs(blogs.map(b => b.id === id ? { ...b, is_published: !currentStatus } : b));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading blogs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-foreground">Manage Blogs</h1>
        <Link
          to="/dashboard/blogs/new"
          className="btn-primary gap-2"
        >
          <Plus size={18} />
          New Blog Post
        </Link>
      </div>

      {/* PONITAIL: Menyisipkan bagan sesuai permintaan user untuk test */}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">World Cup 2026 Bracket</h2>
        <div className="rounded-xl overflow-hidden border border-gray-800">
          <WorldCupBracket />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Title</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                    No blog posts found. Create one!
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {blog.cover_image ? (
                          <img
                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/blog-covers/${blog.cover_image}`}
                            alt={blog.title}
                            className="w-20 h-14 object-cover rounded-md border border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-14 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                        )}
                        <div>
                          <div className="font-bold text-foreground line-clamp-1">{blog.title}</div>
                          <div className="text-sm text-gray-500">/{blog.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 font-medium">
                      {format(new Date(blog.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => togglePublish(blog.id, blog.is_published)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          blog.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                        }`}
                      >
                        {blog.is_published ? (
                          <><CheckCircle size={14} /> Published</>
                        ) : (
                          <><XCircle size={14} /> Draft</>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/blogs/edit/${blog.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
