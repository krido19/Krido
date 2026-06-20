import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, ExternalLink, Eye, Share2, X, Play, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ITEMS_PER_PAGE = 6;

const Projects = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState(['All']);
  const [selectedCat, setSelectedCat] = useState('All');

  useEffect(() => { fetchProjects(); }, []);


  const fetchProjects = async (isLoadMore = false) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('is_pinned', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(from, from + ITEMS_PER_PAGE - 1);
      if (error) throw error;
      setHasMore(data.length === ITEMS_PER_PAGE);
      if (isLoadMore) {
        setPortfolio(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      } else {
        setPortfolio(data);
        // Extract categories
        const { data: allData } = await supabase.from('portfolio').select('skills');
        if (allData) {
          const allSkills = allData.flatMap(i => i.skills || []);
          setCategories(['All', ...new Set(allSkills)]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filtered = portfolio.filter(p => selectedCat === 'All' || (p.skills && p.skills.includes(selectedCat)));



  return (
    <div className="min-h-screen bg-white">
      <SEO title={t('projects_title')} description={t('projects_subtitle')} url={`${window.location.origin}/projects`} />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif' } }} />
      <Navbar />

      {/* ── Header ── */}
      <section className="section-primary pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-lg rotate-45 translate-y-1/2" />
        <div className="container-max relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> {t('back_home')}
          </Link>
          <p className="section-label text-blue-200 mb-3">{t('projects_subtitle')}</p>
          <h1 className="section-title-white">{t('projects_title')}</h1>
        </div>
      </section>

      {/* ── Filter + Grid ── */}
      <section className="section-white py-16">
        <div className="container-max">
          {/* Category filter */}
          {!loading && categories.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                    selectedCat === cat
                      ? 'bg-primary text-white scale-105'
                      : 'bg-muted text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? t('filter_all') : cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-medium">No projects found for selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    if (e.target.closest('button,a')) return;
                    navigate('/projects/' + item.id);
                  }}
                  className="group bg-blue-50 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  {item.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={`${SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image_url}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{item.description}</p>

                    {item.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.skills.map((s, i) => <span key={i} className="tag-blue">{s}</span>)}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs font-semibold text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-primary" />{item.view_count || 0}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-secondary" />{item.share_count || 0}</span>
                      </div>
                      {item.project_url && (
                        <button
                          className="flex items-center gap-1 text-xs font-bold text-white bg-primary px-3 py-2 rounded-md hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                          onClick={(e) => { e.stopPropagation(); window.open(item.project_url, '_blank', 'noopener,noreferrer'); }}
                        >
                          {t('view_project')} <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && hasMore && selectedCat === 'All' && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchProjects(true)}
                disabled={loadingMore}
                className="btn-outline inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? (
                  <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading...</>
                ) : t('load_more')}
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
