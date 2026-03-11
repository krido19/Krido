import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, FileText, Search, Filter } from 'lucide-react';

const ManageOrders = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async (isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setPage(0);
            }

            const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            const fetchedData = data || [];

            if (fetchedData.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (isLoadMore) {
                setOrders(prev => [...prev, ...fetchedData]);
                setPage(prev => prev + 1);
            } else {
                setOrders(fetchedData);
            }

        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setOrders(orders.filter(order => order.id !== id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Gagal menghapus order: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'paid': return 'Lunas';
            case 'pending': return 'Pending';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.service_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 tracking-wider">
                    Manage Orders
                </h1>
                <button
                    onClick={() => navigate('/dashboard/orders/new')}
                    className="flex items-center px-4 py-2 text-sm font-bold bg-orange-500 hover:bg-orange-400 text-black rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Order
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Cari nama, invoice, atau layanan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-gray-900/80 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white appearance-none cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Lunas</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400">Memuat data...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                        {orders.length === 0 ? 'Belum ada order' : 'Tidak ada order yang cocok'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Invoice</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Pelanggan</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Layanan</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                                <th className="text-right py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="font-mono text-orange-400">{order.invoice_number}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-white font-medium">{order.customer_name}</div>
                                        {order.customer_phone && (
                                            <div className="text-sm text-gray-500">{order.customer_phone}</div>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-gray-300">{order.service_name}</td>
                                    <td className="py-4 px-4 text-white font-medium">{formatCurrency(order.total_amount)}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-400">{formatDate(order.created_at)}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/orders/invoice/${order.id}`)}
                                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                                title="Cetak Invoice"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/dashboard/orders/edit/${order.id}`)}
                                                className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(order.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Load More Button */}
            {!loading && hasMore && filteredOrders.length > 0 && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => fetchOrders(true)}
                        disabled={loadingMore}
                        className="flex items-center px-6 py-2 text-sm font-bold bg-gray-800 hover:bg-gray-700 text-orange-400 border border-orange-500/30 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? (
                            <>
                                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Memuat...
                            </>
                        ) : (
                            'Muat Lebih Banyak'
                        )}
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Konfirmasi Hapus</h3>
                        <p className="text-gray-400 mb-6">Apakah Anda yakin ingin menghapus order ini? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
