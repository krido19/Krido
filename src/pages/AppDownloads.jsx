import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Download, Smartphone, ArrowLeft, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Scene from '../components/Scene';

const AppDownloads = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_releases')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApps(data);
        } catch (error) {
            console.error('Error fetching apps:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (app) => {
        try {
            // Increment download count
            await supabase.rpc('increment_download_count', { app_id: app.id });

            // Construct download URL
            const { data } = supabase.storage
                .from('apks')
                .getPublicUrl(app.apk_url);

            // Trigger download
            window.open(data.publicUrl, '_blank');

            // Refresh list to update count
            fetchApps();
        } catch (error) {
            console.error('Error downloading app:', error);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen bg-black text-gray-300 font-mono selection:bg-pink-500 selection:text-white overflow-x-hidden relative">
            {/* Background Scene */}
            <div className="fixed inset-0 z-0">
                <Scene />
            </div>

            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center text-cyan-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            {t('back_to_home')}
                        </Link>
                        <div className="flex items-center space-x-4">
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 animate-glitch hidden md:block">
                                {t('app_repository')}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'en' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => changeLanguage('id')}
                                    className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'id' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                >
                                    ID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {t('available_downloads')}
                    </h1>
                    <p className="text-xl text-cyan-500/80 max-w-2xl mx-auto">
                        {t('access_latest_builds')}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {apps.map((app) => (
                            <div key={app.id} className="group relative bg-gray-900/80 border border-gray-800 hover:border-pink-500 transition-all duration-300 overflow-hidden backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.3)]">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                                <div className="relative h-48 w-full bg-gray-800 overflow-hidden group-hover:bg-gray-700 transition-colors">
                                    {app.image_url ? (
                                        <img
                                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/apks/${app.image_url}`}
                                            alt={app.app_name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Smartphone className="w-16 h-16 text-cyan-400/50" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 text-xs font-bold text-black bg-cyan-400 rounded-full shadow-lg">
                                            {t('version')}{app.version}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8">

                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-500 transition-colors">
                                        {app.app_name}
                                    </h3>

                                    <p className="text-gray-400 mb-6 line-clamp-3 h-20">
                                        {app.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                                        <div className="text-sm text-gray-500">
                                            <span className="block text-xs uppercase tracking-wider mb-1">{t('downloads_count')}</span>
                                            <span className="text-white font-mono">{app.download_count}</span>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(app)}
                                            className="flex items-center px-6 py-2 bg-gray-800 hover:bg-pink-500 text-white font-bold rounded transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] clip-path-polygon"
                                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            {t('get_apk')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && apps.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl bg-gray-900/30 backdrop-blur-sm">
                        <Terminal className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-500">{t('no_data_found')}</h2>
                        <p className="text-gray-600">{t('repository_empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppDownloads;
