import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calculator, HelpCircle } from 'lucide-react';
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

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const EditOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    service_name: '',
    service_price: 0,
    quantity: 1,
    discount: 0,
    tax_percent: 0,
    status: 'pending',
    notes: ''
  });

  const [runEditOrderTour, setRunEditOrderTour] = useState(false);

  const editOrderSteps = [
    {
      target: '#edit-order-header',
      title: '📝 Form Pesanan',
      content: 'Buat atau edit pesanan klien secara manual dari halaman ini.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#edit-order-customer',
      title: '👤 Informasi Pelanggan',
      content: 'Masukkan identitas klien. Jika tidak ada email atau nomor telepon, biarkan kosong.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '#edit-order-service',
      title: '⚡ Detail Layanan',
      content: 'Pilih layanan dari daftar, atau ketik secara manual. Masukkan harga, diskon, dan pajak jika ada.',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '#edit-order-summary',
      title: '🧾 Ringkasan Total',
      content: 'Sistem akan otomatis menghitung Total Harga berdasarkan Diskon dan Pajak yang Anda tentukan.',
      placement: 'top',
      disableBeacon: true,
    }
  ];

  useEffect(() => {
    fetchServices();
    if (isEditing) fetchOrder();
  }, [id]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('title_id', { ascending: true });
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setForm({
          customer_name: data.customer_name || '',
          customer_email: data.customer_email || '',
          customer_phone: data.customer_phone || '',
          customer_address: data.customer_address || '',
          service_name: data.service_name || '',
          service_price: data.service_price || 0,
          quantity: data.quantity || 1,
          discount: data.discount || 0,
          tax_percent: data.tax_percent || 0,
          status: data.status || 'pending',
          notes: data.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Gagal memuat data order');
      navigate('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const calculateTotal = () => {
    const subtotal = form.service_price * form.quantity;
    const afterDiscount = subtotal - form.discount;
    const taxAmount = (afterDiscount * form.tax_percent) / 100;
    return afterDiscount + taxAmount;
  };

  const handleServiceSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId === 'custom') {
      setForm(prev => ({ ...prev, service_name: '', service_price: 0 }));
    } else {
      const service = services.find(s => s.id === selectedId);
      if (service) {
        const priceStr = service.price.replace(/[^\d]/g, '');
        const price = parseInt(priceStr) || 0;
        setForm(prev => ({
          ...prev,
          service_name: service.title_id || service.title_en,
          service_price: price
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.service_name || !form.service_price) {
      alert('Mohon lengkapi data pelanggan dan layanan');
      return;
    }
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      const orderData = {
        ...form,
        total_amount: calculateTotal(),
        user_id: user?.id,
        paid_at: form.status === 'paid' ? new Date().toISOString() : null
      };

      if (isEditing) {
        const { error } = await supabase.from('orders').update(orderData).eq('id', id);
        if (error) throw error;
      } else {
        orderData.invoice_number = generateInvoiceNumber();
        const { error } = await supabase.from('orders').insert([orderData]);
        if (error) throw error;
      }
      navigate('/dashboard/orders');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Gagal menyimpan order: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);


  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-400 font-medium">Memuat data...</p>
      </div>
    </div>
  );

  return (
    <div>
      <SEO title={isEditing ? 'Edit Order' : 'Tambah Order'} />

      <Joyride
        steps={editOrderSteps}
        run={runEditOrderTour}
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
            console.error('[Joyride EditOrder Error]:', JSON.stringify(data));
          }
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunEditOrderTour(false);
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

      {/* Header */}
      <div id="edit-order-header" className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <button
            onClick={() => navigate('/dashboard/orders')}
            className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors"
            >
            <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
            <h1 className="text-2xl font-extrabold text-foreground">
                {isEditing ? 'Edit Order' : 'Tambah Order Baru'}
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Isi data pesanan klien</p>
            </div>
        </div>
        <button type="button" onClick={() => setRunEditOrderTour(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Panduan Form</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div id="edit-order-customer" className="bg-white rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">
              Informasi Pelanggan
            </h2>
            <Field label="Nama Pelanggan" required>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                className="input-flat"
                required
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm(prev => ({ ...prev, customer_email: e.target.value }))}
                className="input-flat"
              />
            </Field>
            <Field label="No. Telepon">
              <input
                type="tel"
                value={form.customer_phone}
                onChange={(e) => setForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="628xxx"
                className="input-flat"
              />
            </Field>
            <Field label="Alamat">
              <textarea
                value={form.customer_address}
                onChange={(e) => setForm(prev => ({ ...prev, customer_address: e.target.value }))}
                rows={3}
                className="input-flat"
              />
            </Field>
          </div>

          {/* Service Info */}
          <div id="edit-order-service" className="bg-white rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">
              Detail Layanan
            </h2>
            <Field label="Pilih dari Daftar Layanan">
              <select onChange={handleServiceSelect} className="input-flat">
                <option value="custom">— Input Manual —</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title_id || service.title_en} — {service.price}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nama Layanan" required>
              <input
                type="text"
                value={form.service_name}
                onChange={(e) => setForm(prev => ({ ...prev, service_name: e.target.value }))}
                className="input-flat"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Harga (Rp)" required>
                <input
                  type="number"
                  value={form.service_price}
                  onChange={(e) => setForm(prev => ({ ...prev, service_price: parseFloat(e.target.value) || 0 }))}
                  className="input-flat"
                  required
                />
              </Field>
              <Field label="Jumlah">
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="input-flat"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Diskon (Rp)">
                <input
                  type="number"
                  min="0"
                  value={form.discount}
                  onChange={(e) => setForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  className="input-flat"
                />
              </Field>
              <Field label="Pajak (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.tax_percent}
                  onChange={(e) => setForm(prev => ({ ...prev, tax_percent: parseFloat(e.target.value) || 0 }))}
                  className="input-flat"
                />
              </Field>
            </div>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="input-flat"
              >
                <option value="pending">Pending</option>
                <option value="paid">Lunas</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </Field>
            <Field label="Catatan">
              <textarea
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="input-flat"
              />
            </Field>
          </div>
        </div>

        {/* Summary */}
        <div id="edit-order-summary" className="mt-6 bg-blue-50 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-primary">Ringkasan</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Subtotal', value: formatCurrency(form.service_price * form.quantity), cls: 'text-foreground' },
              { label: 'Diskon', value: `- ${formatCurrency(form.discount)}`, cls: 'text-red-500' },
              { label: `Pajak ${form.tax_percent}%`, value: formatCurrency(((form.service_price * form.quantity - form.discount) * form.tax_percent) / 100), cls: 'text-foreground' },
              { label: 'TOTAL', value: formatCurrency(calculateTotal()), cls: 'text-primary text-xl' },
            ].map(({ label, value, cls }) => (
              <div key={label}>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
                <p className={`font-extrabold mt-0.5 ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/orders')}
            className="btn-secondary text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : (isEditing ? 'Update Order' : 'Simpan Order')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrder;
