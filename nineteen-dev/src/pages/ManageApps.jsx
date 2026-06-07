import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Smartphone, Download, Pin } from 'lucide-react';
import SEO from '../components/SEO';
import { Joyride, STATUS } from 'react-joyride';
import TourTooltip from '../components/TourTooltip';
import { useNavigate } from 'react-router-dom';

const AutoClickBeacon = React.forwardRef((props, ref) => {
  const localRef = React.useRef(null);
  const combinedRef = ref || localRef;

  useEffect(() => {
    if (combinedRef && combinedRef.current) {
      combinedRef.current.click();
    }
  }, [combinedRef]);

  const { continuous, index, isLastStep, size, step, ...domProps } = props;

  return (
    <span
      ref={combinedRef}
      {...domProps}
      style={{ opacity: 0, position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
    />
  );
});

const ManageApps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const ITEMS_PER_PAGE = 9;
  const navigate = useNavigate();

  const [runAppsTour, setRunAppsTour] = useState(false);

  const appsSteps = [
    {
      target: '#apps-page-title',
      title: '📦 Etalase Aplikasi',
      content: 'Di sinilah semua produk digital atau aplikasi yang Anda rilis akan ditampilkan.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#add-app-btn',
      title: '➕ Tambah Aplikasi',
      content: 'Klik tombol ini untuk mengunggah file APK dan merilis aplikasi baru.',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '#apps-list',
      title: '📱 Daftar Rilis',
      content: 'Kelola aplikasi Anda: pantau jumlah unduhan, edit detail, pin ke atas, atau hapus rilis yang sudah usang.',
      placement: 'top',
      disableBeacon: true,
    }
  ];

  useEffect(() => {
    if (!loading && sessionStorage.getItem('appsTourPending') === 'true') {
      sessionStorage.removeItem('appsTourPending');
      
      const checkAndStart = () => {
        const titleEl = document.querySelector('#apps-page-title');
        const btnEl = document.querySelector('#add-app-btn');
        const listEl = document.querySelector('#apps-list');
        
        if (titleEl && btnEl && listEl) {
          setRunAppsTour(true);
        } else {
          setTimeout(checkAndStart, 300);
        }
      };
      
      const timer = setTimeout(checkAndStart, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else { setLoading(true); setPage(0); }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, error } = await supabase
          .from('app_releases')
          .select('*')
          .eq('user_id', user.id)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        setHasMore(data.length >= ITEMS_PER_PAGE);

        if (isLoadMore) {
          setApps(prev => [...prev, ...data]);
          setPage(prev => prev + 1);
        } else {
          setApps(data);
        }
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const togglePin = async (app) => {
    try {
      const { error } = await supabase
        .from('app_releases')
        .update({ is_pinned: !app.is_pinned })
        .eq('id', app.id);
      if (error) throw error;
      setApps(prev =>
        prev.map(a => a.id === app.id ? { ...a, is_pinned: !a.is_pinned } : a)
          .sort((a, b) => {
            if (a.is_pinned === b.is_pinned) return new Date(b.created_at) - new Date(a.created_at);
            return a.is_pinned ? -1 : 1;
          })
      );
    } catch (error) {
      alert('Gagal mengubah status pin');
    }
  };

  const handleDelete = async (item) => {
    try {
      if (item.apkUrl) {
        await supabase.storage.from('apks').remove([item.apkUrl]);
      }
      const { error } = await supabase.from('app_releases').delete().eq('id', item.id);
      if (error) throw error;
      setApps(prev => prev.filter(a => a.id !== item.id));
      setDeleteConfirm(null);
    } catch (error) {
      alert('Gagal menghapus aplikasi');
    }
  };

  return (
    <div>
      <SEO title="Manage Apps" />

      <Joyride
        steps={appsSteps}
        run={runAppsTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        scrollToFirstStep={true}
        disableScrolling={false}
        disableScrollParentFix={true}
        scrollDuration={500}
        spotlightClicks={false}
        beaconComponent={AutoClickBeacon}
        tooltipComponent={TourTooltip}
        callback={(data) => {
          const { status, type } = data;
          if (type === 'error') {
            console.error('[Joyride ManageApps Error]:', JSON.stringify(data));
          }
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            localStorage.setItem('appsTourCompleted', 'true');
            setRunAppsTour(false);
            navigate('/dashboard');
          }
        }}
        locale={{ back: 'Kembali', close: 'Tutup', last: 'Selesai ✔', next: 'Lanjut', skip: 'Lewati' }}
        styles={{
          options: { primaryColor: '#06b6d4', zIndex: 10000 },
          tooltip: { borderRadius: 14, padding: 20 },
          tooltipTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
          tooltipContent: { fontSize: 13, padding: '8px 0' },
        }}
      />

      <div className="flex items-center justify-between mb-8">
        <div id="apps-page-title">
          <h1 className="text-2xl font-extrabold text-foreground">Applications</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Kelola rilis aplikasi yang bisa diunduh</p>
        </div>
        <Link id="add-app-btn" to="/dashboard/apps/new" className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div id="apps-list" className="bg-white rounded-lg p-16 text-center">
          <Smartphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-400 mb-3">Belum ada aplikasi</p>
          <Link to="/dashboard/apps/new" className="text-primary font-bold text-sm hover:underline">
            Upload aplikasi pertama
          </Link>
        </div>
      ) : (
        <div id="apps-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`bg-white rounded-lg p-5 transition-all duration-200 hover:scale-[1.02] ${app.is_pinned ? 'ring-2 ring-amber-400' : ''}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {app.image_url ? (
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/apks/${app.image_url}`}
                      alt={app.app_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Smartphone className="w-7 h-7 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-foreground text-base">{app.app_name}</h3>
                    {app.is_pinned && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-md">PINNED</span>
                    )}
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-primary text-xs font-bold rounded-md mt-1">
                    v{app.version}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{app.description || 'No description provided.'}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Download className="w-3.5 h-3.5" />
                  {app.download_count} downloads
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(app)}
                    className={`p-2 rounded-md transition-colors ${app.is_pinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                    title={app.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/dashboard/apps/edit/${app.id}`}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm({ id: app.id, apkUrl: app.apk_url })}
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

      {!loading && hasMore && apps.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchApps(true)}
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
            <h3 className="text-lg font-extrabold text-foreground mb-2">Hapus Aplikasi?</h3>
            <p className="text-sm text-gray-500 mb-6">Aplikasi dan file APK-nya akan dihapus permanen.</p>
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

export default ManageApps;
