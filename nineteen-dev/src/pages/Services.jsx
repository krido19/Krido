import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock, MessageCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

const PLAN_COLORS = [
  { bg: 'bg-blue-50', accent: 'bg-primary', text: 'text-primary' },
  { bg: 'bg-gray-50', accent: 'bg-foreground', text: 'text-foreground' },
  { bg: 'bg-emerald-50', accent: 'bg-secondary', text: 'text-secondary' },
];

const Services = () => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: profileData }, { data: servicesData }] = await Promise.all([
      supabase.from('profiles').select('*').limit(1).single(),
      supabase.from('services').select('*').order('created_at', { ascending: true }),
    ]);
    setProfile(profileData || null);
    setServices(servicesData || []);
    setLoading(false);
  };

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO title={t('services_title')} description={t('services_subtitle')} url={`${window.location.origin}/services`} />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif' } }} />
      <Navbar />

      {/* ── Header ── */}
      <section className="section-dark pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-primary/30 rounded-full translate-y-1/2 rotate-45" />
        <div className="container-max relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> {t('back_home')}
          </Link>
          <p className="section-label text-gray-400 mb-3">{t('services_subtitle')}</p>
          <h1 className="section-title-white mb-6">{t('services_title')}</h1>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gray-400">{t('hero_available')}</span>
          </div>
        </div>
      </section>

      {/* ── Service Cards ── */}
      <section className="section-muted py-20">
        <div className="container-max">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service, idx) => {
                const color = PLAN_COLORS[idx % PLAN_COLORS.length];
                const title = i18n.language === 'id' ? service.title_id : service.title_en;
                const time = i18n.language === 'id' ? service.time_id : service.time_en;
                const features = i18n.language === 'id' ? service.features_id : service.features_en;
                const featuresList = typeof features === 'string' ? JSON.parse(features) : (features || []);

                return (
                  <div
                    key={service.id}
                    className={`relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                      service.popular ? 'ring-4 ring-primary' : ''
                    }`}
                  >
                    {service.popular && (
                      <div className="bg-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-2 text-center">
                        ⭐ {t('popular')}
                      </div>
                    )}
                    <div className={`${color.bg} p-8 h-full flex flex-col`}>
                      {/* Accent bar */}
                      <div className={`w-12 h-1 ${color.accent} rounded-full mb-6`} />

                      <h3 className={`text-2xl font-extrabold ${color.text} mb-2`}>{title}</h3>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-extrabold text-foreground">{service.price}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
                        <Clock className="w-4 h-4" />
                        <span>{t('est_time')}: {time}</span>
                      </div>

                      <ul className="space-y-3 mb-8 flex-1">
                        {featuresList.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                            <div className={`w-5 h-5 ${color.accent} rounded-sm flex items-center justify-center shrink-0 mt-0.5`}>
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() =>
                          profile?.phone &&
                          window.open(
                            `https://wa.me/${profile.phone}?text=${encodeURIComponent(`Halo, saya tertarik dengan paket ${title}.`)}`,
                            '_blank'
                          )
                        }
                        className={`w-full ${color.accent} text-white font-bold py-4 rounded-md transition-all duration-200 hover:scale-105 hover:opacity-90 flex items-center justify-center gap-2`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t('choose_plan')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-white py-20">
        <div className="container-max">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <p className="section-label text-primary mb-2"><Zap className="w-4 h-4 inline mr-1" />{t('faq_title')}</p>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>

            <div className="divide-y-2 divide-gray-100">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <span className="font-bold text-foreground text-lg pr-8 group-hover:text-primary transition-colors">
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 ${
                      openFaq === idx ? 'bg-primary text-white' : 'bg-muted text-gray-500 group-hover:bg-primary group-hover:text-white'
                    }`}>
                      {openFaq === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {openFaq === idx && (
                    <p className="mt-4 text-gray-600 leading-relaxed text-base">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="section-primary py-16">
        <div className="container-max text-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="w-96 h-96 bg-white rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative">
            Ready to Start Your Project?
          </h2>
          <p className="text-blue-100 font-medium mb-8 relative">
            {t('contact_subtitle')}
          </p>
          {profile?.phone && (
            <a
              href={`https://wa.me/${profile.phone}?text=${encodeURIComponent('Halo, saya tertarik untuk membuat website/aplikasi.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-md transition-all duration-200 hover:scale-105 hover:bg-blue-50"
            >
              <MessageCircle className="w-5 h-5" />
              {t('contact_whatsapp')}
            </a>
          )}
        </div>
      </section>

      <Footer profile={profile} />
    </div>
  );
};

export default Services;
