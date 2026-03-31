import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = ({ transparent = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  const navLinks = [
    { href: '/projects', label: t('nav_projects') },
    { href: '/services', label: t('nav_services') },
    { href: '/activities', label: t('nav_activities') },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-gray-100 transition-all duration-200`}>
      <div className="container-max">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* Icon mark */}
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-200">
              <span className="text-white font-black text-sm leading-none">19</span>
            </div>
            {/* Wordmark */}
            <div className="flex items-center gap-0.5">
              <span className="text-lg font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors duration-200">
                nineteen
              </span>
              <span className="text-lg font-extrabold text-primary tracking-tight">
                .dev
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 group" title="Change Language / Ganti Bahasa">
              <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors cursor-default hidden lg:block">
                {t('language')}:
              </span>
              <div className="flex gap-1 bg-muted rounded-md p-1 border border-gray-100 shadow-inner">
                <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded transition-all duration-200 ${
                  i18n.language === 'en'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('id')}
                className={`px-2 py-1 text-xs font-bold rounded transition-all duration-200 ${
                  i18n.language === 'id'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-foreground'
                }`}
              >
                ID
              </button>
            </div>
            </div>

            <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-foreground transition-colors">
              <LogIn className="w-4 h-4" />
              <span>{t('signin')}</span>
            </Link>

            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary text-sm px-5 py-2"
            >
              {t('nav_cta')}
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t-2 border-gray-100">
          <div className="container-max py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-semibold py-2 border-b border-gray-100 ${
                  isActive(link.href) ? 'text-primary' : 'text-gray-600'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400">{t('language')}:</span>
              <div className="flex gap-1 bg-muted rounded-md p-1 w-max border border-gray-100 shadow-inner">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    i18n.language === 'en' ? 'bg-primary text-white' : 'text-gray-500'
                  }`}
                >EN</button>
                <button
                  onClick={() => changeLanguage('id')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    i18n.language === 'id' ? 'bg-primary text-white' : 'text-gray-500'
                  }`}
                >ID</button>
              </div>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <LogIn className="w-4 h-4" /> {t('signin')}
              </Link>
            </div>
            <a
              href="#contact"
              className="btn-primary text-sm text-center"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav_cta')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
