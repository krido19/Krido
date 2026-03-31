import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, LogOut, LayoutDashboard, User, Briefcase, Calendar, Menu, X, Smartphone, Globe, Database } from 'lucide-react';
import { exportToSQL } from '../utils/sqlExport';
import Modal from './Modal';
import ContactFab from './ContactFab';
import Scene from './Scene';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Apply theme class
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Automatically close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

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
        { path: '/portfolio', label: t('project'), icon: Briefcase },
        { path: '/dashboard/activities', label: t('activities'), icon: Calendar },
        { path: '/dashboard/apps', label: t('manage_apps'), icon: Smartphone },
        { path: '/', label: 'Go to Website', icon: Globe },
    ];

    return (
        <div className="flex min-h-screen font-mono text-gray-900 dark:text-gray-100 relative overflow-hidden transition-colors duration-300 bg-[#e0f2fe] dark:bg-black">
            {/* Background Scene */}
            <div className="fixed inset-0 z-0">
                <Scene theme={theme} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 transition-transform duration-300 transform bg-white/90 dark:bg-black/60 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 animate-pulse">
                        Krido Bahtiar
                    </span>
                    <button onClick={() => setSidebarOpen(false)} className="text-cyan-600 dark:text-cyan-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 border ${isActive ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-gray-700'}`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="font-medium tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Sidebar Backup Button */}
                    <button
                        onClick={() => setIsBackupModalOpen(true)}
                        className="flex items-center w-full px-4 py-3 rounded-lg transition-all duration-300 border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.1)] group"
                    >
                        <Database className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-medium tracking-wide text-sm">Backup Database</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/40 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-3 py-1 text-xs font-bold rounded border transition-all ${i18n.language === 'en' ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('id')}
                                className={`px-3 py-1 text-xs font-bold rounded border transition-all ${i18n.language === 'id' ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                ID
                            </button>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-500/50 transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                        <span className="font-medium tracking-wider">{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="flex items-center justify-between h-16 px-6 bg-white/90 dark:bg-black/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                    <button onClick={() => setSidebarOpen(true)} className="text-cyan-600 dark:text-cyan-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                        Krido Bahtiar
                    </span>
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <Outlet />
                </main>
            </div>
            <ContactFab />

            {/* SQL Backup Modal with Instructions */}
            <Modal
                isOpen={isBackupModalOpen}
                onClose={() => setIsBackupModalOpen(false)}
                onConfirm={exportToSQL}
                title="DATABASE_MIGRATION"
                message={
                    <div className="space-y-4">
                        <p>Generate a "Smart" SQL backup for your database?</p>
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <h4 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">Panduan Migrasi:</h4>
                            <ul className="text-xs text-gray-400 space-y-2 list-decimal ml-4">
                                <li><strong>Sign Up Dulu:</strong> Di project baru, Anda HARUS mendaftar akun user pertama kali.</li>
                                <li><strong>Jalankan SQL:</strong> Setelah ada 1 user, baru jalankan file backup ini di SQL Editor project baru.</li>
                                <li><strong>Otomatis:</strong> Sistem Smart Migration akan otomatis menempelkan data ke akun baru tersebut.</li>
                            </ul>
                        </div>
                    </div>
                }
                confirmText="INITIATE_BACKUP"
                type="purple"
            />
        </div>
    );
};

export default Layout;
