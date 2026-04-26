import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, CreditCard, RefreshCw, Copy, Check, ExternalLink, Trash2, X, Eye, Download, CheckCircle, Clock, BarChart, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { listPayments, checkPayment } from '../utils/bayargg';
import { checkTransaction } from '../utils/pakasir';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700' },
    paid: { label: 'Lunas', cls: 'bg-emerald-50 text-emerald-700' },
    completed: { label: 'Lunas', cls: 'bg-emerald-50 text-emerald-700' },
    expired: { label: 'Kadaluarsa', cls: 'bg-gray-100 text-gray-500' },
    cancelled: { label: 'Dibatalkan', cls: 'bg-red-50 text-red-600' },
};

const METHOD_LABEL = {
    qris: 'QRIS',
    gopay_qris: 'GoPay QRIS',
    qris_user: 'BRI QRIS',
    ovo: 'OVO',
    // Pakasir
    bni_va: 'BNI VA',
    bri_va: 'BRI VA',
    cimb_niaga_va: 'CIMB Niaga VA',
    permata_va: 'Permata VA',
    maybank_va: 'Maybank VA',
    atm_bersama_va: 'ATM Bersama',
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const formatDate = (d) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const ManagePayments = () => {
    const navigate = useNavigate();

    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [checkingId, setCheckingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [hiddenPayments, setHiddenPayments] = useState(() => {
        try {
            const saved = localStorage.getItem('bayargg_hidden_payments');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [pakasirPayments, setPakasirPayments] = useState([]);

    const fetchPayments = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const data = await listPayments({
                page,
                limit: 15,
                status: statusFilter,
                search: searchTerm,
            });
            setPayments(data.data || []);
            setPagination(data.pagination || { page: 1, total: 0, total_pages: 1 });
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm]);

    const fetchPakasirPayments = useCallback(async () => {
        try {
            let query = supabase
                .from('payment_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter) {
                // Pakasir 'paid' bisa tersimpan sebagai 'completed'
                if (statusFilter === 'paid') {
                    query = query.in('status', ['paid', 'completed']);
                } else {
                    query = query.eq('status', statusFilter);
                }
            }
            if (searchTerm) {
                query = query.or(`invoice_id.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            // Tambah _provider agar cocok dengan format gabungan
            setPakasirPayments((data || []).map(p => ({ ...p, _provider: 'pakasir' })));
        } catch (err) {
            console.error('Error fetching pakasir payments:', err);
        }
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayments(1);
            fetchPakasirPayments();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchPayments, fetchPakasirPayments]);

    // Background Polling for Pending Transactions
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            const currentAllPayments = [...pakasirPayments, ...payments];
            const pendingInvoices = currentAllPayments.filter(p => p.status === 'pending' && !hiddenPayments.includes(p.invoice_id));

            if (pendingInvoices.length > 0 && !loading) {
                const invoice = pendingInvoices[0];
                if (invoice._provider === 'pakasir') {
                    checkTransaction(invoice.invoice_id, invoice.amount).then(async res => {
                        if (res.transaction && res.transaction.status !== 'pending') {
                            const newStatus = res.transaction.status;
                            const paidAt = res.transaction.completed_at;
                            // Update Supabase
                            await supabase.from('payment_logs')
                                .update({ status: newStatus, paid_at: paidAt })
                                .eq('invoice_id', invoice.invoice_id);
                            // Update state lokal
                            setPakasirPayments(prev => prev.map(p =>
                                p.invoice_id === invoice.invoice_id ? { ...p, status: newStatus, paid_at: paidAt } : p
                            ));
                            // Sync ke Orders
                            supabase.from('orders').update({ status: 'paid', paid_at: paidAt }).eq('invoice_number', invoice.invoice_id).then(() => { });
                            // Toast notification
                            toast.success(`✅ Tagihan ${invoice.invoice_id} telah dilunasi!`, { duration: 7000 });
                        }
                    }).catch(() => { });
                } else {
                    checkPayment(invoice.invoice_id).then(res => {
                        if (res.status !== 'pending' && (res.status === 'paid' || res.status === 'completed')) {
                            setPayments(prev => prev.map(p => p.invoice_id === invoice.invoice_id ? { ...p, status: res.status, paid_at: res.paid_at } : p));
                            // Sync ke Orders
                            supabase.from('orders').update({ status: 'paid', paid_at: res.paid_at }).eq('invoice_number', invoice.invoice_id).then(() => { });
                            // Toast notification
                            toast.success(`✅ Tagihan ${invoice.invoice_id} telah dilunasi!`, { duration: 7000 });
                        }
                    }).catch(() => { });
                }
            }
        }, 30000); // 30 seconds
        return () => clearInterval(pollInterval);
    }, [payments, pakasirPayments, loading, hiddenPayments]);

    const handleCheckStatus = async (invoiceId, provider, amount) => {
        try {
            setCheckingId(invoiceId);
            if (provider === 'pakasir') {
                console.log(`[pakasir] Checking status for ${invoiceId} amount ${amount}...`);
                const res = await checkTransaction(invoiceId, amount);
                console.log(`[pakasir] Cek Status response:`, JSON.stringify(res, null, 2));
                const status = res.transaction.status;
                const paidAt = res.transaction.completed_at;
                // Update Supabase
                await supabase.from('payment_logs')
                    .update({ status, paid_at: paidAt })
                    .eq('invoice_id', invoiceId);
                // Update state lokal
                setPakasirPayments(prev =>
                    prev.map(p => p.invoice_id === invoiceId ? { ...p, status, paid_at: paidAt } : p)
                );
                if (status === 'completed' || status === 'paid') {
                    await supabase.from('orders').update({ status: 'paid', paid_at: paidAt }).eq('invoice_number', invoiceId);
                    toast.success(`✅ Tagihan ${invoiceId} telah dilunasi!`);
                }
            } else {
                const res = await checkPayment(invoiceId);
                const isPaid = res.status === 'paid' || res.status === 'completed';
                setPayments((prev) =>
                    prev.map((p) =>
                        p.invoice_id === invoiceId ? { ...p, status: res.status, paid_at: res.paid_at } : p
                    )
                );
                if (isPaid) {
                    await supabase.from('orders').update({ status: 'paid', paid_at: res.paid_at }).eq('invoice_number', invoiceId);
                    toast.success(`✅ Tagihan ${invoiceId} telah dilunasi!`);
                }
            }
        } catch (err) {
            console.error('[check_status_error] Error checking payment:', err);
            toast.error('Gagal mengecek status pembayaran.');
        } finally {
            setCheckingId(null);
        }
    };

    const handleCopy = (url, id) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleHide = (invoiceId) => {
        if (!window.confirm('Apakah Anda yakin ingin menyembunyikan pembayaran ini dari daftar? (Hanya disembunyikan di perangkat ini)')) return;
        const newHidden = [...hiddenPayments, invoiceId];
        setHiddenPayments(newHidden);
        localStorage.setItem('bayargg_hidden_payments', JSON.stringify(newHidden));
    };

    const localPakasirFiltered = pakasirPayments.filter((p) => {
        if (statusFilter && p.status !== statusFilter) {
            if (!(statusFilter === 'paid' && p.status === 'completed')) return false;
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return p.invoice_id?.toLowerCase().includes(term) || p.customer_name?.toLowerCase().includes(term) || p.customer_email?.toLowerCase().includes(term);
        }
        return true;
    });

    const allPayments = [...localPakasirFiltered, ...payments];
    const displayPayments = allPayments.filter((p) => !hiddenPayments.includes(p.invoice_id));

    // Stats Calculations (Bulan Ini)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const isThisMonth = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const stats = displayPayments.reduce((acc, p) => {
        if (p.status === 'paid' || p.status === 'completed') {
            acc.totalLunas += (p.final_amount ?? p.amount);
            if (isThisMonth(p.paid_at || p.created_at)) acc.lunasBulanIni += (p.final_amount ?? p.amount);
        } else if (p.status === 'pending') {
            acc.totalPending += (p.final_amount ?? p.amount);
        }
        acc.totalTransaksi++;
        return acc;
    }, { totalLunas: 0, lunasBulanIni: 0, totalPending: 0, totalTransaksi: 0 });

    const exportCSV = () => {
        const headers = ["Invoice ID", "Provider", "Customer Name", "Customer Email", "Metode", "Status", "Nominal", "Tanggal Dibuat", "Tanggal Lunas"];
        const rows = displayPayments.map(p => [
            p.invoice_id,
            p._provider || 'bayar.gg',
            p.customer_name || '-',
            p.customer_email || '-',
            METHOD_LABEL[p.payment_method] || p.payment_method,
            p.status,
            p.final_amount ?? p.amount,
            p.created_at ? new Date(p.created_at).toLocaleString('id-ID') : '-',
            p.paid_at ? new Date(p.paid_at).toLocaleString('id-ID') : '-'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Data_Pembayaran_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <SEO title="Manage Payments" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Payments</h1>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">
                        Kelola data pembayaran (bayar.gg & Pakasir)
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportCSV}
                        disabled={displayPayments.length === 0}
                        className="btn-secondary gap-2 text-sm disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/payments/new')}
                        className="btn-primary gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Buat Pembayaran
                    </button>
                </div>
            </div>

            {/* Dashboard Stat Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Lunas Bulan Ini</p>
                        <h3 className="text-xl font-extrabold text-gray-900">{formatCurrency(stats.lunasBulanIni)}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                        <BarChart className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Pencairan</p>
                        <h3 className="text-xl font-extrabold text-gray-900">{formatCurrency(stats.totalLunas)}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Tertunda</p>
                        <h3 className="text-xl font-extrabold text-gray-900">{formatCurrency(stats.totalPending)}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Invoice</p>
                        <h3 className="text-xl font-extrabold text-gray-900">{stats.totalTransaksi} Transaksi</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari invoice, nama, email, HP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-flat pl-10"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-flat pl-10 pr-8 appearance-none cursor-pointer w-full sm:w-auto"
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="paid">Lunas</option>
                        <option value="expired">Kadaluarsa</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>
                </div>
                <button
                    onClick={() => fetchPayments(pagination.page)}
                    className="btn-secondary gap-2 text-sm shrink-0"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-lg p-12 text-center">
                    <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Memuat data...</p>
                </div>
            ) : displayPayments.length === 0 ? (
                <div className="bg-white rounded-lg p-16 text-center">
                    <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="font-semibold text-gray-400">Belum ada data pembayaran</p>
                    <p className="text-sm text-gray-300 mt-1">Klik "Buat Pembayaran" untuk transaksi pertama</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    {['Invoice', 'Customer', 'Jumlah', 'Metode', 'Status', 'Tanggal', 'Aksi'].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayPayments.map((p) => {
                                    const { label, cls } = STATUS_CONFIG[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <tr key={p.invoice_id} className="border-b border-gray-50 hover:bg-muted/50 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <button
                                                    onClick={() => setSelectedPayment(p)}
                                                    className="font-mono text-xs font-bold text-primary hover:text-blue-700 hover:underline text-left"
                                                >
                                                    {p.invoice_id}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-foreground text-sm">{p.customer_name || '—'}</p>
                                                {p.customer_email && (
                                                    <p className="text-xs text-gray-400">{p.customer_email}</p>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-sm font-bold text-foreground whitespace-nowrap">
                                                {formatCurrency(p.final_amount ?? p.amount)}
                                                {p.unique_code > 0 && (
                                                    <span className="block text-xs font-normal text-gray-400">
                                                        +kode {p.unique_code}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                    {METHOD_LABEL[p.payment_method] || p.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${cls}`}>{label}</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-gray-400 whitespace-nowrap">
                                                {p.created_at ? formatDate(p.created_at) : '—'}
                                                {p.paid_at && (
                                                    <p className="text-emerald-600 font-semibold">
                                                        Bayar: {formatDate(p.paid_at)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1">
                                                    {/* Cek Status */}
                                                    {p.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCheckStatus(p.invoice_id, p._provider, p.amount)}
                                                            disabled={checkingId === p.invoice_id}
                                                            className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                                                            title="Cek Status"
                                                        >
                                                            <RefreshCw className={`w-3.5 h-3.5 ${checkingId === p.invoice_id ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    )}
                                                    {/* WhatsApp Reminder */}
                                                    {p.status === 'pending' && (
                                                        <a
                                                            href={`https://api.whatsapp.com/send?phone=${p.customer_phone ? p.customer_phone.replace(/^0/, '62') : ''}&text=${encodeURIComponent(`Halo ${p.customer_name || 'Kak'},\n\nIni pengingat tagihan Anda sebesar *${formatCurrency(p.final_amount ?? p.amount)}* dengan Invoice *${p.invoice_id}*.\n\nSilakan selesaikan pembayaran di: ${window.location.origin}/invoice/${p.invoice_id}\n\nTerima kasih!`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                            title="Kirim Pesan WhatsApp"
                                                        >
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                    {/* Copy Link */}
                                                    {p.payment_url && (
                                                        <button
                                                            onClick={() => handleCopy(p.payment_url, p.invoice_id)}
                                                            className="p-2 text-gray-400 hover:text-secondary hover:bg-emerald-50 rounded-md transition-colors"
                                                            title="Copy Link Bayar"
                                                        >
                                                            {copiedId === p.invoice_id
                                                                ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                : <Copy className="w-3.5 h-3.5" />
                                                            }
                                                        </button>
                                                    )}
                                                    {/* Buka Link */}
                                                    {p.payment_url && (
                                                        <a
                                                            href={p.payment_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                                            title="Buka Halaman Bayar"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                    {/* Hide */}
                                                    <button
                                                        onClick={() => handleHide(p.invoice_id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Sembunyikan Pembayaran"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Halaman {pagination.page} dari {pagination.total_pages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchPayments(pagination.page - 1)}
                                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Prev
                                </button>
                                <button
                                    disabled={pagination.page >= pagination.total_pages}
                                    onClick={() => fetchPayments(pagination.page + 1)}
                                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Detail Pembayaran */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Detail Transaksi</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedPayment.invoice_id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Status</p>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${STATUS_CONFIG[selectedPayment.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_CONFIG[selectedPayment.status]?.label || selectedPayment.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Total Pembayaran</p>
                                    <p className="font-extrabold text-gray-900 text-base">{formatCurrency(selectedPayment.final_amount ?? selectedPayment.amount)}</p>
                                </div>

                                <div className="col-span-2 border-t border-gray-100 mt-2 pt-4">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Provider & Metode</p>
                                    <p className="font-medium text-gray-900">
                                        <span className="capitalize">{selectedPayment._provider || 'bayar.gg'}</span> - {METHOD_LABEL[selectedPayment.payment_method] || selectedPayment.payment_method}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Tanggal Dibuat</p>
                                    <p className="font-medium text-gray-900">{selectedPayment.created_at ? formatDate(selectedPayment.created_at) : '—'}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Tanggal Dibayar</p>
                                    <p className="font-medium text-emerald-600">{selectedPayment.paid_at ? formatDate(selectedPayment.paid_at) : 'Belum Dibayar'}</p>
                                </div>

                                <div className="col-span-2 border-t border-gray-100 mt-2 pt-4">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Informasi Customer</p>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="font-semibold text-gray-900">{selectedPayment.customer_name || 'Tanpa Nama'}</p>
                                        {(selectedPayment.customer_email || selectedPayment.customer_phone) && (
                                            <p className="text-gray-500 mt-1">
                                                {selectedPayment.customer_email} {selectedPayment.customer_phone && `• ${selectedPayment.customer_phone}`}
                                            </p>
                                        )}
                                        {selectedPayment.description && (
                                            <p className="text-gray-500 mt-2 text-xs italic">Catatan: {selectedPayment.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            {selectedPayment.status === 'pending' && (
                                <button
                                    onClick={() => {
                                        handleCheckStatus(selectedPayment.invoice_id, selectedPayment._provider, selectedPayment.amount);
                                    }}
                                    disabled={checkingId === selectedPayment.invoice_id}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${checkingId === selectedPayment.invoice_id ? 'animate-spin' : ''}`} />
                                    Cek Status
                                </button>
                            )}
                            {selectedPayment.payment_url && (
                                <a
                                    href={selectedPayment.payment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Buka Halaman Bayar
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePayments;
