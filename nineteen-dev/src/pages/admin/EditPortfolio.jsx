import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, ArrowLeft, Save, FileDown, X, FileArchive } from 'lucide-react';
import { optimizeImage } from '../../utils/imageOptimizer';
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
  const [content, setContent] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [uploadingScreen, setUploadingScreen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState('');
  const [uploadingDownload, setUploadingDownload] = useState(false);

  const { runTour, startTour, handleJoyrideCallback } = useTour();

  const editSteps = [
    { target: '#edit-header', title: '📝 Form Proyek', content: 'Di halaman ini, Anda dapat mengisi detail karya atau studi kasus Anda.', placement: 'bottom', disableBeacon: true },
    { target: '#edit-image-field', title: '🖼️ Gambar Utama', content: 'Unggah gambar resolusi tinggi untuk memikat pengunjung pada pandangan pertama.', placement: 'right', disableBeacon: true },
    { target: '#edit-basic-info', title: '📋 Informasi Dasar', content: 'Isi judul, deskripsi singkat, dan teknologi yang Anda gunakan dalam proyek ini.', placement: 'right', disableBeacon: true },
    { target: '#edit-download-field', title: '📦 File Unduhan', content: 'Punya produk digital (APK/ZIP)? Unggah di sini agar pengunjung dapat langsung mengunduhnya!', placement: 'left', disableBeacon: true },
    { target: '#edit-screenshots-field', title: '📸 Galeri Fitur (Detail)', content: 'Tambahkan beberapa screenshot dan jelaskan fitur secara mendalam untuk membuat studi kasus yang profesional.', placement: 'top', disableBeacon: true },
  ];

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
        setContent(data.content || '');
        setDownloadUrl(data.download_url || null);
        setDownloadFileName(data.download_file_name || '');
        const parsedScreenshots = (data.screenshots || []).map(str => {
          try {
            const parsed = JSON.parse(str);
            return parsed.image ? parsed : { image: str, caption: '' };
          } catch {
            return { image: str, caption: '' };
          }
        });
        setScreenshots(parsedScreenshots);
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

  const handleScreenshotUpload = async (event) => {
    try {
      setUploadingScreen(true);
      const files = event.target.files;
      if (!files?.length) return;
      
      const newScreenshots = [];
      for (let i = 0; i < files.length; i++) {
        const file = await optimizeImage(files[i]);
        const fileName = `screenshot_${Date.now()}_${Math.random()}.${file.name.split('.').pop() || 'webp'}`;
        const { error: uploadError } = await supabase.storage.from('portfolio').upload(fileName, file);
        if (uploadError) throw uploadError;
        newScreenshots.push({ image: fileName, caption: '' });
      }
      setScreenshots(prev => [...prev, ...newScreenshots]);
    } catch (error) { alert(error.message); }
    finally { setUploadingScreen(false); }
  };

  const removeScreenshot = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const updateScreenshotCaption = (index, value) => {
    setScreenshots(prev => prev.map((item, i) => i === index ? { ...item, caption: value } : item));
  };

  const handleDownloadFileUpload = async (event) => {
    try {
      setUploadingDownload(true);
      const file = event.target.files?.[0];
      if (!file) return;
      const ext = file.name.split('.').pop();
      const fileName = `download_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('downloads').upload(fileName, file);
      if (uploadError) throw uploadError;
      setDownloadUrl(fileName);
      setDownloadFileName(file.name);
    } catch (error) { alert(error.message); }
    finally { setUploadingDownload(false); }
  };

  const handleRemoveDownload = () => {
    setDownloadUrl(null);
    setDownloadFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const screenshotsToSave = screenshots.map(s => JSON.stringify(s));
      const portfolioData = { user_id: user.id, title, description, content, project_url: projectUrl, video_url: videoUrl, image_url: imageUrl, screenshots: screenshotsToSave, skills: skillsArray, download_url: downloadUrl || null, download_file_name: downloadFileName || null };
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

      <AppJoyride steps={editSteps} run={runTour} callback={handleJoyrideCallback} />

      <div id="edit-header" className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/portfolio')} className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
            <h1 className="text-2xl font-extrabold text-foreground">{id ? 'Edit Project' : 'Add New Project'}</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Isi detail proyek portfolio</p>
            </div>
        </div>
        <button type="button" onClick={startTour} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Panduan Form</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white rounded-lg p-6 space-y-5">
          {/* Image */}
          <Field id="edit-image-field" label="Gambar Proyek">
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

          <div id="edit-basic-info" className="space-y-5">
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

          {/* Download File */}
          <Field id="edit-download-field" label="File Unduhan (APK / ZIP / PDF / dll)" hint="Upload file yang bisa diunduh pengunjung dari halaman proyek">
            <div className="space-y-3">
              {downloadUrl ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-primary/20 rounded-lg">
                  <FileArchive className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{downloadFileName || downloadUrl}</p>
                    <p className="text-xs text-gray-400">File sudah diupload</p>
                  </div>
                  <button type="button" onClick={handleRemoveDownload} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus file">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-gray-200 text-foreground text-sm font-semibold rounded-md cursor-pointer transition-colors">
                  {uploadingDownload ? (
                    <><span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />Mengupload...</>
                  ) : (
                    <><FileDown className="w-4 h-4" />Upload File Unduhan</>
                  )}
                  <input type="file" className="hidden" accept="*/*" onChange={handleDownloadFileUpload} disabled={uploadingDownload} />
                </label>
              )}
            </div>
          </Field>

          <Field label="Penjelasan Detail / Konten Panjang" htmlFor="content" hint="Jelaskan secara detail tentang proyek ini. Baris baru (enter) akan dibaca.">
            <textarea id="content" rows={8} value={content} onChange={(e) => setContent(e.target.value)} className="input-flat whitespace-pre-wrap" placeholder="Penjelasan lengkap mengenai proyek..." />
          </Field>

          <Field id="edit-screenshots-field" label="Galeri Tangkapan Layar (Screenshots)" hint="Bisa pilih lebih dari satu gambar sekaligus">
            <div className="space-y-4">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-gray-200 text-foreground text-sm font-semibold rounded-md cursor-pointer transition-colors">
                {uploadingScreen ? (
                  <><span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />Mengupload...</>
                ) : (
                  <><Upload className="w-4 h-4" />Tambah Screenshot</>
                )}
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleScreenshotUpload} disabled={uploadingScreen} />
              </label>
              
              {screenshots.length > 0 && (
                <div className="space-y-4 mt-6">
                  {screenshots.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl items-start">
                      <div className="w-full sm:w-1/3 relative group rounded-md overflow-hidden bg-gray-200 aspect-video shrink-0 border border-gray-200">
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image}`}
                          alt={`Screenshot ${idx}`}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-2 w-full">
                         <textarea
                            value={item.caption}
                            onChange={(e) => updateScreenshotCaption(idx, e.target.value)}
                            placeholder="Tulis penjelasan mendetail dari fitur di foto ini..."
                            className="input-flat flex-1 min-h-[100px] resize-none"
                         />
                         <div className="flex justify-end mt-1">
                            <button
                               type="button"
                               onClick={() => removeScreenshot(idx)}
                               className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 uppercase tracking-wider"
                            >
                               &times; Hapus Foto & Fitur
                            </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
