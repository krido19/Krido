import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Copy, Check, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SEO from '../components/SEO';
import { createPayment, getPaymentMethods } from '../utils/bayargg';
import { createTransaction } from '../utils/pakasir';

const Field = ({ label, required, hint, children }) => (
    <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const BAYARGG_METHODS = [
    { id: 'qris', label: 'QRIS (default)', limit: 'Maks Rp 500.000' },
    { id: 'gopay_qris', label: 'GoPay Merchant QRIS', limit: 'Tanpa limit', recommended: true },
    { id: 'qris_user', label: 'BRI Merchant QRIS', limit: 'Tanpa limit' },
    { id: 'ovo', label: 'OVO', limit: 'Butuh akun OVO terhubung' },
];

const PAKASIR_METHODS = [
    { id: 'qris', label: 'QRIS', limit: 'Otomatis' },
    { id: 'bni_va', label: 'BNI Virtual Account', limit: 'Manual VA' },
    { id: 'bri_va', label: 'BRI Virtual Account', limit: 'Manual VA' },
    { id: 'cimb_niaga_va', label: 'CIMB Niaga VA', limit: 'Manual VA' },
    { id: 'permata_va', label: 'Permata VA', limit: 'Manual VA' },
    { id: 'maybank_va', label: 'Maybank VA', limit: 'Manual VA' },
    { id: 'atm_bersama_va', label: 'ATM Bersama', limit: 'Manual VA' },
];

const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const CreatePayment = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        amount: '',
        description: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        payment_method: 'qris',
    });
    const [provider, setProvider] = useState('bayargg'); // 'bayargg' | 'pakasir'
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [availableMethods, setAvailableMethods] = useState([]);
    const [hasSubscription, setHasSubscription] = useState(true);
    const [result, setResult] = useState(null); // payment result modal
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getPaymentMethods()
            .then((res) => {
                setAvailableMethods(res.methods?.map((m) => m.id) || []);
                setHasSubscription(res.user_status?.has_active_subscription ?? true);
            })
            .catch(() => {
                // Fallback: tampilkan semua metode bayargg
                setAvailableMethods(BAYARGG_METHODS.map((m) => m.id));
            });
    }, []);

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const amount = parseFloat(form.amount);
        if (!amount || amount < 1000) {
            setError('Nominal minimal Rp 1.000');
            return;
        }
        if (provider === 'bayargg' && form.payment_method === 'qris' && amount > 500000) {
            setError('Metode QRIS maksimal Rp 500.000. Gunakan GoPay atau BRI QRIS untuk nominal lebih besar.');
            return;
        }

        try {
            setSaving(true);
            if (provider === 'bayargg') {
                const payload = {
                    amount,
                    payment_method: form.payment_method,
                    ...(form.description && { description: form.description }),
                    ...(form.customer_name && { customer_name: form.customer_name }),
                    ...(form.customer_email && { customer_email: form.customer_email }),
                    ...(form.customer_phone && { customer_phone: form.customer_phone }),
                };
                const res = await createPayment(payload);
                setResult({ ...res, _provider: 'bayargg' });
            } else {
                // Pakasir: URL-based (API POST transactioncreate diblokir Cloudflare dari proxy)
                const orderId = `INV${Date.now()}`;
                const slug = import.meta.env.VITE_PAKASIR_PROJECT_SLUG || 'nineteen-dev';
                const pakasirUrl = `https://app.pakasir.com/pay/${slug}/${Math.round(amount)}?order_id=${orderId}`;

                const localData = {
                    invoice_id: orderId,
                    amount: amount,
                    final_amount: amount, // akan terupdate saat di-cek status
                    payment_method: form.payment_method || 'qris',
                    customer_name: form.customer_name || null,
                    customer_email: form.customer_email || null,
                    description: form.description || null,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    payment_url: pakasirUrl,
                    _provider: 'pakasir',
                };

                const savedStr = localStorage.getItem('pakasir_history');
                const saved = savedStr ? JSON.parse(savedStr) : [];
                localStorage.setItem('pakasir_history', JSON.stringify([localData, ...saved]));

                // Buka halaman Pakasir langsung saat itu juga
                window.open(pakasirUrl, '_blank', 'noopener,noreferrer');

                setResult({
                    _provider: 'pakasir',
                    payment_url: pakasirUrl,
                    order_id: orderId,
                    amount,
                    final_amount: amount,
                    qris_string: null,
                    va_number: null,
                    payment_method: form.payment_method,
                });
                setSaving(false);
                return;
            }
        } catch (err) {
            setError(err.message || 'Gagal membuat pembayaran. Coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = () => {
        const url = result?.payment_url || result?.payment?.payment_url;
        if (!url) return;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDone = () => navigate('/dashboard/payments');

    const currentMethods = provider === 'bayargg' ? BAYARGG_METHODS : PAKASIR_METHODS;
    const selectedMethod = currentMethods.find((m) => m.id === form.payment_method);

    return (
        <div>
            <SEO title="Buat Pembayaran QRIS" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate('/dashboard/payments')}
                    className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Buat Pembayaran</h1>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">Generate link pembayaran QRIS via bayar.gg</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-lg p-4 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Gateway Provider */}
                <div className="bg-white rounded-lg p-6 space-y-5">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">
                        Provider Pembayaran
                    </h2>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setProvider('bayargg');
                                set('payment_method', 'qris');
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold border-2 transition-all ${provider === 'bayargg' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            Bayar.gg
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setProvider('pakasir');
                                set('payment_method', 'qris');
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold border-2 transition-all ${provider === 'pakasir' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            Pakasir
                        </button>
                    </div>
                </div>

                {/* Nominal & Metode */}
                <div className="bg-white rounded-lg p-6 space-y-5">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">
                        Detail Pembayaran
                    </h2>
                    <Field label="Nominal" required hint={selectedMethod ? `Metode dipilih: ${selectedMethod.label} — ${selectedMethod.limit}` : ''}>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
                            <input
                                type="number"
                                min="1000"
                                step="1"
                                value={form.amount}
                                onChange={(e) => set('amount', e.target.value)}
                                className="input-flat pl-10"
                                placeholder="50000"
                                required
                            />
                        </div>
                        {form.amount && (
                            <p className="text-xs text-primary font-semibold mt-1">
                                {formatCurrency(parseFloat(form.amount) || 0)}
                            </p>
                        )}
                    </Field>

                    <Field label="Metode Pembayaran">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {currentMethods.map((m) => {
                                const isAvail = provider === 'pakasir' || availableMethods.length === 0 || availableMethods.includes(m.id);
                                const isPremium = provider === 'bayargg' && m.id !== 'qris' && !hasSubscription;
                                const disabled = !isAvail || isPremium;
                                return (
                                    <label
                                        key={m.id}
                                        className={`relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${form.payment_method === m.id
                                            ? 'border-primary bg-blue-50'
                                            : disabled
                                                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={m.id}
                                            checked={form.payment_method === m.id}
                                            onChange={() => !disabled && set('payment_method', m.id)}
                                            disabled={disabled}
                                            className="mt-0.5 accent-primary"
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-sm font-bold text-foreground">{m.label}</span>
                                                {m.recommended && (
                                                    <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">
                                                        Recommended
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{m.limit}</p>
                                            {isPremium && <p className="text-xs text-amber-600 mt-0.5">Butuh subscription aktif</p>}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </Field>

                    <Field label="Deskripsi">
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            className="input-flat"
                            placeholder="Pembayaran Jasa Website..."
                        />
                    </Field>
                </div>

                {/* Customer */}
                <div className="bg-white rounded-lg p-6 space-y-4">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">
                        Informasi Customer (Opsional)
                    </h2>
                    <Field label="Nama Customer">
                        <input
                            type="text"
                            value={form.customer_name}
                            onChange={(e) => set('customer_name', e.target.value)}
                            className="input-flat"
                            placeholder="John Doe"
                        />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Email">
                            <input
                                type="email"
                                value={form.customer_email}
                                onChange={(e) => set('customer_email', e.target.value)}
                                className="input-flat"
                                placeholder="john@example.com"
                            />
                        </Field>
                        <Field label="No. Telepon">
                            <input
                                type="tel"
                                value={form.customer_phone}
                                onChange={(e) => set('customer_phone', e.target.value)}
                                className="input-flat"
                                placeholder="628xxx"
                            />
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/payments')}
                        className="btn-secondary text-sm"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Membuat...</>
                        ) : (
                            <><Send className="w-4 h-4" /> Buat Pembayaran</>
                        )}
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            {result && (() => {
                const isPakasir = result._provider === 'pakasir';

                // Pakasir URL-based approach
                if (isPakasir) {
                    const pakasirUrl = result.payment_url;
                    return (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                                <div className="text-center mb-5">
                                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Check className="w-7 h-7 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-foreground">Link Pakasir Dibuat!</h3>
                                    <p className="text-sm text-gray-400 mt-1">Invoice <span className="font-mono font-bold text-primary">{result.order_id}</span></p>
                                </div>

                                <div className="bg-muted rounded-xl p-4 space-y-2 mb-5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Nominal</span>
                                        <span className="font-bold text-foreground">{formatCurrency(result.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Provider</span>
                                        <span className="font-semibold text-blue-600">Pakasir</span>
                                    </div>
                                </div>

                                {/* QR Code QRIS asli dari API, atau VA Number */}
                                {result.va_number ? (
                                    <div className="mb-5 bg-blue-50 border border-blue-100 text-center py-4 rounded-xl">
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Nomor Virtual Account</p>
                                        <p className="text-xl font-mono font-extrabold text-blue-700 tracking-wider">{result.va_number}</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(result.va_number);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                                        >
                                            {copied ? 'Berhasil disalin!' : 'Salin Nomor VA'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center mb-5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Scan QR untuk Bayar</p>
                                        <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                                            <QRCodeSVG
                                                value={result.qris_string || pakasirUrl}
                                                size={200}
                                                bgColor="#ffffff"
                                                fgColor="#111827"
                                                level="M"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-2 text-center">
                                            {result.qris_string ? 'Scan dengan aplikasi mobile banking / e-wallet' : 'Atau gunakan link di bawah'}
                                        </p>
                                    </div>
                                )}

                                <div className="mb-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Link Pembayaran</p>
                                    <div className="bg-blue-50 rounded-lg p-3 mb-2">
                                        <p className="text-xs text-primary font-mono truncate">{pakasirUrl}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(pakasirUrl);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-muted transition-colors"
                                        >
                                            {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Disalin!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                                        </button>
                                        <a
                                            href={pakasirUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Buka Halaman
                                        </a>
                                    </div>
                                </div>

                                <button onClick={handleDone} className="w-full btn-secondary text-sm">
                                    Lihat Semua Pembayaran
                                </button>
                            </div>
                        </div>
                    );
                }

                const pay = result.data || result.payment || result;
                const paymentUrl = pay.payment_url || result.payment_url;
                const invoiceId = pay.invoice_id;
                const finalAmount = pay.final_amount ?? pay.amount;
                const uniqueCode = pay.unique_code;
                const paymentMethod = pay.payment_method;
                const expiresAt = pay.expires_at;
                const qrString = pay.qris_string || pay.qr_string || pay.qris_static_string || null;
                const vaNumber = null;

                return (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="text-center mb-5">
                                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-extrabold text-foreground">Pembayaran Dibuat!</h3>
                                <p className="text-sm text-gray-400 mt-1">Invoice berhasil digenerate</p>
                            </div>

                            {/* QR Code */}
                            {(qrString || paymentUrl) && !vaNumber && (
                                <div className="flex flex-col items-center mb-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Scan QR untuk Bayar</p>
                                    <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                                        <QRCodeSVG
                                            value={qrString || paymentUrl}
                                            size={200}
                                            bgColor="#ffffff"
                                            fgColor="#111827"
                                            level="M"
                                            includeMargin={false}
                                        />
                                    </div>
                                    {paymentUrl && <p className="text-[11px] text-gray-400 mt-2 text-center">Atau gunakan link di bawah</p>}
                                </div>
                            )}

                            {/* VA Number (Pakasir) */}
                            {vaNumber && (
                                <div className="mb-5 bg-blue-50 border border-blue-100 text-center py-4 rounded-xl">
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Nomor Virtual Account</p>
                                    <p className="text-xl font-mono font-extrabold text-blue-700 tracking-wider">
                                        {vaNumber}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(vaNumber);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        {copied ? 'Berhasil disalin!' : 'Salin Nomor VA'}
                                    </button>
                                </div>
                            )}

                            {/* Detail */}
                            <div className="bg-muted rounded-xl p-4 space-y-2 mb-5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Invoice</span>
                                    <span className="font-mono font-bold text-primary text-xs">{invoiceId || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nominal</span>
                                    <span className="font-bold text-foreground">
                                        {finalAmount != null ? formatCurrency(finalAmount) : '—'}
                                    </span>
                                </div>
                                {uniqueCode > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Kode unik</span>
                                        <span className="font-semibold text-foreground">+{uniqueCode}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Metode</span>
                                    <span className="font-semibold text-foreground">
                                        {(isPakasir ? PAKASIR_METHODS : BAYARGG_METHODS).find((m) => m.id === paymentMethod)?.label || paymentMethod || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Expired</span>
                                    <span className="font-semibold text-foreground">{expiresAt || '—'}</span>
                                </div>
                            </div>

                            {/* Link Bayar */}
                            {paymentUrl && !isPakasir && (
                                <div className="mb-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Link Pembayaran</p>
                                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                                        <p className="text-xs text-primary font-mono truncate flex-1">{paymentUrl}</p>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={handleCopy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-muted transition-colors"
                                        >
                                            {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Disalin!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                                        </button>
                                        <a
                                            href={paymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Buka Halaman
                                        </a>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleDone}
                                className="w-full btn-secondary text-sm"
                            >
                                Lihat Semua Pembayaran
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default CreatePayment;
