import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { Joyride, STATUS } from 'react-joyride';
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

const colorOptions = [
  { label: 'Biru (Default)', value: 'from-cyan-400 to-blue-500' },
  { label: 'Ungu ke Pink', value: 'from-purple-400 to-pink-500' },
  { label: 'Hijau ke Emerald', value: 'from-green-400 to-emerald-600' },
  { label: 'Kuning ke Orange', value: 'from-yellow-400 to-orange-500' },
  { label: 'Merah ke Pink', value: 'from-red-500 to-pink-500' },
];

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const FeatureList = ({ lang, label, features, onFeatureChange, onAddFeature, onRemoveFeature }) => (
  <Field label={label}>
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={f}
            onChange={(e) => onFeatureChange(i, lang, e.target.value)}
            className="input-flat flex-1"
            placeholder={`Fitur ${i + 1}...`}
          />
          <button type="button" onClick={() => onRemoveFeature(i, lang)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onAddFeature(lang)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-600 transition-colors">
        <Plus className="w-4 h-4" /> Tambah Fitur
      </button>
    </div>
  </Field>
);

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '', title_id: '', price: '',
    time_en: '', time_id: '',
    features_en: [''], features_id: [''],
    color: 'from-cyan-400 to-blue-500', popular: false
  });

  const [runEditServiceTour, setRunEditServiceTour] = useState(false);

  const editServiceSteps = [
    {
      target: '#edit-service-header',
      title: '📝 Form Layanan',
      content: 'Isi detail paket layanan yang akan ditampilkan di halaman depan.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#edit-service-en',
      title: '🇬🇧 Konten Bahasa Inggris',
      content: 'Isi judul, estimasi waktu, dan daftar fitur menggunakan Bahasa Inggris. Pengunjung internasional akan melihat ini.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '#edit-service-id',
      title: '🇮🇩 Konten Bahasa Indonesia',
      content: 'Isi versi terjemahan Bahasa Indonesia. Website Anda otomatis mendukung dua bahasa (bilingual).',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '#edit-service-common',
      title: '⚙️ Detail Umum',
      content: 'Tentukan harga, pilih gradasi warna tema card, dan tandai jika paket ini adalah opsi "Paling Laris" (Popular).',
      placement: 'top',
      disableBeacon: true,
    }
  ];

  useEffect(() => { if (id) fetchService(); }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          features_en: Array.isArray(data.features_en) ? data.features_en : JSON.parse(data.features_en),
          features_id: Array.isArray(data.features_id) ? data.features_id : JSON.parse(data.features_id)
        });
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFeatureChange = (index, lang, value) => {
    const key = `features_${lang}`;
    const arr = [...formData[key]];
    arr[index] = value;
    setFormData(prev => ({ ...prev, [key]: arr }));
  };

  const addFeature = (lang) => {
    const key = `features_${lang}`;
    setFormData(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeFeature = (index, lang) => {
    const key = `features_${lang}`;
    setFormData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const payload = {
        ...formData,
        user_id: user.id,
        features_en: JSON.stringify(formData.features_en.filter(f => f.trim())),
        features_id: JSON.stringify(formData.features_id.filter(f => f.trim()))
      };
      const { error } = id
        ? await supabase.from('services').update(payload).eq('id', id)
        : await supabase.from('services').insert([payload]);
      if (error) throw error;
      navigate('/dashboard/services');
    } catch (error) { alert('Gagal menyimpan: ' + error.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <SEO title={id ? 'Edit Service' : 'Add Service'} />

      <Joyride
        steps={editServiceSteps}
        run={runEditServiceTour}
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
            console.error('[Joyride EditService Error]:', JSON.stringify(data));
          }
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunEditServiceTour(false);
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

      <div id="edit-service-header" className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard/services')} className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
            <h1 className="text-2xl font-extrabold text-foreground">{id ? 'Edit Service' : 'Tambah Service Baru'}</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Isi detail paket layanan</p>
            </div>
        </div>
        <button type="button" onClick={() => setRunEditServiceTour(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Panduan Form</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
        {/* EN + ID columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div id="edit-service-en" className="bg-white rounded-lg p-6 space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">🇬🇧 English</p>
            <Field label="Title (EN)">
              <input type="text" name="title_en" value={formData.title_en} onChange={handleChange} className="input-flat" required />
            </Field>
            <Field label="Estimasi Waktu (EN)">
              <input type="text" name="time_en" value={formData.time_en} onChange={handleChange} placeholder="e.g. 3-5 Days" className="input-flat" required />
            </Field>
            <FeatureList lang="en" label="Features (EN)" features={formData.features_en} onFeatureChange={handleFeatureChange} onAddFeature={addFeature} onRemoveFeature={removeFeature} />
          </div>

          <div id="edit-service-id" className="bg-white rounded-lg p-6 space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">🇮🇩 Indonesia</p>
            <Field label="Judul (ID)">
              <input type="text" name="title_id" value={formData.title_id} onChange={handleChange} className="input-flat" required />
            </Field>
            <Field label="Estimasi Waktu (ID)">
              <input type="text" name="time_id" value={formData.time_id} onChange={handleChange} placeholder="e.g. 3-5 Hari" className="input-flat" required />
            </Field>
            <FeatureList lang="id" label="Fitur (ID)" features={formData.features_id} onFeatureChange={handleFeatureChange} onAddFeature={addFeature} onRemoveFeature={removeFeature} />
          </div>
        </div>

        {/* Common */}
        <div id="edit-service-common" className="bg-white rounded-lg p-6 space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">Detail Umum</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Harga">
              <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. Mulai dari Rp 1.500.000" className="input-flat" required />
            </Field>
            <Field label="Warna Tema">
              <select name="color" value={formData.color} onChange={handleChange} className="input-flat">
                {colorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="popular" id="popular" checked={formData.popular} onChange={handleChange} className="w-4 h-4 accent-primary rounded" />
            <span className="text-sm font-semibold text-foreground">Tandai sebagai Popular</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/dashboard/services')} className="btn-secondary text-sm">Batal</button>
          <button type="submit" disabled={loading} className="btn-primary gap-2 text-sm disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditService;
