import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-purple-500', 'bg-pink-500'];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Kasih color random/berurutan untuk tiap testimonial agar UI tetap cantik
      const formatted = (data || []).map((item, idx) => ({
        ...item,
        avatar: item.name.substring(0, 2).toUpperCase(),
        color: colors[idx % colors.length]
      }));
      
      setTestimonials(formatted);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (loading || testimonials.length === 0) {
    return null; // Sembunyikan section jika tidak ada data/sedang loading
  }

  const current = testimonials[currentIndex];

  return (
    <section className="section-secondary py-20 relative overflow-hidden">
      {/* Geometric decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-lg rotate-45 -translate-y-1/2" />

      <div className="container-max relative">
        {/* Section header */}
        <div className="mb-12">
          <p className="section-label text-emerald-200 mb-2">{t('testimonials_title')}</p>
          <h2 className="section-title-white">{t('testimonials_subtitle')}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Main testimonial card */}
          <div className="bg-white rounded-lg p-8 relative">
            {/* Color accent bar */}
            <div className={`absolute top-0 left-0 w-2 h-full ${current.color} rounded-l-lg`} />

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>

            {/* Quote */}
            <Quote className="w-10 h-10 text-gray-100 mb-4" />
            <p className="text-lg text-foreground font-medium leading-relaxed mb-8">
              "{current.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${current.color} rounded-md flex items-center justify-center text-white font-bold text-sm`}>
                {current.avatar}
              </div>
              <div>
                <p className="font-bold text-foreground">{current.name}</p>
                <p className="text-sm text-gray-500 font-medium">{current.role || 'Client'}</p>
              </div>
            </div>
          </div>

          {/* Navigation & dots */}
          <div className="flex flex-col gap-8">
            {/* Mini cards for other testimonials (max 3) */}
            {testimonials.filter((_, idx) => idx !== currentIndex).slice(0, 3).map((item, i) => (
              <div
                key={item.id}
                onClick={() => setCurrentIndex(testimonials.indexOf(item))}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 ${item.color} rounded-md flex items-center justify-center text-white font-bold text-xs`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <p className="text-emerald-200 text-xs">{item.role || 'Client'}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm line-clamp-2 group-hover:text-white/80 transition-colors">
                  "{item.text}"
                </p>
              </div>
            ))}

            {/* Arrows */}
            {testimonials.length > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={prev}
                  className="w-12 h-12 bg-white/10 hover:bg-white rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 text-white group-hover:text-primary" />
                </button>
                <button
                  onClick={next}
                  className="w-12 h-12 bg-white/10 hover:bg-white rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 text-white group-hover:text-primary" />
                </button>
                <div className="flex gap-2 ml-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white/30'
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
