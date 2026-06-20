import React, { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import { Sparkles, Calendar } from 'lucide-react';

const ComingSoon = () => {
  // Target Launch Date: April 4, 2026 00:00:00
  const targetDate = new Date('2026-04-04T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimerBox = ({ label, value }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md">
        <span className="text-2xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-4 text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      <SEO title="Coming Soon | nineteen.dev" />
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center z-10">
        
        {/* Logo */}
        <div className="mb-10 sm:mb-12 flex flex-col items-center animate-fade-in-up">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <span className="text-primary font-black text-2xl sm:text-3xl leading-none">19</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">nineteen</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-300 tracking-tight">.dev</span>
          </div>
        </div>

        {/* Announcement */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6 sm:mb-8 transition-transform hover:scale-105" style={{ animationDelay: '100ms' }}>
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          The Next Generation
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight max-w-4xl" style={{ animationDelay: '200ms' }}>
          We're brewing <br/>something <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">epic.</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-blue-200 font-medium mb-10 sm:mb-16 max-w-2xl px-4" style={{ animationDelay: '300ms' }}>
          Our digital studio officially launches on April 4th. <br className="hidden sm:block"/> Get ready for high-performance websites & mobile apps.
        </p>

        {/* Countdown */}
        <div className="flex items-center gap-2 sm:gap-6" style={{ animationDelay: '400ms' }}>
          <TimerBox label="Days" value={timeLeft.days} />
          <div className="text-xl sm:text-2xl font-bold text-white/30 -mt-6 sm:-mt-8">:</div>
          <TimerBox label="Hours" value={timeLeft.hours} />
          <div className="text-xl sm:text-2xl font-bold text-white/30 -mt-6 sm:-mt-8">:</div>
          <TimerBox label="Minutes" value={timeLeft.minutes} />
          <div className="text-xl sm:text-2xl font-bold text-white/30 -mt-6 sm:-mt-8">:</div>
          <TimerBox label="Seconds" value={timeLeft.seconds} />
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center z-10 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-blue-200 font-medium text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Grand Launch: April 4th, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
