import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  LayoutDashboard, User, Briefcase, Activity,
  Package, Zap, ShoppingCart, MessageSquare,
  LogOut, ExternalLink, Menu, X, ChevronRight
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/dashboard/activities', icon: Activity, label: 'Activities' },
  { to: '/dashboard/apps', icon: Package, label: 'Apps' },
  { to: '/dashboard/services', icon: Zap, label: 'Services' },
  { to: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/dashboard/chats', icon: MessageSquare, label: 'Chats' },
];

const SidebarContent = ({ profile, isActive, setSidebarOpen, handleLogout }) => (
  <>
    {/* Logo */}
    <div className="p-5 border-b-2 border-gray-100">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <span className="text-white font-black text-sm leading-none">19</span>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-base font-extrabold text-foreground">nineteen</span>
          <span className="text-base font-extrabold text-primary">.dev</span>
        </div>
      </Link>
    </div>

    {/* Profile mini */}
    {profile && (
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {profile.avatar_url ? (
            <img
              src={`${SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
              alt={profile.full_name}
              className="w-9 h-9 rounded-lg object-cover"
            />
          ) : (
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {profile.full_name?.charAt(0) || 'A'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{profile.full_name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{profile.email || ''}</p>
          </div>
        </div>
      </div>
    )}

    {/* Nav Items */}
    <nav className="flex-1 p-3 overflow-y-auto">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 mb-3">Menu</p>
      {navItems.map(({ to, icon: Icon, label, exact }) => {
        const active = isActive(to, exact);
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 text-sm font-semibold transition-all duration-200 group ${
              active
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
            {label}
            {active && <ChevronRight className="w-3 h-3 ml-auto text-white/60" />}
          </Link>
        );
      })}
    </nav>

    {/* Bottom actions */}
    <div className="p-3 border-t border-gray-100 space-y-1">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-gray-600 hover:bg-muted hover:text-foreground transition-all"
      >
        <ExternalLink className="w-4 h-4 text-gray-400" />
        View Site
      </a>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  </>
);

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('*').limit(1).single()
      .then(({ data }) => setProfile(data));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (to, exact) => {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  };

  const sidebarProps = { profile, isActive, setSidebarOpen, handleLogout };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r-2 border-gray-100 flex-col fixed top-0 bottom-0 left-0 z-30">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white z-50 flex flex-col md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="md:hidden bg-white border-b-2 border-gray-100 h-14 flex items-center px-4 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">19</span>
            </div>
            <span className="text-base font-extrabold text-foreground">nineteen<span className="text-primary">.dev</span></span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
