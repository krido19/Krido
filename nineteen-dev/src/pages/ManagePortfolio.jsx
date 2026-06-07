import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink, Briefcase, Pin, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';
import AppJoyride from '../components/AppJoyride';
import { useTour } from '../hooks/useTour';

const ManagePortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const ITEMS_PER_PAGE = 9;
  const navigate = useNavigate();

  const { runTour, handleJoyrideCallback } = useTour('portfolio', !loading);

  useEffect(() => { 
    fetchPortfolio(); 
  }, []);

  const fetchPortfolio = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else { setLoading(true); setPage(0); }

      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('is_pinned', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setHasMore(data.length >= ITEMS_PER_PAGE);

      if (isLoadMore) {
        setPortfolio(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      } else {
        setPortfolio(data);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const togglePin = async (item) => {
    try {
      const { error } = await supabase
        .from('portfolio')
        .update({ is_pinned: !item.is_pinned })
        .eq('id', item.id);
      if (error) throw error;
      setPortfolio(prev =>
        prev.map(p => p.id === item.id ? { ...p, is_pinned: !p.is_pinned } : p)
          .sort((a, b) => {
            if (a.is_pinned === b.is_pinned) return new Date(b.created_at) - new Date(a.created_at);
            return a.is_pinned ? -1 : 1;
          })
      );
    } catch (error) {
      alert('Gagal mengubah status pin');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) throw error;
      setPortfolio(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <SEO title="Manage Portfolio" />

      <AppJoyride
        steps={[
          {
            target: '#page-title',
            title: '🎨 Etalase Portfolio',
            content: 'Ini adalah halaman utama untuk memamerkan karya dan studi kasus Anda.',
            placement: 'bottom',
            disableBeacon: true,
          },
          {
            target: '#add-portfolio-btn',
            title: '➕ Tambah Proyek Baru',
            content: 'Klik tombol ini untuk mengunggah proyek baru Anda kapan saja.',
            placement: 'left',
            disableBeacon: true,
          },
          {
            target: '#portfolio-list',
            title: '📋 Daftar Etalase',
            content: 'Semua proyek Anda akan tampil di area ini. Anda bisa mengedit, menghapus, atau mem-pin proyek terbaik ke atas.',
            placement: 'top',
            disableBeacon: true,
          }
        ]}
        run={runTour}
        callback={(data) => {
          handleJoyrideCallback(data);
          if (['finished', 'skipped'].includes(data.status)) {
            navigate('/dashboard');
          }
        }}
      />

      <div className="flex items-center justify-between mb-8">
        <div id="page-title">
          <h1 className="text-2xl font-extrabold text-foreground">Portfolio</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Kelola proyek-proyek kamu</p>
        </div>
        <Link id="add-portfolio-btn" to="/portfolio/new" className="btn-primary gap-2 text-sm relative z-10">
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : portfolio.length === 0 ? (
        <div id="portfolio-list" className="bg-white rounded-lg p-16 text-center">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-400 mb-3">Belum ada proyek</p>
          <Link to="/portfolio/new" className="text-primary font-bold text-sm hover:underline">
            Tambah proyek pertama
          </Link>
        </div>
      ) : (
        <div id="portfolio-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <div key={item.id} className={`bg-white rounded-lg overflow-hidden group transition-all duration-200 hover:scale-[1.02] ${item.is_pinned ? 'ring-2 ring-amber-400' : ''}`}>
              {item.image_url && (
                <div className="h-44 overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image_url}`}
                    alt={item.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="font-extrabold text-foreground text-base line-clamp-1 flex-1">{item.title}</h2>
                  {item.is_pinned && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-md shrink-0">PINNED</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {item.project_url ? (
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-emerald-600 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Lihat Proyek
                    </a>
                  ) : <span />}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(item)}
                      className={`p-2 rounded-md transition-colors ${
                        item.is_pinned
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                          : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={item.is_pinned ? 'Unpin' : 'Pin ke atas'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/portfolio/edit/${item.id}`)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && hasMore && portfolio.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchPortfolio(true)}
            disabled={loadingMore}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                Memuat...
              </span>
            ) : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-foreground mb-2">Hapus Proyek?</h3>
            <p className="text-sm text-gray-500 mb-6">Proyek ini akan dihapus permanen dan tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary text-sm py-2.5">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePortfolio;
