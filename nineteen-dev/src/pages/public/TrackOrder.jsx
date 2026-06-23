import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TrackOrder = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .ilike('invoice_number', invoiceNumber.trim())
        .single();

      if (error) throw error;
      if (!data) throw new Error('Order not found');

      setOrder(data);
    } catch (err) {
      console.error(err);
      setError('Maaf, pesanan dengan nomor invoice tersebut tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50',
          title: 'Sedang Diproses / Selesai',
          desc: 'Pembayaran telah diterima dan pesanan Anda sedang kami kerjakan.'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-amber-500',
          bg: 'bg-amber-50',
          title: 'Menunggu Pembayaran',
          desc: 'Silakan selesaikan pembayaran agar pesanan dapat segera diproses.'
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bg: 'bg-red-50',
          title: 'Pesanan Dibatalkan',
          desc: 'Pesanan ini telah dibatalkan.'
        };
      default:
        return {
          icon: Package,
          color: 'text-gray-500',
          bg: 'bg-gray-50',
          title: 'Status Tidak Diketahui',
          desc: 'Silakan hubungi admin.'
        };
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <SEO title="Track Your Order" description="Lacak status pesanan Anda di nineteen.dev" />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-32">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Track Order</h1>
            <p className="text-gray-500">Masukkan Nomor Invoice untuk melihat status pesanan.</p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Contoh: INV-2023-XXXX"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="input-flat pl-11 py-4 text-lg w-full font-mono uppercase"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? 'Mencari...' : 'Lacak Pesanan'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-semibold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          {order && (
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-fade-in">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-4">
                Detail Pesanan
              </h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nomor Invoice</p>
                  <p className="font-mono font-bold text-foreground">{order.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Layanan</p>
                  <p className="font-bold text-foreground">{order.service_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nama Klien</p>
                  <p className="font-bold text-foreground">{order.customer_name}</p>
                </div>
              </div>

              {(() => {
                const { icon: StatusIcon, color, bg, title, desc } = getStatusDisplay(order.status);
                return (
                  <div className={`${bg} rounded-xl p-6 text-center`}>
                    <StatusIcon className={`w-12 h-12 ${color} mx-auto mb-3`} />
                    <h3 className={`font-extrabold text-lg ${color} mb-2`}>{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
