import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileText, Search, Filter, ShoppingCart, Wallet } from 'lucide-react';
import SEO from '../../components/SEO';
import AppJoyride from '../../components/AppJoyride';
import { useTour } from '../../hooks/useTour';

const ManageOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { runTour, handleJoyrideCallback } = useTour('orders', !loading);


  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else { setLoading(true); setPage(0); }

      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      const fetchedData = data || [];
      setHasMore(fetchedData.length >= ITEMS_PER_PAGE);

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
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter(o => o.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Gagal menghapus order: ' + error.message);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid': return { label: 'Lunas', cls: 'bg-emerald-50 text-emerald-700' };
      case 'pending': return { label: 'Pending', cls: 'bg-amber-50 text-amber-700' };
      case 'cancelled': return { label: 'Dibatalkan', cls: 'bg-red-50 text-red-600' };
      default: return { label: status, cls: 'bg-gray-100 text-gray-600' };
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <SEO title="Manage Orders" />

      <AppJoyride
        steps={[
          { target: '#orders-page-title', title: '🛒 Manajemen Pesanan', content: 'Pantau semua pesanan jasa dari klien di halaman ini.', placement: 'bottom', disableBeacon: true },
          { target: '#add-order-btn', title: '➕ Tambah Order', content: 'Klik di sini jika Anda ingin memasukkan pesanan klien secara manual.', placement: 'left', disableBeacon: true },
          { target: '#orders-filters', title: '🔍 Pencarian & Filter', content: 'Gunakan fitur ini untuk mencari invoice spesifik atau memfilter pesanan berdasarkan status.', placement: 'bottom', disableBeacon: true },
          { target: '#orders-list', title: '📝 Daftar Pesanan', content: 'Di tabel ini Anda dapat memantau status pesanan, mencetak invoice, serta membuat link pembayaran.', placement: 'top', disableBeacon: true },
        ]}
        run={runTour}
        callback={(data) => { handleJoyrideCallback(data); if (['finished','skipped'].includes(data.status)) navigate('/dashboard'); }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div id="orders-page-title">
          <h1 className="text-2xl font-extrabold text-foreground">Orders</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Kelola semua pesanan klien</p>
        </div>
        <button
          id="add-order-btn"
          onClick={() => navigate('/dashboard/orders/new')}
          className="btn-primary gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Order
        </button>
      </div>

      {/* Filters */}
      <div id="orders-filters" className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, invoice, atau layanan..."
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
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Lunas</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div id="orders-list" className="bg-white rounded-lg p-12 text-center">
          <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-400 font-medium">Memuat data...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div id="orders-list" className="bg-white rounded-lg p-16 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-400">
            {orders.length === 0 ? 'Belum ada order' : 'Tidak ada order yang cocok'}
          </p>
        </div>
      ) : (
        <div id="orders-list" className="bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Pelanggan</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Layanan</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Tanggal</th>
                  <th className="text-right py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const { label, cls } = getStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono text-sm font-bold text-primary">{order.invoice_number}</span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-foreground text-sm">{order.customer_name}</p>
                        {order.customer_phone && (
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        )}
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-600 hidden md:table-cell">{order.service_name}</td>
                      <td className="py-4 px-5 text-sm font-bold text-foreground">{formatCurrency(order.total_amount)}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${cls}`}>{label}</span>
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-400 hidden sm:table-cell">{formatDate(order.created_at)}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/dashboard/orders/invoice/${order.id}`)}
                            className="p-2 text-gray-400 hover:text-secondary hover:bg-emerald-50 rounded-md transition-colors"
                            title="Cetak Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {order.status !== 'paid' && (
                            <button
                              onClick={() => {
                                const desc = `Pembayaran untuk Order ${order.invoice_number} - ${order.service_name}`;
                                navigate(`/dashboard/payments/new?order_id=${order.id}&amount=${order.total_amount}&name=${encodeURIComponent(order.customer_name)}&email=${encodeURIComponent(order.customer_email || '')}&phone=${encodeURIComponent(order.customer_phone || '')}&desc=${encodeURIComponent(desc)}`);
                              }}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Buat Link Pembayaran"
                            >
                              <Wallet className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/dashboard/orders/edit/${order.id}`)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(order.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && filteredOrders.length > 0 && (
        <div className="flex justify-center mt-5">
          <button
            onClick={() => fetchOrders(true)}
            disabled={loadingMore}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-foreground mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus order ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary text-sm py-2.5"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition-colors"
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
