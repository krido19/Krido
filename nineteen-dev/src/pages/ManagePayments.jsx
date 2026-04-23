import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, CreditCard, RefreshCw, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';
import { listPayments, checkPayment } from '../utils/bayargg';
import { checkTransaction } from '../utils/pakasir';

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
    const [copiedId, setCopiedId] = useState(null);
    const [checkingId, setCheckingId] = useState(null);

    const [hiddenPayments, setHiddenPayments] = useState(() => {
        try {
            const saved = localStorage.getItem('bayargg_hidden_payments');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [pakasirPayments, setPakasirPayments] = useState(() => {
        try {
            const saved = localStorage.getItem('pakasir_history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

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

    useEffect(() => {
        const timer = setTimeout(() => fetchPayments(1), 300);
        return () => clearTimeout(timer);
    }, [fetchPayments]);

    const handleCheckStatus = async (invoiceId, provider, amount) => {
        try {
            setCheckingId(invoiceId);
            if (provider === 'pakasir') {
                console.log(`[pakasir] Checking status for ${invoiceId} amount ${amount}...`);
                const res = await checkTransaction(invoiceId, amount);
                console.log(`[pakasir] Cek Status response:`, JSON.stringify(res, null, 2));
                const status = res.transaction.status;
                const paidAt = res.transaction.completed_at;
                const updated = pakasirPayments.map((p) =>
                    p.invoice_id === invoiceId ? { ...p, status, paid_at: paidAt } : p
                );
                setPakasirPayments(updated);
                localStorage.setItem('pakasir_history', JSON.stringify(updated));
            } else {
                const res = await checkPayment(invoiceId);
                setPayments((prev) =>
                    prev.map((p) =>
                        p.invoice_id === invoiceId ? { ...p, status: res.status, paid_at: res.paid_at } : p
                    )
                );
            }
        } catch (err) {
            console.error('[check_status_error] Error checking payment:', err);
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
            // Pakasir returns 'completed' for 'paid'
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

    return (
        <div>
            <SEO title="Manage Payments" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Payments</h1>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">
                        Kelola pembayaran QRIS via bayar.gg
                        {pagination.total > 0 && (
                            <span className="ml-2 text-primary font-bold">{pagination.total} transaksi</span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/payments/new')}
                    className="btn-primary gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Buat Pembayaran
                </button>
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
                                                <span className="font-mono text-xs font-bold text-primary">{p.invoice_id}</span>
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
        </div>
    );
};

export default ManagePayments;
