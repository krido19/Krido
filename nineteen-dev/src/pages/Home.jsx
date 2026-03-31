import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import {
  ExternalLink, ArrowRight,
  MessageCircle, Code2, Zap, Users, Star, FileText,
  Share2, Link as LinkIcon, X, Play
} from 'lucide-react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ─── Lightbox Modal ─────────────────────────────────────────────────────────
const Lightbox = ({ item, type, onClose }) => {
  const [playing, setPlaying] = useState(false);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]{11})/);
    return m ? m[1] : null;
  };

  const ytId = type === 'portfolio' ? getYouTubeId(item.video_url) : null;
  const imgSrc = `${SUPABASE_URL}/storage/v1/object/public/${type === 'portfolio' ? 'portfolio' : 'activities'}/${item.image_url}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center text-white transition-all z-50"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex flex-col items-center max-w-3xl w-full gap-4" onClick={e => e.stopPropagation()}>
        {playing && ytId ? (
          <div className="w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="relative">
            <img
              src={imgSrc}
              alt={item.title}
              className="max-w-full max-h-[65vh] object-contain rounded-lg"
            />
            {ytId && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 transition-all duration-200">
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </div>
              </button>
            )}
          </div>
        )}
        <div className="bg-white rounded-lg p-4 w-full flex items-center justify-between gap-4">
          <span className="font-bold text-foreground truncate">{item.title}</span>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${item.title} — https://nineteen.dev/`);
                toast.success('Link copied!');
              }}
              className="w-9 h-9 bg-muted hover:bg-gray-200 rounded-md flex items-center justify-center transition-all hover:scale-110"
            >
              <LinkIcon className="w-4 h-4 text-gray-600" />
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out "${item.title}"! — https://nineteen.dev/`)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-[#25D366] hover:bg-[#1daa55] rounded-md flex items-center justify-center transition-all hover:scale-110"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Home Page ───────────────────────────────────────────────────────────────
const Home = () => {
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: profiles } = await supabase
        .from('profiles').select('*').order('updated_at', { ascending: false }).limit(1);
      const p = profiles?.[0] || null;
      setProfile(p);

      if (p) {
        const [{ data: port }, { data: acts }] = await Promise.all([
          supabase.from('portfolio').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(3),
          supabase.from('activities').select('*').eq('user_id', p.id).order('date', { ascending: false }).limit(3),
        ]);
        setPortfolio(port || []);
        setActivities(acts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { value: '50+', label: t('stat_projects'), color: 'text-primary' },
    { value: '30+', label: t('stat_clients'), color: 'text-secondary' },
    { value: '3+', label: t('stat_years'), color: 'text-accent' },
    { value: '5.0', label: t('stat_rating'), color: 'text-foreground' },
  ];

  const socialLinks = [
    { url: profile?.github_url, label: 'GitHub', text: 'GH' },
    { url: profile?.linkedin_url, label: 'LinkedIn', text: 'LI' },
    { url: profile?.instagram_url, label: 'Instagram', text: 'IG' },
  ].filter(s => s.url);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-primary rounded-md animate-ping opacity-25" />
            <div className="absolute inset-2 bg-primary rounded-sm" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-foreground">nineteen</span>
            <span className="text-lg font-bold text-primary">.dev</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={profile?.full_name || 'nineteen.dev'}
        description={profile?.bio || 'nineteen.dev — Professional Web & Mobile Development Studio'}
        image={profile?.avatar_url ? `${SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}` : null}
      />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 } }} />
      <Navbar />

      {/* ── HERO ── */}
      <section className="section-primary pt-32 pb-24 relative overflow-hidden">
        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/10 rounded-lg rotate-12 -translate-y-1/2" />
        <div className="absolute top-20 left-1/3 w-16 h-16 bg-white/10 rounded-lg rotate-45" />

        <div className="container-max relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                {t('hero_available')}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                {t('hero_title')}
              </h1>

              <p className="text-xl text-blue-100 font-medium leading-relaxed mb-10 max-w-lg">
                {t('hero_subtitle')}
              </p>

              <div className="flex flex-wrap gap-4">
                {profile?.phone && (
                  <a
                    href={`https://wa.me/${profile.phone}?text=${encodeURIComponent('Halo, saya tertarik untuk membuat website/aplikasi.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-4 rounded-md transition-all duration-200 hover:scale-105 hover:bg-blue-50"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('hero_cta_primary')}
                  </a>
                )}
                <Link
                  to="/services"
                  className="btn-outline-white px-7 py-4 text-base font-bold"
                >
                  {t('hero_cta_secondary')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 mt-8">
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Follow</span>
                  {socialLinks.map(({ url, label, text }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 bg-white/15 hover:bg-white rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 group text-xs font-bold text-white group-hover:text-primary"
                    >
                      {text}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Avatar card */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main card */}
                <div className="w-72 h-72 lg:w-80 lg:h-80 bg-white/15 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={`${SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                      fetchPriority="high"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <Code2 className="w-24 h-24 text-white/40" />
                    </div>
                  )}
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 px-5 py-3">
                    <p className="text-white font-bold text-lg leading-tight">{profile?.full_name || 'nineteen.dev'}</p>
                    <p className="text-blue-200 text-sm font-medium">{profile?.title || 'Full-Stack Developer'}</p>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-secondary text-white font-bold text-sm px-4 py-2 rounded-md">
                  <Star className="w-4 h-4 inline mr-1 fill-white" /> 5.0
                </div>
                {/* Resume download */}
                {profile?.resume_url && (
                  <a
                    href={`${SUPABASE_URL}/storage/v1/object/public/resumes/${profile.resume_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute -bottom-4 -left-4 flex items-center gap-2 bg-white text-foreground font-bold text-sm px-4 py-2 rounded-md transition-all hover:scale-105"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="section-muted py-12 border-b-2 border-gray-200">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <p className={`text-4xl md:text-5xl font-extrabold tracking-tight ${color} mb-1`}>{value}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      {portfolio.length > 0 && (
        <section className="section-white py-20">
          <div className="container-max">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label text-primary mb-2">{t('portfolio_subtitle')}</p>
                <h2 className="section-title">{t('portfolio_title')}</h2>
              </div>
              <Link to="/projects" className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-blue-700 transition-colors">
                {t('view_all_projects')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => { if (e.target.closest('button,a')) return; setSelectedItem({ item, type: 'portfolio' }); }}
                  className="group card-flat bg-blue-50 overflow-hidden rounded-lg p-0 cursor-pointer"
                >
                  {item.image_url && (
                    <div className="overflow-hidden h-52">
                      <img
                        src={`${SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image_url}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>

                    {item.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.skills.map((s, i) => (
                          <span key={i} className="tag-blue">{s}</span>
                        ))}
                      </div>
                    )}

                    {item.project_url && (
                      <button
                        className="flex items-center gap-2 text-sm font-bold text-white bg-primary px-4 py-2 rounded-md transition-all duration-200 hover:bg-blue-700 hover:scale-105"
                        onClick={(e) => { e.stopPropagation(); window.open(item.project_url, '_blank', 'noopener,noreferrer'); }}
                      >
                        {t('view_project')} <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10 md:hidden">
              <Link to="/projects" className="btn-outline">
                {t('view_all_projects')} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── ACTIVITIES ── */}
      {activities.length > 0 && (
        <section className="section-muted py-20">
          <div className="container-max">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label text-secondary mb-2">{t('activities_subtitle')}</p>
                <h2 className="section-title">{t('activities_title')}</h2>
              </div>
              <Link to="/activities" className="hidden md:flex items-center gap-2 text-sm font-bold text-secondary hover:text-emerald-700 transition-colors">
                {t('view_all_activities')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activities.map((act, idx) => {
                const colors = [
                  { bg: 'bg-blue-50', dot: 'bg-primary', label: 'text-primary' },
                  { bg: 'bg-emerald-50', dot: 'bg-secondary', label: 'text-secondary' },
                  { bg: 'bg-amber-50', dot: 'bg-accent', label: 'text-amber-600' },
                ];
                const c = colors[idx % colors.length];
                return (
                  <div
                    key={act.id}
                    className={`${c.bg} rounded-lg p-6 transition-all duration-200 hover:scale-[1.02] cursor-pointer group`}
                    onClick={() => act.image_url && setSelectedItem({ item: act, type: 'activities' })}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-3 h-3 ${c.dot} rounded-full`} />
                      <time className={`text-xs font-bold ${c.label} uppercase tracking-wider`}>
                        {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                    </div>
                    {act.image_url && (
                      <div className="overflow-hidden h-36 rounded-md mb-4">
                        <img
                          src={`${SUPABASE_URL}/storage/v1/object/public/activities/${act.image_url}`}
                          alt={act.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{act.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3">{act.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10 md:hidden">
              <Link to="/activities" className="btn-outline inline-flex items-center gap-2">
                {t('view_all_activities')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <Testimonials />

      {/* ── CONTACT FORM ── */}
      <ContactForm profile={profile} />

      {/* ── FOOTER ── */}
      <Footer profile={profile} />

      {/* ── LIGHTBOX ── */}
      {selectedItem && (
        <Lightbox
          item={selectedItem.item}
          type={selectedItem.type}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Home;
