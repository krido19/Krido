import React, { useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: "Ahmad Rizki",
        role: "Pemilik UMKM",
        avatar: "AR",
        rating: 5,
        text: "Website yang dibuat sangat profesional dan sesuai dengan kebutuhan bisnis saya. Prosesnya cepat dan komunikasinya sangat baik!",
    },
    {
        id: 2,
        name: "Siti Nurhaliza",
        role: "Content Creator",
        avatar: "SN",
        rating: 5,
        text: "Aplikasi Android yang dibuat sangat user-friendly. Pengunjung saya jadi lebih mudah mengakses konten melalui aplikasi.",
    },
    {
        id: 3,
        name: "Budi Santoso",
        role: "Startup Founder",
        avatar: "BS",
        rating: 5,
        text: "Hasil kerjanya sangat memuaskan! Revisi cepat dan hasilnya sesuai ekspektasi. Highly recommended!",
    },
];

const Testimonials = ({ theme }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className="py-20 relative z-10 pointer-events-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mb-12">
                    <Quote className="w-8 h-8 text-cyan-500 mr-4" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-wider">
                        Testimonials
                    </h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800 ml-8"></div>
                </div>

                <div className="relative">
                    {/* Testimonial Card */}
                    <div className="bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                        {/* Gradient accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-pink-500"></div>

                        {/* Quote icon */}
                        <Quote className="w-12 h-12 text-cyan-500/20 absolute top-4 right-4" />

                        {/* Rating */}
                        <div className="flex gap-1 mb-4">
                            {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>

                        {/* Text */}
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                            "{testimonials[currentIndex].text}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                {testimonials[currentIndex].avatar}
                            </div>
                            <div className="ml-4">
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {testimonials[currentIndex].name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {testimonials[currentIndex].role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            onClick={prevTestimonial}
                            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-cyan-400 hover:bg-cyan-400/10 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                                            ? 'w-6 bg-gradient-to-r from-cyan-400 to-pink-500'
                                            : 'bg-gray-400 dark:bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextTestimonial}
                            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-cyan-400 hover:bg-cyan-400/10 transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
