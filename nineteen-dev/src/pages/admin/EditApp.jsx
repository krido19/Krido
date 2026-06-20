import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Smartphone, CheckCircle2 } from 'lucide-react';
import SEO from '../../components/SEO';
import AppJoyride from '../../components/AppJoyride';
import { useTour } from '../../hooks/useTour';

const Field = ({ label, htmlFor, hint, children, id }) => (
  <div id={id}>
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const EditApp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({ app_name: '', version: '', description: '', apk_url: '', image_url: '' });

  const { runTour, startTour, handleJoyrideCallback } = useTour();

  const editAppSteps = [
    { target: '#edit-app-header', title: '📝 Form Aplikasi', content: 'Isi detail rilis aplikasi Anda di halaman ini.', placement: 'bottom', disableBeacon: true },
    { target: '#edit-app-basic', title: '📋 Informasi Dasar', content: 'Tentukan nama aplikasi, nomor versi rilis (misal: 1.0.0), dan deskripsi singkat.', placement: 'right', disableBeacon: true },
    { target: '#edit-app-icon', title: '🖼️ Ikon Aplikasi', content: 'Unggah gambar kotak (square) yang merepresentasikan logo aplikasi ini.', placement: 'top', disableBeacon: true },
    { target: '#edit-app-apk', title: '📦 File APK', content: 'Unggah file berformat .apk yang bisa diinstal oleh klien di perangkat Android mereka.', placement: 'top', disableBeacon: true },
  ];

  useEffect(() => { if (id) fetchApp(); }, [id]);



  const fetchApp = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('app_releases').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) { console.error('Error fetching app:', error); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      if (!file) return;
      const fileName = `img_${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('apks').upload(fileName, file);
      if (error) throw error;
      setFormData(prev => ({ ...prev, image_url: fileName }));
    } catch (error) { alert('Error uploading image'); }
    finally { setUploadingImage(false); }
  };

  const handleFileChange = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      if (!file.name.endsWith('.apk')) { alert('Upload file .apk saja'); return; }
      const baseName = formData.app_name ? formData.app_name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'app';
      const fileName = `${baseName}-${Date.now()}.apk`;
      const { error } = await supabase.storage.from('apks').upload(fileName, file);
      if (error) throw error;
      setFormData(prev => ({ ...prev, apk_url: fileName }));
    } catch (error) { alert('Error uploading APK'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const appData = { ...formData, user_id: user.id, updated_at: new Date() };
      const { error } = id
        ? await supabase.from('app_releases').update(appData).eq('id', id)
        : await supabase.from('app_releases').insert([appData]);
      if (error) throw error;
      navigate('/dashboard/apps');
    } catch (error) { alert('Gagal menyimpan: ' + error.message); }
    finally { setLoading(false); }
  };


  if (loading && id) return (
    <div className="flex items-center justify-center py-24">
      <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <SEO title={id ? 'Edit App' : 'Add App'} />

      <AppJoyride steps={editAppSteps} run={runTour} callback={handleJoyrideCallback} />

      <div id="edit-app-header" className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard/apps')} className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
            <h1 className="text-2xl font-extrabold text-foreground">{id ? 'Edit Application' : 'Add New Application'}</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Kelola rilis APK aplikasi</p>
            </div>
        </div>
        <button type="button" onClick={startTour} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Panduan Form</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white rounded-lg p-6 space-y-5">
          <div id="edit-app-basic" className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Nama Aplikasi" htmlFor="app_name">
                <input id="app_name" type="text" name="app_name" value={formData.app_name} onChange={handleChange} className="input-flat" required />
              </Field>
              <Field label="Versi" htmlFor="version">
                <input id="version" type="text" name="version" value={formData.version} onChange={handleChange} placeholder="e.g. 1.0.0" className="input-flat" required />
              </Field>
            </div>

            <Field label="Deskripsi" htmlFor="description">
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="input-flat" />
            </Field>
          </div>

          {/* App Icon */}
          <Field id="edit-app-icon" label="App Icon / Screenshot">
            <div className="flex items-center gap-4 flex-wrap">
              {formData.image_url ? (
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/apks/${formData.image_url}`}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-gray-300" />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-gray-200 text-foreground text-sm font-semibold rounded-md cursor-pointer transition-colors">
                {uploadingImage ? (
                  <><span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" />Upload Icon</>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploadingImage} />
              </label>
            </div>
          </Field>

          {/* APK File */}
          <Field id="edit-app-apk" label="File APK" hint="Hanya file .apk yang diizinkan">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-gray-200 text-foreground text-sm font-semibold rounded-md cursor-pointer transition-colors">
                {uploading ? (
                  <><span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" />Upload APK</>
                )}
                <input type="file" accept=".apk" onChange={handleFileChange} className="hidden" disabled={uploading} />
              </label>
              {formData.apk_url && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
                  <CheckCircle2 className="w-4 h-4" /> APK Uploaded
                </span>
              )}
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/dashboard/apps')} className="btn-secondary text-sm">Batal</button>
          <button
            type="submit"
            disabled={loading || uploading || uploadingImage || !formData.apk_url}
            className="btn-primary gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Aplikasi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditApp;
