import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Star, MessageCircle, CheckCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ReviewForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    text: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.text) {
      setError('Nama dan ulasan wajib diisi.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('testimonials')
        .insert([{
          name: formData.name,
          role: formData.role || 'Client',
          rating: formData.rating,
          text: formData.text,
          status: 'pending' // Akan di-review admin di Supabase
        }]);

      if (dbError) throw dbError;
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat mengirim ulasan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <SEO title="Tulis Ulasan Anda" description="Berikan ulasan dan testimoni untuk nineteen.dev" />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-32">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Tulis Ulasan</h1>
            <p className="text-gray-500">Bagaimana pengalaman Anda bekerja sama dengan kami?</p>
          </div>

          {success ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-sm border border-emerald-100 animate-fade-in">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Terima Kasih!</h2>
              <p className="text-gray-600 mb-8">
                Ulasan Anda sangat berharga bagi kami dan akan segera ditinjau sebelum ditampilkan di website.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-outline"
              >
                Kembali ke Beranda
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold mb-6 animate-shake">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'fill-accent text-accent'
                            : 'fill-transparent text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Budi Santoso"
                    className="input-flat w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Peran / Instansi
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="CEO PT Maju Mundur"
                    className="input-flat w-full"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Komentar & Ulasan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Ceritakan pengalaman Anda di sini..."
                  rows={5}
                  className="input-flat w-full resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
                {loading ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReviewForm;
