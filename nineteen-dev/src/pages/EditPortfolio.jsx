import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, ArrowLeft, Save } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';
import SEO from '../components/SEO';

const Field = ({ label, htmlFor, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const EditPortfolio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [skills, setSkills] = useState('');

  useEffect(() => { if (id) fetchPortfolioItem(id); }, [id]);

  const fetchPortfolioItem = async (itemId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('portfolio').select('*').eq('id', itemId).single();
      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setProjectUrl(data.project_url || '');
        setVideoUrl(data.video_url || '');
        setImageUrl(data.image_url);
        setSkills(data.skills ? data.skills.join(', ') : '');
      }
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files?.length) throw new Error('Pilih gambar terlebih dahulu.');
      const file = await optimizeImage(event.target.files[0]);
      const fileName = `${Math.random()}.${file.name.split('.').pop() || 'webp'}`;
      const { error: uploadError } = await supabase.storage.from('portfolio').upload(fileName, file);
      if (uploadError) throw uploadError;
      setImageUrl(fileName);
    } catch (error) { alert(error.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const portfolioData = { user_id: user.id, title, description, project_url: projectUrl, video_url: videoUrl, image_url: imageUrl, skills: skillsArray };
      const { error } = id
        ? await supabase.from('portfolio').update(portfolioData).eq('id', id)
        : await supabase.from('portfolio').insert([portfolioData]);
      if (error) throw error;
      navigate('/portfolio');
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };


  return (
    <div>
      <SEO title={id ? 'Edit Project' : 'Add Project'} />
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/portfolio')} className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{id ? 'Edit Project' : 'Add New Project'}</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Isi detail proyek portfolio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white rounded-lg p-6 space-y-5">
          {/* Image */}
          <Field label="Gambar Proyek">
            <div className="flex items-center gap-4 flex-wrap">
              {imageUrl && (
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${imageUrl}`}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-gray-200 text-foreground text-sm font-semibold rounded-md cursor-pointer transition-colors">
                {uploading ? (
                  <><span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" />Upload Gambar</>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </Field>

          <Field label="Judul" htmlFor="title">
            <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-flat" />
          </Field>

          <Field label="Deskripsi" htmlFor="description">
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-flat" />
          </Field>

          <Field label="Skills / Teknologi" htmlFor="skills" hint="Pisahkan dengan koma, contoh: React, Node.js, Python">
            <input id="skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, Python" className="input-flat" />
          </Field>

          <Field label="URL Proyek" htmlFor="projectUrl">
            <input id="projectUrl" type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://..." className="input-flat" />
          </Field>

          <Field label="YouTube Video URL (opsional)" htmlFor="videoUrl" hint="Paste link YouTube untuk tampilkan video di modal proyek">
            <input id="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="input-flat" />
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/portfolio')} className="btn-secondary text-sm">Batal</button>
          <button type="submit" disabled={loading} className="btn-primary gap-2 text-sm disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Proyek'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPortfolio;
