import React, { useState } from 'react';
import { MessageCircle, Send, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const ContactForm = ({ profile }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      const { error } = await supabase.from('contacts').insert([{
        name: form.name,
        email: form.email,
        message: form.message,
      }]);
      if (error) throw error;
      toast.success(t('contact_success'));
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      toast.error(t('contact_error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section-accent py-20 relative overflow-hidden">
      {/* Geometric decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 rotate-45" />

      <div className="container-max relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: heading + WA button */}
          <div>
            <p className="section-label text-amber-800 mb-2">{t('nav_contact')}</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground mb-6">
              {t('contact_title')}
            </h2>
            <p className="text-lg text-amber-800 font-medium mb-10">
              {t('contact_subtitle')}
            </p>

            {profile?.phone && (
              <a
                href={`https://wa.me/${profile.phone}?text=${encodeURIComponent('Halo, saya tertarik untuk membuat website/aplikasi.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-foreground text-white font-bold px-8 py-4 rounded-md transition-all duration-200 hover:scale-105 hover:bg-gray-800"
              >
                <MessageCircle className="w-5 h-5" />
                {t('contact_whatsapp')}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            {/* Decorative element */}
            <div className="mt-16 grid grid-cols-2 gap-4">
              {[
                { label: '< 24h', desc: 'Response time' },
                { label: '30 days', desc: 'Warranty period' },
              ].map(({ label, desc }) => (
                <div key={desc} className="bg-white/30 rounded-lg p-5">
                  <p className="text-2xl font-extrabold text-foreground">{label}</p>
                  <p className="text-sm font-semibold text-amber-800 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-lg p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  {t('contact_name')}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  required
                  className="input-flat border-2 border-transparent"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  {t('contact_email')}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  required
                  className="input-flat border-2 border-transparent"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  {t('contact_message')}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t('contact_message')}
                  required
                  className="input-flat border-2 border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {sending ? t('contact_sending') : t('contact_send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
