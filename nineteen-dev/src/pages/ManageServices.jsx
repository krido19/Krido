import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import { Joyride, STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import TourTooltip from '../components/TourTooltip';

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

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const [runServicesTour, setRunServicesTour] = useState(false);

  const servicesSteps = [
    {
      target: '#services-page-title',
      title: '⚡ Etalase Layanan',
      content: 'Di sini Anda dapat menjual jasa atau paket layanan profesional Anda.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#add-service-btn',
      title: '➕ Tambah Layanan Baru',
      content: 'Klik di sini untuk membuat paket layanan baru beserta detail harga dan estimasi pengerjaannya.',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '#services-list',
      title: '📋 Daftar Layanan',
      content: 'Kelola semua paket jasa Anda: edit detailnya, atau hapus jika sudah tidak berlaku.',
      placement: 'top',
      disableBeacon: true,
    }
  ];

  useEffect(() => {
    if (!loading && sessionStorage.getItem('servicesTourPending') === 'true') {
      sessionStorage.removeItem('servicesTourPending');
      
      const checkAndStart = () => {
        const titleEl = document.querySelector('#services-page-title');
        const btnEl = document.querySelector('#add-service-btn');
        const listEl = document.querySelector('#services-list');
        
        if (titleEl && btnEl && listEl) {
          setRunServicesTour(true);
        } else {
          setTimeout(checkAndStart, 300);
        }
      };
      
      const timer = setTimeout(checkAndStart, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setServices(services.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Gagal menghapus layanan');
    }
  };

  return (
    <div>
      <SEO title="Manage Services" />

      <Joyride
        steps={servicesSteps}
        run={runServicesTour}
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
            console.error('[Joyride ManageServices Error]:', JSON.stringify(data));
          }
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            localStorage.setItem('servicesTourCompleted', 'true');
            setRunServicesTour(false);
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
        <div id="services-page-title">
          <h1 className="text-2xl font-extrabold text-foreground">Services</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Kelola harga & paket layanan kamu</p>
        </div>
        <Link id="add-service-btn" to="/dashboard/services/new" className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div id="services-list" className="bg-white rounded-lg p-16 text-center">
          <Zap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-400 mb-3">Belum ada layanan</p>
          <Link to="/dashboard/services/new" className="text-primary font-bold text-sm hover:underline">
            Buat layanan pertama
          </Link>
        </div>
      ) : (
        <div id="services-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-lg p-5 transition-all duration-200 hover:scale-[1.02] ${service.popular ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-foreground text-base">{service.title_id}</h3>
                    {service.popular && (
                      <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-md">POPULAR</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{service.title_en}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <Link
                    to={`/dashboard/services/edit/${service.id}`}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(service.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <span className="inline-block px-3 py-1 bg-blue-50 text-primary text-sm font-extrabold rounded-md">
                  {service.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-foreground mb-2">Hapus Layanan?</h3>
            <p className="text-sm text-gray-500 mb-6">Layanan ini akan dihapus permanen dan tidak dapat dikembalikan.</p>
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

export default ManageServices;
