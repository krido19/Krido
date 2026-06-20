import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, ArrowLeft, Save } from 'lucide-react';
import { optimizeImage } from '../../utils/imageOptimizer';
import SEO from '../../components/SEO';

const Field = ({ label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const EditActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (id) fetchActivityItem(id); }, [id]);

  const fetchActivityItem = async (itemId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('activities').select('*').eq('id', itemId).single();
      if (error) throw error;
      if (data) { setTitle(data.title); setDescription(data.description); setDate(data.date); setImageUrl(data.image_url); }
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files?.length) throw new Error('Pilih gambar terlebih dahulu.');
      const file = await optimizeImage(event.target.files[0]);
      const fileName = `${Math.random()}.${file.name.split('.').pop() || 'webp'}`;
      const { error: uploadError } = await supabase.storage.from('activities').upload(fileName, file);
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
      const activityData = { user_id: user.id, title, description, date, image_url: imageUrl };
      const { error } = id
        ? await supabase.from('activities').update(activityData).eq('id', id)
        : await supabase.from('activities').insert([activityData]);
      if (error) throw error;
      navigate('/dashboard/activities');
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <SEO title={id ? 'Edit Activity' : 'Add Activity'} />
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/dashboard/activities')} className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{id ? 'Edit Activity' : 'Add New Activity'}</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Isi detail aktivitas timeline</p>
        </div>
      </div>

      {loading && id ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div className="bg-white rounded-lg p-6 space-y-5">
            {/* Image Upload */}
            <Field label="Gambar Aktivitas">
              <div className="flex items-center gap-4 flex-wrap">
                {imageUrl && (
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/activities/${imageUrl}`}
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

            <Field label="Tanggal" htmlFor="date">
              <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-flat" />
            </Field>

            <Field label="Deskripsi" htmlFor="description">
              <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-flat" />
            </Field>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/dashboard/activities')} className="btn-secondary text-sm">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary gap-2 text-sm disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Simpan Aktivitas'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditActivity;
