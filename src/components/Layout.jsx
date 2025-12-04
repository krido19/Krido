import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, LogOut, LayoutDashboard, User, Briefcase, Calendar, Menu, X, Smartphone } from 'lucide-react';
import ContactFab from './ContactFab';
import Scene from './Scene';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Enforce dark mode class for consistency with the rest of the app components if they rely on it
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { path: '/profile', label: t('profile'), icon: User },
        { path: '/portfolio', label: t('portfolio'), icon: Briefcase },
        { path: '/activities', label: t('activities'), icon: Calendar },
        { path: '/dashboard/apps', label: t('manage_apps'), icon: Smartphone },
    ];

    return (
        <div className="flex min-h-screen font-mono text-gray-100 relative overflow-hidden">
            {/* Background Scene */}
            <div className="fixed inset-0 z-0">
                <Scene />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 transform bg-black/60 backdrop-blur-md border-r border-gray-800 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 animate-pulse">
                        Krido Bahtiar
                    </span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-cyan-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 border ${isActive ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-gray-700'}`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="font-medium tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-black/40">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2 w-full justify-center">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-3 py-1 text-xs font-bold rounded border transition-all ${i18n.language === 'en' ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('id')}
                                className={`px-3 py-1 text-xs font-bold rounded border transition-all ${i18n.language === 'id' ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300'}`}
                            >
                                ID
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/20 hover:border-red-500/50 transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                        <span className="font-medium tracking-wider">{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 pointer-events-none">
                <header className="flex items-center justify-between h-16 px-6 bg-black/60 backdrop-blur-md border-b border-gray-800 lg:hidden pointer-events-auto">
                    <button onClick={() => setSidebarOpen(true)} className="text-cyan-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                        Krido Bahtiar
                    </span>
                    <div className="w-6"></div> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto pointer-events-auto">
                    <Outlet />
                </main>
            </div>
            <ContactFab />
        </div>
    );
};

export default Layout;
