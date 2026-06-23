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


      <div className="container-max relative py-8">
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
