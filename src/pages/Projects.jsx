import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, ExternalLink, Sun, Moon } from 'lucide-react';
import Scene from '../components/Scene';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Projects = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolio')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPortfolio(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
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
                title={t('project') || "Projects"}
                description="Explore all my projects and portfolio."
                url={`${window.location.origin}/projects`}
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
                                "name": "Projects",
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

                {/* Projects Section */}
                <section className="pt-32 pb-20 relative z-10 pointer-events-auto min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">
                                {t('project') || "All Projects"}
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-pink-500 mx-auto"></div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center">
                                <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {portfolio.map((item) => (
                                    <div key={item.id} className="group relative bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden backdrop-blur-sm shadow-lg dark:shadow-none rounded-xl">
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-black opacity-80 z-10"></div>
                                        {item.image_url && (
                                            <img
                                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image_url}`}
                                                alt={item.title}
                                                className="w-full h-64 object-cover opacity-80 dark:opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                                            {item.skills && item.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {item.skills.map((skill, index) => (
                                                        <span key={index} className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-pink-600 dark:text-pink-500 border border-pink-500/30 bg-pink-500/10">
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
                                                    className="inline-flex items-center px-4 py-2 mt-4 text-sm font-bold text-black bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] clip-path-polygon"
                                                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                                                >
                                                    VIEW PROJECT <ExternalLink className="w-4 h-4 ml-2" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Projects;
