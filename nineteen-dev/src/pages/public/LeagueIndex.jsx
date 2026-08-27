import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { LEAGUES } from '../../lib/footballApi';

const LEAGUE_COLORS = {
  PL:  'from-purple-600 to-indigo-600',
  BL1: 'from-red-600 to-red-800',
  PD:  'from-orange-500 to-red-600',
  SA:  'from-blue-600 to-blue-900',
  FL1: 'from-blue-500 to-blue-700',
};

export default function LeagueIndex() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <SEO title="Liga Eropa | nineteen.dev" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="w-full max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-3 text-center" style={{ letterSpacing: '-0.05em' }}>
            Liga Eropa
          </h1>
          <p className="text-center text-gray-400 font-bold mb-12 text-sm uppercase tracking-widest">
            Jadwal & Klasemen 5 Liga Top
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(LEAGUES).map(([code, league]) => (
              <Link
                key={code}
                to={`/league/${code}`}
                className={`relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br ${LEAGUE_COLORS[code]} text-white shadow-2xl hover:-translate-y-2 hover:shadow-3xl transition-all duration-300 group`}
              >
                <div className="absolute -right-4 -bottom-4 text-8xl font-black opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                  {league.flag}
                </div>
                <div className="relative z-10">
                  <span className="text-5xl mb-4 block">{league.flag}</span>
                  <h2 className="text-2xl font-black leading-tight">{league.name}</h2>
                  <p className="text-white/70 font-bold text-sm mt-1 uppercase tracking-widest">{league.country}</p>
                  <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-black">
                    Lihat Jadwal &amp; Klasemen →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
