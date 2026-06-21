import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/SEO';

const Field = ({ label, htmlFor, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    slug: '', 
    excerpt: '', 
    content: '', 
    cover_image: '',
    is_published: false
  });

  useEffect(() => { 
    if (id) fetchBlog(); 
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) { 
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog');
    } finally { 
      setLoading(false); 
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto generate slug from title if it's a new post and slug isn't manually edited
    if (name === 'title' && !id && !formData.slug) {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, [name]: value, slug: generatedSlug });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleImageChange = async (e) => {
    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      if (!file) return;
      const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('blog-covers').upload(fileName, file);
      if (error) throw error;
      setFormData(prev => ({ ...prev, cover_image: fileName }));
      toast.success('Cover uploaded');
    } catch (error) { 
      toast.error('Error uploading image');
      console.error(error);
    } finally { 
      setUploadingImage(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      
      const blogData = { ...formData, updated_at: new Date() };
      
      const { error } = id
        ? await supabase.from('blogs').update(blogData).eq('id', id)
        : await supabase.from('blogs').insert([blogData]);
        
      if (error) throw error;
      
      toast.success(id ? 'Blog updated' : 'Blog created');
      navigate('/dashboard/blogs');
    } catch (error) { 
      toast.error('Gagal menyimpan: ' + error.message); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading && id) return (
    <div className="flex items-center justify-center py-24">
      <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <SEO title={id ? 'Edit Blog' : 'New Blog'} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard/blogs')} className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">Write using Markdown formatting</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Title" htmlFor="title">
              <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
            </Field>
            <Field label="Slug" htmlFor="slug" hint="URL friendly name (e.g. my-first-post)">
              <input id="slug" type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
            </Field>
          </div>

          <Field label="Excerpt" htmlFor="excerpt" hint="A short summary of the post">
            <textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
          </Field>

          {/* Cover Image */}
          <Field label="Cover Image">
            <div className="flex items-center gap-4 flex-wrap">
              {formData.cover_image ? (
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/blog-covers/${formData.cover_image}`}
                  alt="Cover Preview"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-32 h-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg cursor-pointer transition-colors">
                {uploadingImage ? (
                  <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" />Upload Cover</>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploadingImage} />
              </label>
            </div>
          </Field>

          <Field label="Content (Markdown)" htmlFor="content" hint="You can use Markdown syntax to format your post.">
            <textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              rows={15} 
              className="w-full px-4 py-3 font-mono text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
              required 
              placeholder="# Heading 1&#10;## Heading 2&#10;**Bold text**&#10;*Italic text*&#10;[Link](https://example.com)&#10;&#10;```javascript&#10;const hello = 'world';&#10;```"
            />
          </Field>
          
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="is_published" 
              name="is_published" 
              checked={formData.is_published} 
              onChange={handleChange}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700 cursor-pointer">
              Publish this post immediately
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/dashboard/blogs')} className="px-5 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">Batal</button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
