import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, X, Sun, Moon } from 'lucide-react';
import Scene from '../components/Scene';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [selectedImage, setSelectedImage] = useState(null);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen font-mono selection:bg-pink-500 selection:text-white overflow-x-hidden relative transition-colors duration-300">
            <SEO
                title={t('activities') || "Activities"}
                description="My latest activities and updates."
                url={`${window.location.origin}/activities`}
            />

            {/* Breadcrumb Schema for Sitelinks */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": window.location.origin
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Activities",
                                "item": window.location.href
                            }
                        ]
                    }, null, 2)
                }}
            />

            {/* 3D Background Scene */}
            <div className="fixed inset-0 z-0">
                <Scene theme={theme} />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 pointer-events-none">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50 pointer-events-auto transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link to="/" className="flex items-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500 animate-glitch cursor-pointer">
                                <ArrowLeft className="w-6 h-6 mr-2 text-cyan-600 dark:text-cyan-400" />
                                KRIDO BAHTIAR
                            </Link>
                            <div className="flex items-center space-x-4">
                                <div className="flex space-x-2 mr-4">
                                    <button
                                        onClick={() => changeLanguage('en')}
                                        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${i18n.language === 'en' ? 'bg-cyan-500 text-black' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                                    >
                                        EN
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('id')}
                                        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${i18n.language === 'id' ? 'bg-cyan-500 text-black' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                                    >
                                        ID
                                    </button>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors mr-2"
                                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Activities Section */}
                <section className="pt-32 pb-20 relative z-10 pointer-events-auto min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">
                                {t('activities') || "All Activities"}
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-pink-500 mx-auto"></div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center">
                                <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-700 before:to-transparent">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 group-hover:border-pink-500 group-hover:bg-pink-500/20 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10">
                                            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                                        </div>

                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/80 dark:bg-gray-900/80 p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-pink-500/50 transition-all duration-300 backdrop-blur-sm shadow-sm dark:shadow-none">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-gray-900 dark:text-white">{activity.title}</h3>
                                                <time className="text-xs font-mono text-cyan-600 dark:text-cyan-500">{new Date(activity.date).toLocaleDateString()}</time>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{activity.description}</p>
                                            {activity.image_url && (
                                                <img
                                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/activities/${activity.image_url}`}
                                                    alt={activity.title}
                                                    className="w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-700 opacity-90 dark:opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-[1.02] duration-300"
                                                    onClick={() => setSelectedImage(activity.image_url)}
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/activities/${selectedImage}`}
                        alt="Full view"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default Activities;
