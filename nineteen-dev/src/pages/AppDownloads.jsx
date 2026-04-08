import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Download, Smartphone, Package, Star, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ITEMS_PER_PAGE = 6;

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-100" />
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-md" />
                <div className="h-5 bg-gray-200 rounded w-32" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-6" />
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-9 bg-gray-200 rounded-lg w-32" />
            </div>
        </div>
    </div>
);

// ─── App Card ──────────────────────────────────────────────────────────────────
const AppCard = ({ app, onDownload, downloading }) => {
    const imageUrl = app.image_url
        ? `${SUPABASE_URL}/storage/v1/object/public/apks/${app.image_url}`
        : null;

    return (
        <div className={`group bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col
            ${app.is_pinned ? 'border-primary/30 ring-1 ring-primary/20' : 'border-gray-100'}`}>

            {/* Image */}
            <div className="relative h-48 bg-blue-50 overflow-hidden shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={app.app_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Smartphone className="w-16 h-16 text-primary/30" />
                    </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {app.is_pinned && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-amber-400 text-amber-900 rounded-full shadow">
                            <Star className="w-3 h-3 fill-amber-900" />
                            Pinned
                        </span>
                    )}
                    <span className="px-2 py-1 text-xs font-bold bg-primary text-white rounded-full shadow">
                        v{app.version}
                    </span>
                </div>
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {app.app_name}
                    </h3>
                </div>

                <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {app.description || 'Tidak ada deskripsi.'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Unduhan</p>
                        <p className="text-sm font-bold text-foreground">
                            {(app.download_count || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <button
                        onClick={() => onDownload(app)}
                        disabled={downloading === app.id}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 shadow-sm hover:shadow-md"
                    >
                        {downloading === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Unduh APK
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── AppDownloads Page ─────────────────────────────────────────────────────────
const AppDownloads = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async (isLoadMore = false) => {
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
                .from('app_releases')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setHasMore(data.length === ITEMS_PER_PAGE);

            if (isLoadMore) {
                setApps(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
            } else {
                setApps(data);
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
            toast.error('Gagal memuat daftar aplikasi.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleDownload = async (app) => {
        setDownloading(app.id);
        try {
            await supabase.rpc('increment_download_count', { app_id: app.id });

            const fileName = `${app.app_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-v${app.version}.apk`;

            const { data, error } = await supabase.storage
                .from('apks')
                .createSignedUrl(app.apk_url, 60, { download: fileName });

            if (error) throw error;

            toast.success(`Mengunduh ${app.app_name}...`, {
                icon: '📥',
                duration: 3000,
            });

            const a = document.createElement('a');
            a.href = data.signedUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            fetchApps();
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Gagal mengunduh. Mencoba metode alternatif...');
            const { data } = supabase.storage.from('apks').getPublicUrl(app.apk_url);
            window.open(data.publicUrl, '_blank');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="App Downloads — nineteen.dev"
                description="Download aplikasi Android terbaru karya nineteen.dev. Akses APK versi terbaru secara aman dan gratis."
                url={`${window.location.origin}/apps`}
            />
            <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 } }} />
            <Navbar />

            {/* ── HERO ── */}
            <section className="section-primary pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full translate-y-1/2" />
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-lg rotate-12 -translate-y-1/2" />

                <div className="container-max relative text-center">
                    <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                        Unduhan Tersedia
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
                        Aplikasi Android
                    </h1>
                    <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
                        Download APK terbaru karya <span className="font-bold text-white">nineteen.dev</span> — gratis, aman, dan selalu diperbarui.
                    </p>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
                        {[
                            { icon: <CheckCircle className="w-4 h-4" />, text: 'Bebas Malware' },
                            { icon: <CheckCircle className="w-4 h-4" />, text: 'Selalu Diperbarui' },
                            { icon: <CheckCircle className="w-4 h-4" />, text: 'Unduhan Langsung' },
                        ].map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-2 text-blue-100 text-sm font-semibold">
                                <span className="text-secondary">{icon}</span>
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── APP LIST ── */}
            <section className="section-muted py-20">
                <div className="container-max">

                    {/* Section header */}
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="section-label text-primary mb-2">Koleksi Aplikasi</p>
                            <h2 className="section-title">
                                {loading ? 'Memuat...' : `${apps.length} Aplikasi Tersedia`}
                            </h2>
                        </div>
                        {!loading && apps.length > 0 && (
                            <p className="text-sm text-gray-400 font-medium hidden md:block">
                                Diurutkan berdasarkan terbaru
                            </p>
                        )}
                    </div>

                    {/* App Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : apps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {apps.map((app) => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    onDownload={handleDownload}
                                    downloading={downloading}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Belum Ada Aplikasi</h3>
                            <p className="text-gray-400 text-sm">Aplikasi akan segera tersedia. Pantau terus!</p>
                        </div>
                    )}

                    {/* Load More */}
                    {!loading && hasMore && apps.length > 0 && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={() => fetchApps(true)}
                                disabled={loadingMore}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Memuat...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Muat Lebih Banyak
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AppDownloads;
