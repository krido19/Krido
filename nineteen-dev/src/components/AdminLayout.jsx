import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Joyride, STATUS } from 'react-joyride';
import TourTooltip from './TourTooltip';
import {
  LayoutDashboard, User, Briefcase, Activity,
  Package, Zap, ShoppingCart, MessageSquare,
  LogOut, ExternalLink, Menu, X, ChevronRight, CreditCard, HelpCircle, FileText
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
  { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
  { to: '/dashboard/blogs', icon: FileText, label: 'Blogs' },
];

// idPrefix: 'menu-' untuk desktop (tour targets), 'mobile-menu-' untuk mobile (hindari ID duplikat)
const SidebarContent = ({ profile, isActive, setSidebarOpen, handleLogout, idPrefix = 'menu-' }) => (
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
      {navItems.map(({ to, icon: Icon, label, exact }) => {
        const active = isActive(to, exact);
        return (
          <Link
            key={to}
            to={to}
            id={`${idPrefix}${label.toLowerCase()}`}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 text-sm font-semibold transition-all duration-300 group ${
                active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-muted hover:text-foreground'
              }`}
          >
            <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                active ? 'text-white' : 'text-gray-400 group-hover:text-primary'
              }`} />
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

// Komponen rahasia untuk melewati masalah "titik hitam" Joyride yang membandel.
// Komponen ini akan tidak terlihat (opacity 0) dan secara otomatis mengklik dirinya sendiri
// seketika saat muncul di layar, sehingga kotak panduan langsung terbuka seketika!
const AutoClickBeacon = React.forwardRef((props, ref) => {
  const localRef = React.useRef(null);
  const combinedRef = ref || localRef;
  
  useEffect(() => {
    if (combinedRef && combinedRef.current) {
      // span.click() bekerja persis seperti button.click()
      combinedRef.current.click();
    }
  }, [combinedRef]);

  // Ekstrak props bawaan Joyride agar tidak bocor ke elemen DOM dan menyebabkan warning
  const { continuous, index, isLastStep, size, step, ...domProps } = props;

  return (
    <span 
      ref={combinedRef} 
      {...domProps} 
      style={{ opacity: 0, position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} 
      title="Auto Start Tour"
    />
  );
});

// Komponen pembantu untuk membuat tombol "Kembali ke Menu Utama" di setiap step
const BackToHubButton = ({ navigate, setStepIndex }) => (
  <button 
    onClick={() => {
      navigate('/dashboard');
      setStepIndex(0);
    }} 
    className="mt-4 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-md transition-colors flex items-center gap-2"
  >
    <span>←</span> Kembali ke Pilihan Menu
  </button>
);

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const isLocalTourPage = [
    '/profile', 
    '/portfolio', 
    '/dashboard/apps', 
    '/dashboard/services', 
    '/dashboard/orders', 
    '/dashboard/payments',
    '/dashboard/blogs'
  ].includes(location.pathname);

  const steps = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    return [
      // STEP 0: HUB UTAMA (Pilih Petualangan)
      {
        target: 'body',
        placement: 'center',
        title: '👋 Selamat Datang di Pusat Bantuan',
        content: (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 text-sm">Pilih modul mana yang ingin Anda pelajari lebih dalam hari ini. Anda bisa kembali ke menu ini kapan saja.</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setStepIndex(1)} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">📊 Dashboard</button>
              <button onClick={() => {
                sessionStorage.setItem('adminTourShown', 'true');
                sessionStorage.setItem('profileTourPending', 'true');
                setRunTour(false);
                navigate('/profile');
              }} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">👤 Profile Admin</button>
              <button onClick={() => {
                sessionStorage.setItem('adminTourShown', 'true');
                sessionStorage.setItem('portfolioTourPending', 'true');
                setRunTour(false);
                navigate('/portfolio');
              }} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">🎨 Portfolio</button>
              <button onClick={() => setStepIndex(4)} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">📈 Activities</button>
              <button onClick={() => {
                sessionStorage.setItem('adminTourShown', 'true');
                sessionStorage.setItem('appsTourPending', 'true');
                setRunTour(false);
                navigate('/dashboard/apps');
              }} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">📦 Apps / Produk</button>
              <button onClick={() => {
                sessionStorage.setItem('adminTourShown', 'true');
                sessionStorage.setItem('servicesTourPending', 'true');
                setRunTour(false);
                navigate('/dashboard/services');
              }} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">⚡ Layanan</button>
              <button onClick={() => {
                sessionStorage.setItem('adminTourShown', 'true');
                sessionStorage.setItem('ordersTourPending', 'true');
                setRunTour(false);
                navigate('/dashboard/orders');
              }} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">🛒 Pesanan</button>
              <button onClick={() => {
                sessionStorage.setItem('adminTourShown', 'true');
                sessionStorage.setItem('paymentsTourPending', 'true');
                setRunTour(false);
                navigate('/dashboard/payments');
              }} className="p-2 border border-gray-200 rounded text-sm text-left font-semibold hover:border-primary hover:text-primary transition-colors">💳 Pembayaran</button>
            </div>

            <button 
              onClick={() => { setRunTour(false); setStepIndex(0); }} 
              className="mt-2 text-sm text-red-500 hover:text-red-700 font-semibold underline self-center"
            >
              Tutup Panduan
            </button>
          </div>
        ),
        hideFooter: true, // Sembunyikan tombol Next/Skip bawaan agar user harus klik menu
      },
      // STEP 1: DASHBOARD
      {
        target: isMobile ? 'body' : '#menu-dashboard',
        title: '📊 Pusat Kendali (Dashboard)',
        content: (
          <div className="flex flex-col gap-2">
            <p>Ini adalah halaman utama Anda. Dari sini, Anda bisa mengawasi seluruh pergerakan bisnis secara <em>real-time</em>.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Pantau grafik ringkasan pendapatan.</li>
              <li>Lihat aktivitas dan pesanan terbaru klien.</li>
            </ul>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
      // STEP 2: PROFILE
      {
        target: isMobile ? 'body' : '#menu-profile',
        title: '👤 Pengaturan Profile Pribadi',
        content: (
          <div className="flex flex-col gap-2">
            <p>Di menu <strong>Profile</strong>, Anda memegang kendali atas identitas publik yang dilihat oleh klien.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Ganti foto profil dengan wajah atau logo terbaik Anda.</li>
              <li>Unggah dan tautkan file <strong>CV (Resume)</strong> agar klien bisa mengunduhnya secara langsung.</li>
              <li>Atur biografi singkat, keahlian, dan informasi kontak (Email, LinkedIn, dll).</li>
            </ul>
            <div className="bg-blue-50 text-blue-700 p-2 rounded-md mt-1 border border-blue-100 text-xs">
              <strong>Tips:</strong> Profil yang lengkap dan meyakinkan meningkatkan rasa percaya klien untuk menggunakan jasa Anda!
            </div>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
      // STEP 3: PORTFOLIO
      {
        target: isMobile ? 'body' : '#menu-portfolio',
        title: '🎨 Etalase Karya (Portfolio)',
        content: (
          <div className="flex flex-col gap-2">
            <p>Pamerkan hasil karya, desain, atau proyek sukses Anda di halaman ini.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Unggah screenshot atau gambar proyek beresolusi tinggi.</li>
              <li>Tulis studi kasus: tantangan klien dan solusi yang Anda berikan.</li>
              <li>Cantumkan link live-demo proyek jika ada.</li>
            </ul>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
      // STEP 4: ACTIVITIES
      {
        target: isMobile ? 'body' : '#menu-activities',
        title: '📈 Riwayat Aktivitas',
        content: (
          <div className="flex flex-col gap-2">
            <p>Lacak jejak operasional bisnis Anda di halaman <strong>Activities</strong>.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Mencatat riwayat login admin.</li>
              <li>Mencatat perubahan penting (misal: "Admin mengubah status pesanan #123").</li>
              <li>Sangat berguna untuk audit keamanan jika ada lebih dari 1 admin.</li>
            </ul>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
      // STEP 5: APPS
      {
        target: isMobile ? 'body' : '#menu-apps',
        title: '📦 Manajemen Aplikasi/Produk',
        content: (
          <div className="flex flex-col gap-2">
            <p>Jika Anda menjual <em>source code</em>, template, atau aplikasi siap pakai, kelola semuanya di menu <strong>Apps</strong>.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Tambahkan produk digital baru beserta link unduhannya.</li>
              <li>Atur harga lisensi (Single, Extended, dll).</li>
              <li>Pantau jumlah unduhan dan ulasan produk.</li>
            </ul>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
      // STEP 6: SERVICES
      {
        target: isMobile ? 'body' : '#menu-services',
        title: '⚡ Layanan & Jasa',
        content: (
          <div className="flex flex-col gap-2">
            <p>Jual kemampuan Anda dalam bentuk paket layanan.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Buat paket layanan (misal: "Pembuatan Website Basic", "Desain Logo Pro").</li>
              <li>Tentukan estimasi waktu pengerjaan dan harga.</li>
              <li>Bisa dihidup/matikan (nonaktif) kapan saja jika Anda sedang <em>fully booked</em>.</li>
            </ul>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
      // STEP 7: ORDERS
      {
        target: isMobile ? 'body' : '#menu-orders',
        title: '🛒 Manajemen Pesanan',
        content: (
          <div className="flex flex-col gap-2">
            <p>Setiap transaksi masuk dari klien akan bermuara di sini.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Pantau pesanan dari status <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">Pending</span> hingga <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">Selesai</span>.</li>
              <li>Berkomunikasi dua arah dengan klien di halaman detail pesanan.</li>
              <li>Unggah file hasil revisi atau *final delivery*.</li>
            </ul>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
      // STEP 8: PAYMENTS
      {
        target: isMobile ? 'body' : '#menu-payments',
        title: '💳 Konfirmasi Pembayaran',
        content: (
          <div className="flex flex-col gap-2">
            <p>Pastikan setiap pesanan telah dibayar lunas sebelum dikerjakan.</p>
            <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
              <li>Validasi bukti transfer yang diunggah klien.</li>
              <li>Pantau integrasi pembayaran otomatis (jika ada).</li>
              <li>Tolak pembayaran palsu atau kurang bayar dengan memberikan catatan.</li>
            </ul>
            <BackToHubButton navigate={navigate} setStepIndex={setStepIndex} />
          </div>
        ),
        placement: isMobile ? 'center' : 'right',
      },
    ];
  }, [navigate, setStepIndex]);

  const handleJoyrideCallback = (data) => {
    const { status, type, action, index } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      setStepIndex(0);
    } 
    // Handle 'next' & 'prev' buttons secara manual agar stepIndex tersinkronisasi
    else if (type === 'step:after') {
      if (action === 'next') setStepIndex(index + 1);
      if (action === 'prev') setStepIndex(index - 1);
    }
  };

  useEffect(() => {
    supabase.from('profiles').select('*').limit(1).single()
      .then(({ data }) => setProfile(data));

    // sessionStorage guard: tour hanya muncul sekali per sesi
    // Tanpa guard ini, setiap kali AdminLayout remount (bisa 4x di dev) akan
    // menjadwalkan timer baru → tour AdminLayout menyala saat EditProfile tour aktif
    // → dua Joyride overlay bertabrakan → seluruh layar gelap tanpa spotlight!
    if (!sessionStorage.getItem('adminTourShown')) {
      const timer = setTimeout(() => {
        setRunTour(true);
        sessionStorage.setItem('adminTourShown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleOpenHub = () => {
      setRunTour(true);
      setStepIndex(0);
    };
    window.addEventListener('open-help-hub', handleOpenHub);
    return () => window.removeEventListener('open-help-hub', handleOpenHub);
  }, []);

  const handleLogout = async () => {
    // Hapus flag tour agar muncul lagi saat login berikutnya
    sessionStorage.removeItem('adminTourShown');
    sessionStorage.removeItem('profileTourPending');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (to, exact) => {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  };

  const sidebarProps = { profile, isActive, setSidebarOpen, handleLogout };

  return (
    <div className="min-h-screen bg-muted flex relative">
      <Joyride
        steps={steps}
        run={runTour && !isLocalTourPage}
        stepIndex={stepIndex}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        disableScrolling={false}
        scrollToFirstStep={true}
        spotlightClicks={false}
        beaconComponent={AutoClickBeacon}
        tooltipComponent={TourTooltip}
        callback={handleJoyrideCallback}
        locale={{
          back: 'Kembali',
          close: 'Tutup',
          last: 'Selesai',
          next: 'Lanjut',
          skip: 'Lewati',
        }}
        styles={{
          options: {
            primaryColor: '#06b6d4',
            zIndex: 10000,
            skipColor: '#9ca3af',
          },
          buttonSkip: { color: '#9ca3af', fontSize: 13 },
          tooltipTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
          tooltipContent: { fontSize: 13, padding: '8px 0' },
          tooltipContainer: { textAlign: 'left' },
          tooltip: { borderRadius: 14, padding: 20 },
        }}
      />

      {/* Desktop Sidebar — ID 'menu-*' dipakai oleh tour */}
      <aside className="hidden md:flex w-60 bg-white border-r-2 border-gray-100 flex-col fixed top-0 bottom-0 left-0 z-30">
        <SidebarContent {...sidebarProps} idPrefix="menu-" />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar — pakai prefix 'mobile-menu-' agar ID tidak duplikat dengan desktop */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white z-50 flex flex-col md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent {...sidebarProps} idPrefix="mobile-menu-" />
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
