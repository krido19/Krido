import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Briefcase, Activity, Zap, Package,
  MessageSquare, TrendingUp, Users, ChevronRight,
  ShoppingCart, Star
} from 'lucide-react';
import SEO from '../components/SEO';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ portfolio: 0, activities: 0, services: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: profileData } = await supabase.from('profiles').select('*').limit(1).single();
    setProfile(profileData);

    const [
      { count: pCount },
      { count: aCount },
      { count: sCount },
      { count: oCount },
    ] = await Promise.all([
      supabase.from('portfolio').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*', { count: 'exact', head: true }),
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
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
