import React from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-wider">
                    {t('dashboard')}
                </h1>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-cyan-400 group-hover:text-white transition-colors">
                        {t('profile')}
                    </h2>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        {t('profile_desc')}
                    </p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full px-4 py-2 text-black font-bold bg-cyan-500 hover:bg-cyan-400 transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        {t('edit_profile')}
                    </button>
                </div>

                {/* Portfolio Card */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-pink-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-pink-500 group-hover:text-white transition-colors">
                        {t('project')}
                    </h2>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        {t('portfolio_desc')}
                    </p>
                    <button
                        onClick={() => navigate('/portfolio')}
                        className="w-full px-4 py-2 text-white font-bold bg-pink-600 hover:bg-pink-500 transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        {t('manage_portfolio')}
                    </button>
                </div>

                {/* Activities Card */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-purple-500 group-hover:text-white transition-colors">
                        {t('activities')}
                    </h2>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        {t('activities_desc')}
                    </p>
                    <button
                        onClick={() => navigate('/activities')}
                        className="w-full px-4 py-2 text-white font-bold bg-purple-600 hover:bg-purple-500 transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        {t('manage_activities')}
                    </button>
                </div>

                {/* Apps Card (New) */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-yellow-500 group-hover:text-white transition-colors">
                        {t('manage_apps')}
                    </h2>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        Manage your application releases and APKs.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/apps')}
                        className="w-full px-4 py-2 text-black font-bold bg-yellow-500 hover:bg-yellow-400 transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        {t('manage_apps')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
