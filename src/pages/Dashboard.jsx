import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Globe, LogOut, Bell } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialPhone, setInitialPhone] = useState('');
    const [visitorCount, setVisitorCount] = useState(0);

    useEffect(() => {
        fetchProfile();
        fetchVisitorCount();

        // Phase 7: Setup Supabase Realtime Subscription for Orders
        const channel = supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('Realtime Order Received!', payload);
                    toast.success(
                        (t) => (
                            <div className="flex flex-col gap-1">
                                <strong className="text-sm">🔔 New Order Arrived!</strong>
                                <span className="text-xs text-gray-600">From: {payload.new.customer_name}</span>
                                <span className="text-xs text-gray-500 font-mono mt-1">Invoice: {payload.new.invoice_number}</span>
                                <button
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        navigate('/dashboard/orders');
                                    }}
                                    className="mt-2 text-xs bg-cyan-500 text-white px-2 py-1 rounded"
                                >
                                    View Order
                                </button>
                            </div>
                        ),
                        { duration: 8000, position: 'top-right' }
                    );
                }
            )
            .subscribe((status) => {
                if(status === 'SUBSCRIBED') {
                    console.log('Listening for realtime orders...');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchVisitorCount = async () => {
        try {
            const { data, error } = await supabase
                .from('site_stats')
                .select('visitor_count')
                .single();

            if (error) throw error;
            if (data) setVisitorCount(data.visitor_count);
        } catch (error) {
            console.error('Error fetching visitor count:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('phone')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                if (data) {
                    setPhone(data.phone || '');
                    setInitialPhone(data.phone || '');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleUpdatePhone = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ phone, updated_at: new Date() })
                    .eq('id', user.id);

                if (error) throw error;
                setInitialPhone(phone);
                alert('Contact number updated successfully!');
            }
        } catch (error) {
            alert('Error updating contact number: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="p-8">
            <Toaster />
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-wider">
                    {t('dashboard')}
                </h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center px-4 py-2 text-sm font-bold bg-gray-800/80 hover:bg-gray-700/80 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                        <Globe className="w-4 h-4 mr-2" />
                        Go to Website
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm font-bold bg-pink-900/20 hover:bg-pink-900/40 text-pink-500 border border-pink-500/30 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('logout')}
                    </button>
                </div>
            </div>

            {/* Visitor Stats Card */}
            <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-cyan-500/20 rounded-full">
                        <Users className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Visitors</h2>
                        <p className="text-3xl font-bold text-white">{visitorCount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Contact Number Card */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-cyan-400 group-hover:text-white transition-colors">
                        Contact Number
                    </h2>
                    <p className="mb-4 text-gray-400 text-sm leading-relaxed">
                        Update the WhatsApp number used for the "Contact Me" button.
                    </p>
                    <div className="mb-4">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 628123456789"
                            className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleUpdatePhone}
                        disabled={loading || phone === initialPhone}
                        className={`w-full px-4 py-2 font-bold transition-colors clip-path-polygon ${loading || phone === initialPhone
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                            }`}
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        {loading ? 'Updating...' : 'Update Number'}
                    </button>
                </div>

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
                        onClick={() => navigate('/dashboard/activities')}
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

                {/* Services Card */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-green-500 group-hover:text-white transition-colors">
                        Manage Services
                    </h2>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        Manage your service packages and pricing.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/services')}
                        className="w-full px-4 py-2 text-white font-bold bg-green-600 hover:bg-green-500 transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        Manage Services
                    </button>
                </div>

                {/* Orders Card */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-orange-500 group-hover:text-white transition-colors">
                        Manage Orders
                    </h2>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        Manage orders and print invoices for your clients.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/orders')}
                        className="w-full px-4 py-2 text-black font-bold bg-orange-500 hover:bg-orange-400 transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        Manage Orders
                    </button>
                </div>

                {/* Live Chat Card */}
                <div className="group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <h2 className="mb-4 text-xl font-bold text-blue-500 group-hover:text-white transition-colors">
                        Live Web Chat
                    </h2>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        Handle AI Chat Handoffs and communicate with visitors in real-time.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/chats')}
                        className="w-full px-4 py-2 text-white font-bold bg-blue-600 hover:bg-blue-500 transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                    >
                        Open Live Chat
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
