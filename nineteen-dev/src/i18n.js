import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Nav
      nav_projects: 'Projects',
      nav_services: 'Services',
      nav_activities: 'Activities',
      nav_contact: 'Contact',
      nav_cta: 'Get in Touch',
      signin: 'Sign In',

      // Hero
      hero_badge: 'Full-Stack Development Studio',
      hero_title: 'We Build Digital Products That Matter',
      hero_subtitle: 'Crafting high-performance websites and mobile apps with modern technology and design.',
      hero_cta_primary: 'Start Your Project',
      hero_cta_secondary: 'View Pricing',
      hero_available: 'Available for new projects',

      // Stats
      stat_projects: 'Projects Delivered',
      stat_clients: 'Happy Clients',
      stat_years: 'Years Experience',
      stat_rating: 'Client Rating',

      // Portfolio
      portfolio_title: 'Selected Work',
      portfolio_subtitle: 'Recent projects we\'re proud of',
      view_project: 'View Project',
      view_all_projects: 'View All Projects',

      // Activities
      activities_title: 'Latest Updates',
      activities_subtitle: 'What we\'ve been working on',
      view_all_activities: 'View All Updates',

      // Testimonials
      testimonials_title: 'Client Stories',
      testimonials_subtitle: 'What our clients say about working with us',

      // Contact
      contact_title: 'Let\'s Build Together',
      contact_subtitle: 'Ready to start your project? We\'d love to hear from you.',
      contact_name: 'Your Name',
      contact_email: 'Email Address',
      contact_message: 'Tell us about your project...',
      contact_send: 'Send Message',
      contact_whatsapp: 'Chat on WhatsApp',
      contact_sending: 'Sending...',
      contact_success: 'Message sent successfully!',
      contact_error: 'Failed to send. Please try again.',

      // Services
      services_title: 'Services & Pricing',
      services_subtitle: 'Transparent pricing for every project size',
      est_time: 'Est. time',
      popular: 'Most Popular',
      choose_plan: 'Choose This Plan',

      // FAQ
      faq_title: 'Frequently Asked',
      faq_q1: 'How long does it take to build a website?',
      faq_a1: 'Depending on complexity. A landing page typically takes 3–5 working days, while a full-featured website can take 1–2 weeks.',
      faq_q2: 'Is there a warranty after the project is complete?',
      faq_a2: 'Yes! We provide 30 days of minor revision and bug fix warranty after project completion.',
      faq_q3: 'What are the payment options?',
      faq_a3: 'Payment via bank transfer. Scheme: 50% upfront to start, 50% upon completion.',
      faq_q4: 'Can I request revisions?',
      faq_a4: 'Of course! Up to 3 major revisions are included. Unlimited minor revisions during warranty.',
      faq_q5: 'Does it include domain and hosting?',
      faq_a5: 'Price does not include domain and hosting, but we can help you set it up and recommend the best provider.',

      // Projects page
      projects_title: 'All Projects',
      projects_subtitle: 'Browse our full portfolio',
      filter_all: 'All',
      load_more: 'Load More',

      // Activities page
      activities_page_title: 'All Updates',
      activities_page_subtitle: 'Our journey and milestones',

      // Footer
      footer_tagline: 'Building the future, one line at a time.',
      footer_rights: 'All rights reserved.',

      // Common
      language: 'Language',
      back_home: 'Back to Home',
    }
  },
  id: {
    translation: {
      // Nav
      nav_projects: 'Proyek',
      nav_services: 'Layanan',
      nav_activities: 'Aktivitas',
      nav_contact: 'Kontak',
      nav_cta: 'Hubungi Kami',
      signin: 'Masuk',

      // Hero
      hero_badge: 'Studio Pengembangan Full-Stack',
      hero_title: 'Kami Membangun Produk Digital yang Bermakna',
      hero_subtitle: 'Menciptakan website dan aplikasi mobile berkinerja tinggi dengan teknologi dan desain modern.',
      hero_cta_primary: 'Mulai Proyek',
      hero_cta_secondary: 'Lihat Harga',
      hero_available: 'Tersedia untuk proyek baru',

      // Stats
      stat_projects: 'Proyek Selesai',
      stat_clients: 'Klien Puas',
      stat_years: 'Tahun Pengalaman',
      stat_rating: 'Rating Klien',

      // Portfolio
      portfolio_title: 'Karya Terpilih',
      portfolio_subtitle: 'Proyek terbaru yang kami banggakan',
      view_project: 'Lihat Proyek',
      view_all_projects: 'Lihat Semua Proyek',

      // Activities
      activities_title: 'Update Terbaru',
      activities_subtitle: 'Yang sedang kami kerjakan',
      view_all_activities: 'Lihat Semua Update',

      // Testimonials
      testimonials_title: 'Kata Klien',
      testimonials_subtitle: 'Apa yang klien katakan tentang bekerja bersama kami',

      // Contact
      contact_title: 'Mari Berkolaborasi',
      contact_subtitle: 'Siap memulai proyek? Kami senang mendengar dari Anda.',
      contact_name: 'Nama Anda',
      contact_email: 'Alamat Email',
      contact_message: 'Ceritakan tentang proyek Anda...',
      contact_send: 'Kirim Pesan',
      contact_whatsapp: 'Chat via WhatsApp',
      contact_sending: 'Mengirim...',
      contact_success: 'Pesan berhasil dikirim!',
      contact_error: 'Gagal mengirim. Silakan coba lagi.',

      // Services
      services_title: 'Layanan & Harga',
      services_subtitle: 'Harga transparan untuk setiap skala proyek',
      est_time: 'Est. waktu',
      popular: 'Terpopuler',
      choose_plan: 'Pilih Paket Ini',

      // FAQ
      faq_title: 'Pertanyaan Umum',
      faq_q1: 'Berapa lama proses pembuatan website?',
      faq_a1: 'Tergantung kompleksitas. Landing page biasanya 3–5 hari kerja, website fitur lengkap 1–2 minggu.',
      faq_q2: 'Apakah ada garansi setelah project selesai?',
      faq_a2: 'Ya! Kami memberikan garansi revisi minor dan perbaikan bug selama 30 hari setelah project selesai.',
      faq_q3: 'Bagaimana cara pembayaran?',
      faq_a3: 'Pembayaran via transfer bank. Skema: 50% di awal, 50% setelah selesai.',
      faq_q4: 'Apakah bisa request revisi?',
      faq_a4: 'Tentu! Maksimal 3x revisi major sudah termasuk dalam harga. Revisi minor unlimited selama masa garansi.',
      faq_q5: 'Apakah include domain dan hosting?',
      faq_a5: 'Harga tidak termasuk domain dan hosting, namun kami bisa membantu setup dan merekomendasikan provider terbaik.',

      // Projects page
      projects_title: 'Semua Proyek',
      projects_subtitle: 'Jelajahi portofolio lengkap kami',
      filter_all: 'Semua',
      load_more: 'Muat Lebih Banyak',

      // Activities page
      activities_page_title: 'Semua Update',
      activities_page_subtitle: 'Perjalanan dan pencapaian kami',

      // Footer
      footer_tagline: 'Membangun masa depan, satu baris kode sekaligus.',
      footer_rights: 'Semua hak dilindungi.',

      // Common
      language: 'Bahasa',
      back_home: 'Kembali ke Beranda',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'id',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
