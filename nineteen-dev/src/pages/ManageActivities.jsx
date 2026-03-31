import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, Activity } from 'lucide-react';
import SEO from '../components/SEO';

const ManageActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const ITEMS_PER_PAGE = 9;
  const navigate = useNavigate();

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else { setLoading(true); setPage(0); }

      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setHasMore(data.length >= ITEMS_PER_PAGE);

      if (isLoadMore) {
        setActivities(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      } else {
        setActivities(data);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
      setActivities(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <SEO title="Manage Activities" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Activities</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Kelola timeline aktivitas kamu</p>
        </div>
        <Link to="/dashboard/activities/new" className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center">
          <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-400 mb-3">Belum ada aktivitas</p>
          <Link to="/dashboard/activities/new" className="text-primary font-bold text-sm hover:underline">
            Tambah aktivitas pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden group transition-all duration-200 hover:scale-[1.02]">
              {item.image_url && (
                <div className="h-44 overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/activities/${item.image_url}`}
                    alt={item.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <h2 className="font-extrabold text-foreground text-base mb-1 line-clamp-1">{item.title}</h2>
                <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>
                <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/dashboard/activities/edit/${item.id}`)}
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
          ))}
        </div>
      )}

      {!loading && hasMore && activities.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchActivities(true)}
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
            <h3 className="text-lg font-extrabold text-foreground mb-2">Hapus Aktivitas?</h3>
            <p className="text-sm text-gray-500 mb-6">Aktivitas ini akan dihapus permanen dan tidak dapat dikembalikan.</p>
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

export default ManageActivities;
