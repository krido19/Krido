import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = ({ profile }) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const socialLinks = [
    { url: profile?.github_url, label: 'GitHub', text: 'GH' },
    { url: profile?.linkedin_url, label: 'LinkedIn', text: 'LI' },
    { url: profile?.instagram_url, label: 'Instagram', text: 'IG' },
    { url: profile?.twitter_url, label: 'Twitter', text: 'TW' },
  ].filter(s => s.url);

  return (
    <footer className="section-dark text-white relative overflow-hidden">

      {/* Geometric decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full -translate-x-1/2 translate-y-1/2" />

      {/* Giant Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.03]">
        <span className="text-[12vw] font-black text-white whitespace-nowrap tracking-tighter">
          NINETEENDEV
        </span>
      </div>

      <div className="container-max relative py-12 min-h-[180px] flex items-end">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {year} nineteen.dev — {t('footer_rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
