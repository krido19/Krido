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

      <div className="container-max relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center shrink-0">
                <span className="text-white font-black text-sm leading-none">19</span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-xl font-extrabold text-white">nineteen</span>
                <span className="text-xl font-extrabold text-primary">.dev</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {t('footer_tagline')}
            </p>
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialLinks.map(({ url, label, text }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 bg-white/10 hover:bg-primary rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 text-xs font-bold text-white"
                  >
                    {text}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Navigation</p>
            <div className="flex flex-col gap-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/projects', label: t('nav_projects') },
                { to: '/services', label: t('nav_services') },
                { to: '/activities', label: t('nav_activities') },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Contact</p>
            <div className="flex flex-col gap-3">
              {profile?.phone && (
                <a
                  href={`https://wa.me/${profile.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  WhatsApp: +{profile.phone}
                </a>
              )}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {year} nineteen.dev — {t('footer_rights')}
          </p>
          <p className="text-gray-600 text-xs font-mono">
            Built with React + Vite + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
