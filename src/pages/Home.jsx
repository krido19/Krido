import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { LogIn, Github, Linkedin, Instagram, FileText, User, Terminal, Code, Cpu, Download } from 'lucide-react';
import Scene from '../components/Scene';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1);

            if (profileError) throw profileError;
            const mainProfile = profiles[0];
            setProfile(mainProfile);

            if (mainProfile) {
                const { data: portfolioData, error: portfolioError } = await supabase
                    .from('portfolio')
                    .select('*')
                    .eq('user_id', mainProfile.id)
                    .order('created_at', { ascending: false });

                if (portfolioError) throw portfolioError;
                setPortfolio(portfolioData);

                const { data: activitiesData, error: activitiesError } = await supabase
                    .from('activities')
                    .select('*')
                    .eq('user_id', mainProfile.id)
                    .order('date', { ascending: false });

                if (activitiesError) throw activitiesError;
                setActivities(activitiesData);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-cyan-400 font-mono">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                    <p className="animate-pulse">INITIALIZING SYSTEM...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-mono selection:bg-pink-500 selection:text-white overflow-x-hidden relative">
            {/* 3D Background Scene */}
            <Scene />

            {/* Content Overlay */}
            <div className="relative z-10 pointer-events-none">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-gray-800/50 pointer-events-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 animate-glitch cursor-pointer">
                                KRIDO BAHTIAR
                            </span>
                            <div className="flex items-center space-x-4">
                                <div className="flex space-x-2 mr-4">
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
                                <Link
                                    to="/apps"
                                    className="flex items-center px-4 py-2 text-sm font-bold text-cyan-400 border border-cyan-400 hover:bg-cyan-400/10 transition-colors clip-path-polygon"
                                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t('get_apk')}
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center px-4 py-2 text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors clip-path-polygon"
                                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    {t('signin')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10 pointer-events-auto">
                    {profile ? (
                        <div className="space-y-8">
                            <div className="relative inline-block group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                {profile.avatar_url ? (
                                    <img
                                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
                                        alt={profile.full_name}
                                        className="relative w-48 h-48 mx-auto rounded-full object-cover border-2 border-black"
                                    />
                                ) : (
                                    <div className="relative w-48 h-48 mx-auto rounded-full bg-gray-900 flex items-center justify-center text-6xl font-bold text-cyan-400 border-2 border-cyan-500">
                                        {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter">
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                                        {t('hero_title')}
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto font-light">
                                    {t('hero_subtitle')}
                                </p>
                            </div>

                            <div className="flex justify-center gap-6 pt-8">
                                {[
                                    { url: profile.github_url, icon: Github, color: 'hover:text-white' },
                                    { url: profile.linkedin_url, icon: Linkedin, color: 'hover:text-blue-400' },
                                    { url: profile.instagram_url, icon: Instagram, color: 'hover:text-pink-400' }
                                ].map((item, idx) => item.url && (
                                    <a
                                        key={idx}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-4 bg-gray-900/80 border border-gray-700 rounded-lg hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 ${item.color}`}
                                    >
                                        <item.icon className="w-6 h-6" />
                                    </a>
                                ))}

                                {profile.resume_url && (
                                    <a
                                        href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resumes/${profile.resume_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-8 py-3 font-bold text-black bg-pink-500 hover:bg-pink-400 transition-colors clip-path-polygon"
                                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        DOWNLOAD_DATA
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl bg-gray-900/30">
                            <Terminal className="w-16 h-16 mx-auto text-cyan-500 mb-4 animate-pulse" />
                            <h1 className="text-4xl font-bold text-white mb-4">SYSTEM_OFFLINE</h1>
                            <p className="text-xl text-gray-400 mb-8">NO_USER_DATA_FOUND. INITIATE_LOGIN_SEQUENCE.</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center px-8 py-3 font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors"
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                            >
                                INITIATE_LOGIN
                            </Link>
                        </div>
                    )}
                </section>

                {/* Portfolio Section */}
                {portfolio.length > 0 && (
                    <section className="py-20 relative z-10 pointer-events-auto">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center mb-12">
                                <Code className="w-8 h-8 text-pink-500 mr-4" />
                                <h2 className="text-3xl font-bold text-white tracking-wider">{t('portfolio')}</h2>
                                <div className="flex-1 h-px bg-gray-800 ml-8"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {portfolio.map((item) => (
                                    <div key={item.id} className="group relative bg-gray-900/80 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden backdrop-blur-sm">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10"></div>
                                        {item.image_url && (
                                            <img
                                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image_url}`}
                                                alt={item.title}
                                                className="w-full h-64 object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                                            />
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-xl font-bold text-cyan-400 mb-2">{item.title}</h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                                            {item.skills && item.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {item.skills.map((skill, index) => (
                                                        <span key={index} className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-pink-500 border border-pink-500/30 bg-pink-500/10">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {item.project_url && (
                                                <a
                                                    href={item.project_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-white hover:text-cyan-400 text-sm font-bold tracking-wider uppercase group-hover:underline decoration-cyan-500 underline-offset-4"
                                                >
                                                    ACCESS_TERMINAL <span className="ml-2">→</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Activities Section */}
                {activities.length > 0 && (
                    <section className="py-20 bg-black/80 relative z-10 border-t border-gray-900 backdrop-blur-md pointer-events-auto">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center mb-12">
                                <Cpu className="w-8 h-8 text-cyan-500 mr-4" />
                                <h2 className="text-3xl font-bold text-white tracking-wider">{t('activities')}</h2>
                                <div className="flex-1 h-px bg-gray-800 ml-8"></div>
                            </div>

                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-gray-900 group-hover:border-pink-500 group-hover:bg-pink-500/20 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10">
                                            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                                        </div>

                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/80 p-6 border border-gray-800 rounded-xl hover:border-pink-500/50 transition-all duration-300 backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-white">{activity.title}</h3>
                                                <time className="text-xs font-mono text-cyan-500">{new Date(activity.date).toLocaleDateString()}</time>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4">{activity.description}</p>
                                            {activity.image_url && (
                                                <img
                                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/activities/${activity.image_url}`}
                                                    alt={activity.title}
                                                    className="w-full h-32 object-cover rounded border border-gray-700 opacity-70 group-hover:opacity-100 transition-opacity"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="py-8 border-t border-gray-900 relative z-10 bg-black pointer-events-auto">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-gray-600 font-mono text-sm">
                            SYSTEM_STATUS: ONLINE <span className="mx-2">|</span> © {new Date().getFullYear()} KRIDO BAHTIAR
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
