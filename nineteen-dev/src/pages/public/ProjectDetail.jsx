import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, Calendar, Eye, Share2, MessageCircle, Link as LinkIcon, Download, Loader2, FileArchive } from 'lucide-react';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const ProjectDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setProject(data);
        // Increment view count without throwing errors if it fails
        const incrementView = async () => {
          await supabase.rpc('increment_portfolio_count', { row_id: id, count_type: 'view' });
        };
        incrementView();
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat detail proyek');
    } finally {
      setLoading(false);
    }
  };

  const incrementShare = async () => {
    if (!project) return;
    await supabase.rpc('increment_portfolio_count', { row_id: id, count_type: 'share' });
    setProject(prev => ({ ...prev, share_count: (prev.share_count || 0) + 1 }));
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]{11})/);
    return m ? m[1] : null;
  };

  const handleDownload = async () => {
    if (!project?.download_url) return;
    setDownloading(true);
    try {
      // Ambil ekstensi dari nama file asli, lalu buat nama baru dari judul project
      const originalName = project.download_file_name || project.download_url.split('/').pop();
      const ext = originalName.split('.').pop();
      const safeTitle = project.title.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      const friendlyName = `${safeTitle}.${ext}`;

      const { data, error } = await supabase.storage
        .from('downloads')
        .createSignedUrl(project.download_url, 120, { download: friendlyName });
      if (error) throw error;
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = friendlyName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Mengunduh ${friendlyName}...`, { icon: '📥' });
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh file.');
    } finally {
      setDownloading(false);
    }
  };

  const parseScreenshot = (str) => {
    try {
      const parsed = JSON.parse(str);
      return parsed.image ? parsed : { image: str, caption: '' };
    } catch {
      return { image: str, caption: '' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-2xl font-extrabold text-foreground mb-4">Proyek Tidak Ditemukan</h1>
          <Link to="/projects" className="btn-primary">Kembali ke Projects</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const ytId = getYouTubeId(project.video_url);
  const shareUrl = `${window.location.origin}/projects/${id}`;

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={`${project.title} - nineteen.dev`} 
        description={project.description || ''} 
        url={shareUrl}
      />
      <Toaster position="top-right" />
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container-max">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Projects
          </Link>

          {/* Header Section */}
          <div className="max-w-4xl max-w- mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8 max-w-3xl mx-auto">
              {project.description}
            </p>
            {project.skills && project.skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {project.skills.map((skill, i) => (
                  <span key={i} className="px-4 py-1.5 bg-blue-50 text-primary font-bold text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-6 text-sm font-semibold text-gray-400">
               <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(project.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
               <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-primary" /> {project.view_count || 0} Views</span>
            </div>
          </div>

          {/* Main Media (Video or Image) */}
          <div className="max-w-5xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl bg-gray-50 aspect-video flex relative">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen 
                className="w-full h-full border-0 absolute inset-0"
              />
            ) : project.image_url ? (
              <img
                src={`${SUPABASE_URL}/storage/v1/object/public/portfolio/${project.image_url}`}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          {/* Content & Actions Layout */}
          <div className="max-w-4xl mx-auto">
             <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-12 pb-8 border-b border-gray-100">
                {/* Actions / Share */}
                <div className="flex flex-wrap items-center gap-3">
                   {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      Kunjungi Proyek <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {project.download_url && (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-60 disabled:scale-100 shadow-sm hover:shadow-emerald-500/30 hover:shadow-md"
                    >
                      {downloading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Mengunduh...</>
                      ) : (
                        <><Download className="w-4 h-4" />Unduh {project.download_file_name ? project.download_file_name.split('.').pop().toUpperCase() : 'File'}</>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                        incrementShare();
                        navigator.clipboard.writeText(`Cek proyek "${project.title}"! — ${shareUrl}`);
                        toast.success('Link tersalin!');
                    }}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center hover:scale-110 transition-all font-bold"
                    title="Copy Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Cek proyek keren ini "${project.title}"! — ${shareUrl}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={incrementShare}
                    className="w-12 h-12 bg-[#25D366] hover:bg-[#1daa55] text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-green-500/30"
                    title="Share to WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
             </div>

             {/* Detailed Explanation */}
             {project.content && (
               <div className="prose prose-blue max-w-none mb-16">
                 <h2 className="text-2xl font-extrabold text-foreground mb-6">Tentang Proyek</h2>
                 <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap text-lg">
                   {project.content}
                 </div>
               </div>
             )}

             {/* Feature Breakdown / Galeri dengan Penjelasan */}
             {project.screenshots && project.screenshots.length > 0 && (
               <div className="mb-24 pt-12 border-t border-gray-100">
                 <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-16 text-center">Deskripsi & Bedah Fitur</h2>
                 <div className="space-y-20">
                   {project.screenshots.map(parseScreenshot).map((item, idx) => {
                     const isEven = idx % 2 === 0;
                     return (
                       <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}>
                         {/* Image */}
                         <div className={`w-full ${item.caption ? 'lg:w-3/5' : ''} rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 bg-gray-50 border border-gray-100 group`}>
                           <img 
                             src={`${SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image}`} 
                             alt={`Preview ${idx + 1}`} 
                             className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                             loading="lazy"
                           />
                         </div>
                         {/* Text / Caption */}
                         {item.caption && (
                           <div className="w-full lg:w-2/5 flex flex-col justify-center">
                             <div className="relative pt-4">
                               <div className="absolute -top-8 -left-4 lg:-left-6 text-8xl md:text-9xl font-black text-gray-50 opacity-80 -z-10 select-none tracking-tighter">
                                 {String(idx + 1).padStart(2, '0')}
                               </div>
                               <h3 className="text-2xl font-bold text-foreground mb-4">Sorotan Fitur</h3>
                               <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                                 {item.caption}
                               </p>
                             </div>
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
