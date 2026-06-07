import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import {
  Briefcase, Activity, Zap, Package,
  MessageSquare, TrendingUp, Users, ChevronRight,
  ShoppingCart, Star, Rocket, Power, Database
} from 'lucide-react';
import SEO from '../components/SEO';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ portfolio: 0, activities: 0, services: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [isTogglingLaunch, setIsTogglingLaunch] = useState(false);
  const [keepAlive, setKeepAlive] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchData();
    const keys = [
      'profileTourCompleted',
      'portfolioTourCompleted',
      'appsTourCompleted',
      'servicesTourCompleted',
      'ordersTourCompleted',
      'paymentsTourCompleted'
    ];
    const completedCount = keys.filter(key => localStorage.getItem(key) === 'true').length;
    setOnboardingProgress(completedCount);
    if (completedCount < 6 && localStorage.getItem('hideOnboardingBanner') !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: profileData } = await supabase.from('profiles').select('*').limit(1).single();
    setProfile(profileData);

    const { data: keepAliveData, error: keepAliveError } = await supabase.from('keep_alives').select('*').order('check_time', { ascending: false }).limit(1).maybeSingle();
    if (!keepAliveError) {
      setKeepAlive(keepAliveData);
    }

    const [
      { count: pCount },
      { count: aCount },
      { count: sCount },
      { count: oCount },
    ] = await Promise.all([
      supabase.from('portfolio').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*', { count: 'exact', head: true }),
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ portfolio: pCount || 0, activities: aCount || 0, services: sCount || 0, orders: oCount || 0 });
    setLoading(false);
  };

  const statCards = [
    { icon: Briefcase, label: 'Portfolio', value: stats.portfolio, color: 'text-primary', bg: 'bg-blue-50', to: '/portfolio' },
    { icon: Activity, label: 'Activities', value: stats.activities, color: 'text-secondary', bg: 'bg-emerald-50', to: '/dashboard/activities' },
    { icon: Zap, label: 'Services', value: stats.services, color: 'text-amber-600', bg: 'bg-amber-50', to: '/dashboard/services' },
    { icon: ShoppingCart, label: 'Orders', value: stats.orders, color: 'text-purple-600', bg: 'bg-purple-50', to: '/dashboard/orders' },
  ];

  const menuItems = [
    { icon: Users, label: 'Edit Profile', desc: 'Update your public profile info', href: '/profile', color: 'bg-blue-50 text-primary' },
    { icon: Briefcase, label: 'Portfolio', desc: 'Manage your projects', href: '/portfolio', color: 'bg-emerald-50 text-secondary' },
    { icon: Activity, label: 'Activities', desc: 'Add timeline updates', href: '/dashboard/activities', color: 'bg-amber-50 text-amber-600' },
    { icon: Package, label: 'Apps', desc: 'Manage downloadable apps', href: '/dashboard/apps', color: 'bg-purple-50 text-purple-600' },
    { icon: Zap, label: 'Services', desc: 'Edit pricing & packages', href: '/dashboard/services', color: 'bg-pink-50 text-pink-600' },
    { icon: ShoppingCart, label: 'Orders', desc: 'View & manage orders', href: '/dashboard/orders', color: 'bg-orange-50 text-orange-600' },
    { icon: MessageSquare, label: 'Messages', desc: 'View contact messages', href: '/dashboard/chats', color: 'bg-gray-50 text-gray-600' },
  ];

  return (
    <div>
      <SEO title="Dashboard" />

      {/* Welcome */}
      <div className="flex items-center gap-4 mb-8">
        {profile?.avatar_url ? (
          <img
            src={`${SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
            alt={profile.full_name}
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center text-white font-extrabold text-xl">
            {profile?.full_name?.charAt(0) || 'N'}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
          </h1>
          <p className="text-gray-500 font-medium text-sm">nineteen.dev Admin Dashboard</p>
        </div>
      </div>

      {/* Onboarding Banner */}
      {showOnboarding && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-extrabold text-xl mb-1">Pengenalan Dasbor {onboardingProgress}/6 Selesai</h3>
              <p className="text-blue-100 text-sm max-w-xl">
                Jelajahi semua fitur Nineteen Dev untuk memaksimalkan produktivitas Anda. Anda telah menyelesaikan {onboardingProgress} dari 6 modul.
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-blue-900/40 rounded-full h-2.5 mt-4 max-w-md overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000 ease-out relative" 
                  style={{ width: `${(onboardingProgress / 6) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/50 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <button 
                onClick={() => {
                  localStorage.setItem('hideOnboardingBanner', 'true');
                  setShowOnboarding(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Sembunyikan
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('open-help-hub');
                  window.dispatchEvent(event);
                }}
                className="px-5 py-2 text-sm font-bold bg-white text-blue-600 hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
              >
                Lanjutkan Pengenalan
              </button>
            </div>
          </div>
          
          <Star className="absolute -right-6 -top-6 w-32 h-32 text-white/5 rotate-12" />
        </div>
      )}

      {/* Mode Launch / Coming Soon Toggle */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${profile?.launch_countdown_enabled ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-foreground mb-1">Coming Soon Mode</h3>
            <p className="text-sm text-gray-500 max-w-md">
              {profile?.launch_countdown_enabled
                ? 'Website is currently hidden behind the 4.4 Launch Countdown screen. Safe to make edits under the hood.'
                : 'Website is public and accessible globally. Visitors can see all live content.'}
            </p>
          </div>
        </div>
        <button
          disabled={isTogglingLaunch || loading}
          onClick={async () => {
            if (!profile) return;
            setIsTogglingLaunch(true);
            const nextMode = !profile.launch_countdown_enabled;
            try {
              const { error } = await supabase
                .from('profiles')
                .update({
                  launch_countdown_enabled: nextMode,
                  updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);
              if (error) throw error;
              setProfile({ ...profile, launch_countdown_enabled: nextMode });
              toast.success(`Sebaran publik diubah: ${nextMode ? 'Coming Soon' : 'Online'}`);
            } catch (error) {
              console.error(error);
              toast.error('Gagal mengubah mode peluncuran');
            } finally {
              setIsTogglingLaunch(false);
            }
          }}
          className={`shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm ${profile?.launch_countdown_enabled
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-primary text-white hover:bg-blue-700 hover:scale-105'
            }`}
        >
          <Power className="w-4 h-4" />
          {isTogglingLaunch ? 'Updating...' : profile?.launch_countdown_enabled ? 'Deactivate Countdown' : 'Activate 4.4 Countdown'}
        </button>
      </div>

      {/* Database Keep Alive */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-green-50 text-green-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-foreground mb-1">Database Keep Alive</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Mencegah Supabase dari status paused.
              {keepAlive ? (
                <span className="block mt-1 font-medium text-gray-700">
                  Terakhir jalan: {new Date(keepAlive.check_time).toLocaleString()} ({keepAlive.method})
                </span>
              ) : (
                <span className="block mt-1 text-red-500 font-medium">Belum ada log aktif.</span>
              )}
            </p>
          </div>
        </div>
        <button
          disabled={isPinging || loading}
          onClick={async () => {
            setIsPinging(true);
            try {
              const { error } = await supabase.from('keep_alives').insert({ method: 'manual' });
              if (error) throw error;
              toast.success('Database di-ping secara manual!');
              fetchData();
            } catch (err) {
              console.error(err);
              toast.error('Gagal ping database. Pastikan tabel keep_alives ada.');
            } finally {
              setIsPinging(false);
            }
          }}
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
        >
          <Activity className="w-4 h-4" />
          {isPinging ? 'Pinging...' : 'Ping Now'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, bg, to }) => (
          <Link key={label} to={to} className={`${bg} rounded-lg p-5 transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-5 h-5 ${color}`} />
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
            <p className={`text-3xl font-extrabold ${color} mb-1`}>{loading ? '—' : value}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(({ icon: Icon, label, desc, href, color }) => (
          <Link
            key={href}
            to={href}
            className="bg-white rounded-lg p-5 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] group"
          >
            <div className={`w-11 h-11 ${color} rounded-md flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">{label}</p>
              <p className="text-xs text-gray-400 truncate">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
