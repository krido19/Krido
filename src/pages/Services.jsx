import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Download, Sun, Moon, Zap, DollarSign, Clock, Check, ArrowLeft } from 'lucide-react';
import Scene from '../components/Scene';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { supabase } from '../supabaseClient';
import { SkeletonServiceCard } from '../components/Skeleton';

const Services = () => {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply theme class
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

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .limit(1)
                .single();

            if (data) setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    return (
        <div className="min-h-screen font-mono selection:bg-pink-500 selection:text-white overflow-x-hidden relative transition-colors duration-300">
            <SEO
                title={t('services_pricing')}
                description="Check out my services and pricing for Web Development and Android App Development."
                url={`${window.location.origin}/services`}
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
                                "name": "Services",
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
            <div className="relative z-10">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50 transition-colors duration-300">
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

                {/* Services & Pricing Section */}
                <section className="pt-32 pb-20 relative z-10 min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center mb-12">
                            <Zap className="w-8 h-8 text-yellow-500 mr-4" />
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-wider">{t('services_pricing')}</h2>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800 ml-8"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loading ? (
                                [...Array(3)].map((_, i) => <SkeletonServiceCard key={i} />)
                            ) : services.map((service, index) => {
                                const title = i18n.language === 'id' ? service.title_id : service.title_en;
                                const time = i18n.language === 'id' ? service.time_id : service.time_en;
                                const features = i18n.language === 'id' ? service.features_id : service.features_en;
                                const featuresList = typeof features === 'string' ? JSON.parse(features) : features;

                                return (
                                    <div key={service.id} className={`relative p-8 bg-white/80 dark:bg-gray-900/80 border ${service.popular ? 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]' : 'border-gray-200 dark:border-gray-800'} rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}>
                                        {service.popular && (
                                            <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                                {t('popular')}
                                            </div>
                                        )}
                                        <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${service.color} mb-4`}>{title}</h3>
                                        <div className="flex items-baseline mb-2">
                                            <DollarSign className="w-5 h-5 text-gray-400 mr-1" />
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">{service.price}</span>
                                        </div>
                                        <div className="flex items-center mb-6 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>{t('est_time')}: {time}</span>
                                        </div>
                                        <ul className="space-y-3 mb-8">
                                            {featuresList.map((feature, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                                    <Check className={`w-4 h-4 mr-2 mt-0.5 text-transparent bg-clip-text bg-gradient-to-r ${service.color}`} />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => profile?.phone && window.open(`https://wa.me/${profile.phone}?text=${encodeURIComponent(`Halo, saya tertarik dengan paket ${title}.`)}`, '_blank')}
                                            className={`w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r ${service.color} opacity-90 hover:opacity-100 shadow-lg transition-all`}
                                        >
                                            {t('choose_plan')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-gray-100/80 dark:bg-black/80 relative z-10 border-t border-gray-200 dark:border-gray-900 backdrop-blur-md transition-colors duration-300">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center mb-12">
                            <Zap className="w-8 h-8 text-pink-500 mr-4" />
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-wider">FAQ</h2>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800 ml-8"></div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: i18n.language === 'id' ? "Berapa lama proses pembuatan website?" : "How long does it take to build a website?",
                                    a: i18n.language === 'id' ? "Tergantung kompleksitas project. Website landing page biasanya 3-5 hari kerja, sedangkan website dengan fitur lengkap bisa 1-2 minggu." : "Depends on project complexity. A landing page typically takes 3-5 working days, while a full-featured website can take 1-2 weeks."
                                },
                                {
                                    q: i18n.language === 'id' ? "Apakah ada garansi setelah project selesai?" : "Is there a warranty after the project is complete?",
                                    a: i18n.language === 'id' ? "Ya! Saya memberikan garansi revisi minor dan perbaikan bug selama 30 hari setelah project selesai." : "Yes! I provide 30 days of minor revision and bug fix warranty after project completion."
                                },
                                {
                                    q: i18n.language === 'id' ? "Bagaimana cara pembayaran?" : "What are the payment options?",
                                    a: i18n.language === 'id' ? "Pembayaran bisa dilakukan via transfer bank. Skema: 50% di awal untuk memulai project, 50% setelah project selesai." : "Payment can be made via bank transfer. Scheme: 50% upfront to start, 50% upon completion."
                                },
                                {
                                    q: i18n.language === 'id' ? "Apakah bisa request revisi?" : "Can I request revisions?",
                                    a: i18n.language === 'id' ? "Tentu! Maksimal 3x revisi major sudah termasuk dalam harga. Revisi minor unlimited selama masa garansi." : "Of course! Up to 3 major revisions are included in the price. Unlimited minor revisions during warranty period."
                                },
                                {
                                    q: i18n.language === 'id' ? "Apakah include domain dan hosting?" : "Does it include domain and hosting?",
                                    a: i18n.language === 'id' ? "Harga tidak termasuk domain dan hosting. Namun saya bisa membantu setup dan merekomendasikan provider terbaik sesuai kebutuhan." : "Price does not include domain and hosting. However, I can help with setup and recommend the best provider for your needs."
                                }
                            ].map((faq, idx) => (
                                <details key={idx} className="group bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                                        <span className="text-cyan-500 group-open:rotate-45 transition-transform duration-200 text-2xl font-light">+</span>
                                    </summary>
                                    <div className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQPage Schema for Rich Snippets */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "Berapa lama proses pembuatan website?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Tergantung kompleksitas project. Website landing page biasanya 3-5 hari kerja, sedangkan website dengan fitur lengkap bisa 1-2 minggu."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Apakah ada garansi setelah project selesai?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Ya! Saya memberikan garansi revisi minor dan perbaikan bug selama 30 hari setelah project selesai."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Bagaimana cara pembayaran?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Pembayaran bisa dilakukan via transfer bank. Skema: 50% di awal untuk memulai project, 50% setelah project selesai."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Apakah bisa request revisi?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Tentu! Maksimal 3x revisi major sudah termasuk dalam harga. Revisi minor unlimited selama masa garansi."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Apakah include domain dan hosting?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Harga tidak termasuk domain dan hosting. Namun saya bisa membantu setup dan merekomendasikan provider terbaik sesuai kebutuhan."
                                    }
                                }
                            ]
                        }, null, 2)
                    }}
                />

                {/* Footer */}
                <footer className="py-8 border-t border-gray-200 dark:border-gray-900 relative z-10 bg-white dark:bg-black transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-gray-500 dark:text-gray-600 font-mono text-sm">
                            SYSTEM_STATUS: ONLINE <span className="mx-2">|</span> © {new Date().getFullYear()} KRIDO BAHTIAR
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Services;
