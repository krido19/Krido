import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, ExternalLink, Sun, Moon, Share2, Link as LinkIcon, MessageCircle, Facebook, Twitter, Linkedin, X, Eye } from 'lucide-react';
import Scene from '../components/Scene';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Projects = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
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

            // Extract unique categories from skills
            const allSkills = data.flatMap(item => item.skills || []);
            const uniqueCategories = ['All', ...new Set(allSkills)];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const incrementStat = async (id, type) => {
        try {
            const { error } = await supabase.rpc('increment_portfolio_count', {
                row_id: id,
                count_type: type
            });

            if (error) throw error;

            // Optimistic update
            setPortfolio(prev => prev.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        [type === 'view' ? 'view_count' : 'share_count']: (item[type === 'view' ? 'view_count' : 'share_count'] || 0) + 1
                    };
                }
                return item;
            }));
        } catch (error) {
            console.error(`Error incrementing ${type}:`, error);
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

                        {/* Category Filter */}
                        {!loading && categories.length > 1 && (
                            <div className="flex justify-center mb-12 overflow-x-auto pb-4 hide-scrollbar">
                                <div className="flex space-x-2 px-4">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${selectedCategory === category
                                                ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                                : 'bg-white/5 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 hover:text-cyan-500'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center">
                                <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {portfolio
                                    .filter(item => selectedCategory === 'All' || (item.skills && item.skills.includes(selectedCategory)))
                                    .map((item) => (
                                        <div key={item.id} onClick={() => { setSelectedImage(item); incrementStat(item.id, 'view'); }} className="group relative bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden backdrop-blur-sm shadow-lg dark:shadow-none rounded-xl cursor-pointer">
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-black opacity-80 z-10"></div>
                                            {item.image_url && (
                                                <img
                                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image_url}`}
                                                    alt={item.title}
                                                    className="w-full h-64 object-cover opacity-80 dark:opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                                                    loading="lazy"
                                                    decoding="async"
                                                    onClick={() => {
                                                        setSelectedImage(item);
                                                        incrementStat(item.id, 'view');
                                                    }}
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

                                                {/* Stats & Link */}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex space-x-4 text-xs font-bold text-gray-500 dark:text-gray-500">
                                                        <span className="flex items-center" title="Views">
                                                            <Eye className="w-4 h-4 mr-1 text-cyan-500" />
                                                            {item.view_count || 0}
                                                        </span>
                                                        <span className="flex items-center" title="Shares">
                                                            <Share2 className="w-4 h-4 mr-1 text-pink-500" />
                                                            {item.share_count || 0}
                                                        </span>
                                                    </div>

                                                    {item.project_url && (
                                                        <a
                                                            href={item.project_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-4 py-2 text-sm font-bold text-black bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] clip-path-polygon"
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                                                        >
                                                            VIEW <ExternalLink className="w-3 h-3 ml-1" />
                                                        </a>
                                                    )}
                                                </div>
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
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-[200]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="flex flex-col items-center max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${selectedImage.image_url}`}
                            alt="Full view"
                            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl mb-6"
                        />

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full max-w-md border border-white/20">
                            <h3 className="text-white font-bold text-lg mb-2 text-center">{selectedImage.title}</h3>
                            <div className="flex justify-center items-center gap-4 flex-wrap">
                                <button
                                    onClick={async () => {
                                        incrementStat(selectedImage.id, 'share');
                                        const shareText = `Check out "${selectedImage.title}"! Shared from https://www.kridobahtiar.my.id/`;
                                        const url = 'https://www.kridobahtiar.my.id/';

                                        // Copy text to clipboard as fallback
                                        try {
                                            await navigator.clipboard.writeText(shareText);
                                            alert("Caption copied! Paste it in the text field.");
                                        } catch (err) { console.error('Clipboard failed', err); }

                                        try {
                                            if (navigator.share) {
                                                const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${selectedImage.image_url}`;
                                                const response = await fetch(imageUrl);
                                                const blob = await response.blob();
                                                const file = new File([blob], 'image.jpg', { type: blob.type });

                                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                    await navigator.share({
                                                        files: [file],
                                                        title: selectedImage.title,
                                                        text: shareText,
                                                        url: url
                                                    });
                                                    return;
                                                }
                                            }
                                            throw new Error('Fallback to text share');
                                        } catch (error) {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: selectedImage.title,
                                                    text: shareText,
                                                    url: url
                                                }).catch(console.error);
                                            } else {
                                                navigator.clipboard.writeText(shareText);
                                                alert('Link and message copied to clipboard!');
                                            }
                                        }
                                    }}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                    title="Share via Web Share / Copy Link"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={async () => {
                                        const shareText = `Check out "${selectedImage.title}"! Shared from https://www.kridobahtiar.my.id/`;
                                        const url = 'https://www.kridobahtiar.my.id/';

                                        try {
                                            await navigator.clipboard.writeText(shareText);
                                            alert("Caption copied! Paste it in the text field.");
                                        } catch (err) { console.error('Clipboard failed', err); }

                                        try {
                                            if (navigator.share) {
                                                const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${selectedImage.image_url}`;
                                                const response = await fetch(imageUrl);
                                                const blob = await response.blob();
                                                const file = new File([blob], 'image.jpg', { type: blob.type });

                                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                    await navigator.share({
                                                        files: [file],
                                                        title: selectedImage.title,
                                                        text: shareText,
                                                        url: url
                                                    });
                                                    return;
                                                }
                                            }
                                            throw new Error('Fallback to text share');
                                        } catch (error) {
                                            // Fallback to standard WhatsApp link if system share fails
                                            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                                        }
                                    }}
                                    className="p-3 bg-[#25D366]/80 hover:bg-[#25D366] rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                    title="Share on WhatsApp (Image)"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                                <a
                                    onClick={() => incrementStat(selectedImage.id, 'share')}
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.kridobahtiar.my.id/')}&quote=${encodeURIComponent(`Check out "${selectedImage.title}" on Krido's Portfolio`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-[#1877F2]/80 hover:bg-[#1877F2] rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                    title="Share on Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a
                                    onClick={() => incrementStat(selectedImage.id, 'share')}
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${selectedImage.title}"! Shared from`)}&url=${encodeURIComponent('https://www.kridobahtiar.my.id/')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-[#1DA1F2]/80 hover:bg-[#1DA1F2] rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                    title="Share on Twitter"
                                >
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a
                                    onClick={() => incrementStat(selectedImage.id, 'share')}
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.kridobahtiar.my.id/')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-[#0A66C2]/80 hover:bg-[#0A66C2] rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`Check out "${selectedImage.title}"! Shared from https://www.kridobahtiar.my.id/`);
                                        alert('Link and message copied to clipboard!');
                                    }}
                                    className="p-3 bg-gray-500/80 hover:bg-gray-500 rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                    title="Copy Link"
                                >
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
