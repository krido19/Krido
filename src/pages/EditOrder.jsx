import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calculator } from 'lucide-react';

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

    useEffect(() => {
        fetchServices();
        if (isEditing) {
            fetchOrder();
        }
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
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

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
        const discountAmount = form.discount;
        const afterDiscount = subtotal - discountAmount;
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
                // Parse price from string like "Rp 500.000" or "2.500.000"
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
                const { error } = await supabase
                    .from('orders')
                    .update(orderData)
                    .eq('id', id);

                if (error) throw error;
            } else {
                orderData.invoice_number = generateInvoiceNumber();
                const { error } = await supabase
                    .from('orders')
                    .insert([orderData]);

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate('/dashboard/orders')}
                    className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 tracking-wider">
                    {isEditing ? 'Edit Order' : 'Tambah Order Baru'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customer Info */}
                    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Informasi Pelanggan</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Nama Pelanggan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.customer_name}
                                    onChange={(e) => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={form.customer_email}
                                    onChange={(e) => setForm(prev => ({ ...prev, customer_email: e.target.value }))}
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">No. Telepon</label>
                                <input
                                    type="tel"
                                    value={form.customer_phone}
                                    onChange={(e) => setForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                                    placeholder="628xxx"
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Alamat</label>
                                <textarea
                                    value={form.customer_address}
                                    onChange={(e) => setForm(prev => ({ ...prev, customer_address: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Detail Layanan</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Pilih Layanan</label>
                                <select
                                    onChange={handleServiceSelect}
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                >
                                    <option value="custom">-- Input Manual --</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.title_id || service.title_en} - {service.price}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Nama Layanan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.service_name}
                                    onChange={(e) => setForm(prev => ({ ...prev, service_name: e.target.value }))}
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Harga <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={form.service_price}
                                        onChange={(e) => setForm(prev => ({ ...prev, service_price: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Jumlah</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.quantity}
                                        onChange={(e) => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Diskon (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.discount}
                                        onChange={(e) => setForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Pajak (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.tax_percent}
                                        onChange={(e) => setForm(prev => ({ ...prev, tax_percent: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Lunas</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Catatan</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Summary */}
                <div className="mt-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                        <Calculator className="w-5 h-5 text-orange-400 mr-2" />
                        <h2 className="text-lg font-bold text-white">Ringkasan</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Subtotal:</span>
                            <p className="text-white font-medium">{formatCurrency(form.service_price * form.quantity)}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Diskon:</span>
                            <p className="text-red-400 font-medium">- {formatCurrency(form.discount)}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Pajak ({form.tax_percent}%):</span>
                            <p className="text-white font-medium">
                                {formatCurrency(((form.service_price * form.quantity - form.discount) * form.tax_percent) / 100)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400">Total:</span>
                            <p className="text-2xl font-bold text-orange-400">{formatCurrency(calculateTotal())}</p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/orders')}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Menyimpan...' : (isEditing ? 'Update Order' : 'Simpan Order')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditOrder;
