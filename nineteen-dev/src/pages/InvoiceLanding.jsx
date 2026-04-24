import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, CheckCircle, Clock, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { checkPayment } from '../utils/bayargg';
import { checkTransaction } from '../utils/pakasir';
import SEO from '../components/SEO';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const InvoiceLanding = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const urlProvider = searchParams.get('provider'); // optional
    const urlAmount = searchParams.get('amount'); // optional but very helpful for pakasir
    const urlPaymentLink = searchParams.get('link'); // fallback link 

    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Determine source if possible
                let isPakasir = id.startsWith('INV') || urlProvider === 'pakasir';

                // Fallback struct
                let data = {
                    invoice_id: id,
                    status: 'pending',
                    amount: urlAmount ? parseInt(urlAmount) : 0,
                    payment_url: urlPaymentLink || null,
                    method: 'QRIS/VA',
                    provider: isPakasir ? 'pakasir' : 'bayar.gg',
                    customer_name: 'Customer'
                };

                // Panggil API Cek Status (Proxy bisa lolos utk GET)
                if (isPakasir) {
                    const res = await checkTransaction(id, data.amount);
                    if (res && res.transaction) {
                        data.status = res.transaction.status;
                        data.amount = res.transaction.amount;
                        data.method = res.transaction.payment_method;
                        if (res.transaction.status === 'completed') data.status = 'paid';
                    }
                } else {
                    const res = await checkPayment(id);
                    if (res) {
                        data.status = res.status;
                        if (res.price) data.amount = res.price;
                    }
                }

                setInvoice(data);
            } catch (err) {
                console.warn('API fetch failed on public page:', err);
                // Kita tampilkan basic dari URL params saja bila gagal (karena ini public page)
                if (urlPaymentLink) {
                    setInvoice({
                        invoice_id: id,
                        status: 'pending',
                        amount: urlAmount ? parseInt(urlAmount) : 0,
                        payment_url: urlPaymentLink,
                        customer_name: 'Customer'
                    });
                } else {
                    setError('Data Invoice tidak dapat dimuat atau tidak ditemukan.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [id, urlProvider, urlAmount, urlPaymentLink]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Tidak Ditemukan</h2>
                    <p className="text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">{error}</p>
                </div>
            </div>
        );
    }

    const isPaid = invoice.status === 'paid' || invoice.status === 'completed';

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            <SEO title={`Invoice ${id} - Nineteen Dev`} />

            <div className="flex-1 max-w-lg w-full mx-auto px-4 py-8 flex flex-col">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center mb-4">
                        <span className="text-2xl font-black text-white tracking-tighter mix-blend-overlay">19</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Nineteen Dev</h1>
                    <p className="text-sm text-gray-400 font-medium">Pembayaran Resmi</p>
                </div>

                {/* Card Container */}
                <div className="bg-white w-full rounded-[2rem] shadow-xl border border-gray-200/60 overflow-hidden relative">

                    {/* Status Badge Ribbon */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${isPaid ? 'bg-emerald-500' : 'bg-primary'}`}></div>

                    <div className="p-8">
                        {/* Header Invoice */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Tagihan</p>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {invoice.amount ? formatCurrency(invoice.amount) : 'Menunggu...'}
                                </h2>
                            </div>
                            <div className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-pulse" />}
                                {isPaid ? 'LUNAS' : 'PENDING'}
                            </div>
                        </div>

                        {/* Invoice Info Table */}
                        <div className="bg-gray-50/80 rounded-2xl p-5 space-y-4 mb-8 border border-gray-100">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200/60 dashed">
                                <span className="text-sm font-medium text-gray-500">Nomor Invoice</span>
                                <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">{invoice.invoice_id}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200/60 dashed">
                                <span className="text-sm font-medium text-gray-500">Penerima</span>
                                <span className="text-sm font-bold text-gray-900">Nineteen Dev</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Sistem Gateway</span>
                                <span className="text-sm font-bold text-gray-900 capitalize">{invoice.provider || 'Gateway 19'}</span>
                            </div>
                        </div>

                        {/* Action CTA */}
                        <div className="mt-8 relative">
                            {isPaid ? (
                                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">Pembayaran Berhasil</h3>
                                    <p className="text-emerald-600/80 text-sm font-medium">Terima kasih atas pembayaran Anda. Layanan segera diproses.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <a
                                        href={invoice.payment_url || `https://app.pakasir.com/pay/nineteen-dev/${invoice.amount}?order_id=${invoice.invoice_id}`}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 gap-2 mb-3"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        PROSES PEMBAYARAN ONLINE
                                    </a>

                                    <p className="text-center text-xs text-gray-400 font-medium">
                                        Anda akan diarahkan ke halaman gerbang pembayaran resmi yang aman.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Watermark Footer */}
                    <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            Secure Encrypted Payment
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs font-semibold text-gray-400">© {new Date().getFullYear()} Nineteen Dev. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceLanding;
