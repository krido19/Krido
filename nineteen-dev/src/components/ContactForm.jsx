import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ContactForm = ({ profile }) => {
  const { t } = useTranslation();

  return (
    <section id="contact" className="section-accent py-24 relative overflow-hidden">
      {/* Geometric decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 rotate-45" />

      <div className="container-max relative">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <p className="section-label text-amber-800 mb-2">{t('nav_contact')}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground mb-6">
            {t('contact_title')}
          </h2>
          <p className="text-lg text-amber-800 font-medium mb-10 max-w-xl">
            {t('contact_subtitle')}
          </p>

          {profile?.phone && (
            <a
              href={`https://wa.me/${profile.phone}?text=${encodeURIComponent('Halo, saya tertarik untuk membuat website/aplikasi.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-foreground text-white font-bold px-10 py-5 text-lg rounded-md transition-all duration-200 hover:scale-105 hover:bg-gray-800 shadow-xl"
            >
              <MessageCircle className="w-6 h-6" />
              {t('contact_whatsapp')}
              <ArrowRight className="w-5 h-5" />
            </a>
          )}

          {/* Decorative element */}
          <div className="mt-16 grid grid-cols-2 gap-6 w-full max-w-md">
            {[
              { label: '< 24h', desc: 'Response time' },
              { label: '30 days', desc: 'Warranty period' },
            ].map(({ label, desc }) => (
              <div key={desc} className="bg-white/30 rounded-lg p-6 hover:bg-white/40 transition-colors">
                <p className="text-3xl font-extrabold text-foreground">{label}</p>
                <p className="text-sm font-semibold text-amber-800 mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

