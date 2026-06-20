import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Calendar, ArrowRight, X, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ITEMS_PER_PAGE = 9;

const CARD_COLORS = [
  { bg: 'bg-blue-50', dot: 'bg-primary', label: 'text-primary', date: 'text-blue-600' },
  { bg: 'bg-emerald-50', dot: 'bg-secondary', label: 'text-secondary', date: 'text-emerald-600' },
  { bg: 'bg-amber-50', dot: 'bg-accent', label: 'text-amber-600', date: 'text-amber-600' },
  { bg: 'bg-gray-50', dot: 'bg-gray-400', label: 'text-gray-600', date: 'text-gray-500' },
];

const Activities = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async (isLoadMore = false) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const { data, error } = await supabase
        .from('activities').select('*').order('date', { ascending: false }).range(from, from + ITEMS_PER_PAGE - 1);
      if (error) throw error;
      setHasMore(data.length === ITEMS_PER_PAGE);
      if (isLoadMore) {
        setActivities(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      } else {
        setActivities(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO title={t('activities_page_title')} description={t('activities_page_subtitle')} url={`${window.location.origin}/activities`} />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif' } }} />
      <Navbar />

      {/* ── Header ── */}
      <section className="section-secondary pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-white/10 rounded-lg rotate-45 translate-y-1/2" />
        <div className="container-max relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> {t('back_home')}
          </Link>
          <p className="section-label text-emerald-200 mb-3">{t('activities_page_subtitle')}</p>
          <h1 className="section-title-white">{t('activities_page_title')}</h1>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="section-muted py-16">
        <div className="container-max">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-medium">No activities yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act, idx) => {
                const c = CARD_COLORS[idx % CARD_COLORS.length];
                return (
                  <div
                    key={act.id}
                    className={`${c.bg} rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] group`}
                    onClick={() => act.image_url && setSelectedItem(act)}
                  >
                    {act.image_url && (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={`${SUPABASE_URL}/storage/v1/object/public/activities/${act.image_url}`}
                          alt={act.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 ${c.dot} rounded-full`} />
                        <time className={`text-xs font-bold ${c.date} uppercase tracking-wider flex items-center gap-1`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </time>
                      </div>
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{act.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3">{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchActivities(true)}
                disabled={loadingMore}
                className="btn-outline inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? (
                  <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading...</>
                ) : (
                  <>{t('load_more')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center text-white z-50"
            onClick={() => setSelectedItem(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center max-w-3xl w-full gap-4" onClick={e => e.stopPropagation()}>
            <img
              src={`${SUPABASE_URL}/storage/v1/object/public/activities/${selectedItem.image_url}`}
              alt={selectedItem.title}
              className="max-w-full max-h-[65vh] object-contain rounded-lg"
            />
            <div className="bg-white rounded-lg p-4 w-full flex items-center justify-between gap-4">
              <span className="font-bold text-foreground truncate">{selectedItem.title}</span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { navigator.clipboard.writeText(`${selectedItem.title} — https://nineteen.dev/`); toast.success('Copied!'); }}
                  className="w-9 h-9 bg-muted hover:bg-gray-200 rounded-md flex items-center justify-center hover:scale-110 transition-all"
                >
                  <LinkIcon className="w-4 h-4 text-gray-600" />
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`"${selectedItem.title}" — https://nineteen.dev/`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-[#25D366] hover:bg-[#1daa55] rounded-md flex items-center justify-center hover:scale-110 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
