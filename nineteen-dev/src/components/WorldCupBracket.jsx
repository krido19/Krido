import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { Link } from 'react-router-dom';

// Palet warna resmi FIFA 26
const COLORS = ['#4D00FF', '#FF004D', '#00FF87', '#00B3FF'];

// Mapping Negara ke ISO Code untuk bendera (karena API worldcup26.ir tidak menyediakan logo)
const COUNTRY_CODES = {
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czech Republic": "cz",
  "Canada": "ca", "Bosnia and Herzegovina": "ba", "United States": "us", "Paraguay": "py",
  "Haiti": "ht", "Scotland": "gb-sct", "Australia": "au", "Turkey": "tr", "Brazil": "br",
  "Morocco": "ma", "Qatar": "qa", "Switzerland": "ch", "Ivory Coast": "ci", "Ecuador": "ec",
  "Germany": "de", "Curaçao": "cw", "Netherlands": "nl", "Japan": "jp", "Sweden": "se",
  "Tunisia": "tn", "Iran": "ir", "New Zealand": "nz", "Spain": "es", "Cape Verde": "cv",
  "Belgium": "be", "Egypt": "eg", "Saudi Arabia": "sa", "Uruguay": "uy", "France": "fr",
  "Senegal": "sn", "Iraq": "iq", "Norway": "no", "Argentina": "ar", "Algeria": "dz",
  "Austria": "at", "Jordan": "jo", "Portugal": "pt", "Democratic Republic of the Congo": "cd",
  "England": "gb-eng", "Croatia": "hr", "Uzbekistan": "uz", "Colombia": "co", "Ghana": "gh", "Panama": "pa"
};

// Komponen Card untuk satu pertandingan
const MatchCard = ({ match, roundIndex, searchQuery = "", showLiveOnly = false }) => {
  // API worldcup26.ir menggunakan waktu Amerika (EDT / UTC-4). 
  // Kita tambahkan "-04:00" agar Javascript tahu itu jam Amerika, lalu otomatis mengonversinya ke jam lokal pengguna (WIB).
  const dateObj = new Date(match.local_date.replace(/-/g, '/') + " -04:00");
  
  const dateString = isNaN(dateObj) ? match.local_date.split(' ')[0] : dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).toUpperCase();
  const timeString = isNaN(dateObj) ? match.local_date.split(' ')[1] + ' WIB' : dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':') + ' WIB';
  
  const isFinished = match.finished === "TRUE" || match.finished === true;
  const isNotStarted = match.time_elapsed === "notstarted";
  const isLive = !isFinished && !isNotStarted;
  
  let statusDisplay = isFinished ? "FT" : (isNotStarted ? timeString : match.time_elapsed);

  // Helper untuk membersihkan string pencetak gol dari API (misal: {"J. Quiñones 9'"} jadi J. Quiñones 9')
  const formatScorers = (scorersString) => {
    if (!scorersString || scorersString === "null") return null;
    return scorersString.replace(/[{}]/g, '').replace(/[“”"]/g, '').split(',').join(', ');
  };

  const homeScorers = formatScorers(match.home_scorers);
  const awayScorers = formatScorers(match.away_scorers);

  // Ambil inisial 3 huruf untuk desain (contoh: MEX, BRA, ARG)
  const getInitials = (name) => {
    if (!name) return "TBD";
    // Jika nama lebih dari 1 kata, ambil huruf depan 3 kata pertama, kalau 1 kata ambil 3 huruf pertama
    const words = name.split(' ');
    if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    if (words.length === 2) return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
    return name.substring(0, 3).toUpperCase();
  };

  // Pilih warna aksen berdasarkan index ronde untuk variasi "26"
  const accentColor = COLORS[roundIndex % COLORS.length];

  // Logika Pencarian & Filter (Highlight / Dim)
  const matchesSearch = searchQuery && (
    (match.home_team_name_en && match.home_team_name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (match.away_team_name_en && match.away_team_name_en.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const isDimmed = (searchQuery && !matchesSearch) || (showLiveOnly && !isLive);

  return (
    <Link to={`/world-cup/${match.id}`} className={`bg-white text-black rounded-2xl p-4 w-72 border-4 font-sans relative shrink-0 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden group block ${isDimmed ? 'opacity-30 grayscale saturate-0' : (searchQuery || showLiveOnly ? 'ring-4 ring-white shadow-2xl scale-[1.02] z-50' : 'shadow-xl')}`} style={{ borderColor: accentColor }}>
      {/* Ornamen Grafis "26" di background */}
      <div 
        className="absolute -right-8 -bottom-10 text-9xl font-black opacity-5 pointer-events-none transition-transform group-hover:scale-110"
        style={{ color: accentColor, letterSpacing: '-0.1em' }}
      >
        26
      </div>

      <div className="flex justify-between items-center text-xs font-black tracking-widest uppercase z-10">
        <span className="text-gray-900">{dateString} {isNotStarted && `, ${timeString}`}</span>
        <span className={`px-2 py-1 rounded text-white ${isLive ? 'bg-red-600 animate-pulse' : 'bg-black'}`}>
          {isLive ? 'LIVE' : statusDisplay}
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-2 z-10">
        {/* Team Home */}
        <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border-2 border-transparent hover:border-gray-200 transition-colors">
          <div className="flex items-center gap-3">
            {COUNTRY_CODES[match.home_team_name_en] ? (
              <div className="w-12 h-8 rounded border-2 border-gray-900 bg-white shrink-0 shadow-sm overflow-hidden">
                <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[match.home_team_name_en]}.png`} alt={match.home_team_name_en} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-8 rounded border-2 border-gray-900 bg-black text-white shrink-0 shadow-sm flex items-center justify-center font-black tracking-tighter text-xs">
                {getInitials(match.home_team_name_en)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-gray-900 uppercase truncate max-w-[100px]">{match.home_team_name_en || 'TBD'}</span>
              {homeScorers && <span className="text-[9px] text-gray-500 font-bold truncate max-w-[110px]" title={homeScorers}>⚽ {homeScorers}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 font-black text-2xl" style={{ color: accentColor }}>
            <span>{isNotStarted ? '-' : (match.home_score !== null && match.home_score !== "" ? match.home_score : '-')}</span>
            {(match.home_penalty_score && match.home_penalty_score !== "null") && <span className="text-gray-400 text-xs ml-1">({match.home_penalty_score})</span>}
          </div>
        </div>

        {/* Team Away */}
        <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border-2 border-transparent hover:border-gray-200 transition-colors">
          <div className="flex items-center gap-3">
            {COUNTRY_CODES[match.away_team_name_en] ? (
              <div className="w-12 h-8 rounded border-2 border-gray-900 bg-white shrink-0 shadow-sm overflow-hidden">
                <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[match.away_team_name_en]}.png`} alt={match.away_team_name_en} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-8 rounded border-2 border-gray-900 bg-black text-white shrink-0 shadow-sm flex items-center justify-center font-black tracking-tighter text-xs">
                {getInitials(match.away_team_name_en)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-gray-900 uppercase truncate max-w-[100px]">{match.away_team_name_en || 'TBD'}</span>
              {awayScorers && <span className="text-[9px] text-gray-500 font-bold truncate max-w-[110px]" title={awayScorers}>⚽ {awayScorers}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 font-black text-2xl" style={{ color: accentColor }}>
            <span>{isNotStarted ? '-' : (match.away_score !== null && match.away_score !== "" ? match.away_score : '-')}</span>
            {(match.away_penalty_score && match.away_penalty_score !== "null") && <span className="text-gray-400 text-xs ml-1">({match.away_penalty_score})</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function WorldCupBracket() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [showTopScorers, setShowTopScorers] = useState(false);
  const bracketRef = useRef(null);

  // Parse pencetak gol otomatis dari semua pertandingan untuk Leaderboard
  const topScorers = useMemo(() => {
    const counts = {};
    fixtures.forEach(match => {
      const process = (scorersStr) => {
        if (!scorersStr || scorersStr === "null") return;
        const cleaned = scorersStr.replace(/[{}]/g, '').replace(/[“”"]/g, '');
        cleaned.split(',').forEach(goal => {
          if (!goal.trim()) return;
          // Hapus angka, koma, kutip, tanda tambah, dan kode (P) / (OG) untuk mendapatkan nama murni
          const name = goal.replace(/[0-9+']|(\([a-zA-Z]+\))/g, '').trim();
          if (name) {
            counts[name] = (counts[name] || 0) + 1;
          }
        });
      };
      process(match.home_scorers);
      process(match.away_scorers);
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [fixtures]);

  const handleExport = () => {
    if (bracketRef.current === null) {
      return;
    }

    toPng(bracketRef.current, { cacheBust: true, style: { background: 'linear-gradient(to bottom right, #4D00FF, #FF004D, #00B3FF)' } })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'world-cup-26-bracket.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Oops, something went wrong!', err);
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'World Cup 2026 Bracket',
          text: 'Cek jadwal dan skor live Piala Dunia 2026!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert('Maaf, browser Anda tidak mendukung fitur Share bawaan.');
    }
  };

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        // MENGGUNAKAN OPEN SOURCE API, TIDAK PERLU API KEY
        const response = await fetch("https://worldcup26.ir/get/games");

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        setFixtures(data.games || []);
      } catch (err) {
        // Jangan timpa error jika data sudah ada, supaya UI tidak crash saat fetch gagal
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
    
    // Auto-refresh setiap 60 detik (60000 ms)
    const interval = setInterval(fetchFixtures, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-black font-black text-2xl p-8 uppercase tracking-widest">Loading FIFA 26...</div>;
  if (error) return <div className="text-red-600 font-black text-2xl p-8 uppercase">Error: {error}</div>;

  // Filter menggunakan field 'type' atau 'group' dari worldcup26.ir
  const round32 = fixtures.filter(f => f.type === "r32" || f.group === "R32");
  const round16 = fixtures.filter(f => f.type === "r16" || f.group === "R16");
  const quarterFinals = fixtures.filter(f => f.type === "qf" || f.group === "QF");
  const semiFinals = fixtures.filter(f => f.type === "sf" || f.group === "SF");
  const final = fixtures.filter(f => f.type === "final" || f.group === "FINAL" || f.group === "Final");

  return (
    <div className="relative" style={{ fontFamily: '"Noto Sans", sans-serif' }}>
      
      {/* Tombol Export dan Share di luar area yang diexport agar tidak ikut kefoto */}
      {/* Tombol Export dan Share di luar area yang diexport agar tidak ikut kefoto */}
      <div className="absolute top-4 right-4 md:right-8 z-50 flex flex-col md:flex-row gap-2 md:gap-4 items-end">
        
        {/* Input Pencarian Tim */}
        <input 
          type="text" 
          placeholder="Cari Tim..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 md:px-6 py-2 rounded-full border border-black/10 bg-white/90 backdrop-blur hover:bg-white text-black font-black text-xs md:text-sm outline-none focus:border-[#4D00FF] transition-all shadow-xl w-32 md:w-48 focus:w-48 md:focus:w-64 placeholder-gray-500 uppercase tracking-widest text-center"
        />

        {/* Top Skor Button */}
        <button 
          onClick={() => setShowTopScorers(true)}
          className="bg-yellow-400/90 backdrop-blur hover:bg-yellow-400 text-black font-black px-4 md:px-6 py-2 rounded-full shadow-xl border border-yellow-500/20 transition-transform hover:scale-105 active:scale-95 text-xs md:text-sm shrink-0"
        >
          🏆 TOP SKOR
        </button>

        {/* Live Filter Toggle */}
        <button 
          onClick={() => setShowLiveOnly(!showLiveOnly)}
          className={`${showLiveOnly ? 'bg-red-600 text-white animate-pulse border-red-500' : 'bg-white/90 text-black border-black/10'} backdrop-blur hover:bg-red-500 hover:text-white font-black px-4 md:px-6 py-2 rounded-full shadow-xl border transition-colors active:scale-95 text-xs md:text-sm shrink-0`}
        >
          🔴 LIVE
        </button>

        {!!navigator.share && (
          <button 
            onClick={handleShare}
            className="bg-white/90 backdrop-blur hover:bg-white text-black font-black px-4 md:px-6 py-2 rounded-full shadow-xl border border-black/10 transition-transform hover:scale-105 active:scale-95 text-xs md:text-sm shrink-0"
          >
            ↗ SHARE
          </button>
        )}
        <button 
          onClick={handleExport}
          className="bg-black/90 backdrop-blur hover:bg-black text-white font-black px-4 md:px-6 py-2 rounded-full shadow-xl border border-white/20 transition-transform hover:scale-105 active:scale-95 text-xs md:text-sm"
        >
          ⬇ EXPORT
        </button>
      </div>

      {/* Navigasi Cepat Khusus Mobile (Floating Dock Style) */}
      <div className="md:hidden fixed bottom-6 left-4 right-24 z-50 flex gap-3 overflow-x-auto bg-transparent p-2 hide-scrollbar">
        {[
          { id: '32', label: 'R32' },
          { id: '16', label: 'R16' },
          { id: 'QF', label: 'QF' },
          { id: 'SF', label: 'SF' },
          { id: 'FINAL', label: 'FINAL' }
        ].map(round => (
          <button
            key={round.id}
            onClick={() => {
              const el = document.getElementById(`round-${round.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }}
            className="text-white font-black text-xs px-5 py-3 rounded-full whitespace-nowrap bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-gradient-to-r hover:from-[#4D00FF] hover:to-[#FF004D] transition-all active:scale-95 shadow-lg shrink-0"
          >
            {round.label}
          </button>
        ))}
        {/* Spacer ajaib: Jika chat widget menutupi ujung kanan, user bisa scroll ekstra berkat div kosong ini */}
        <div className="w-16 shrink-0 pointer-events-none"></div>
      </div>



      {/* Area yang akan diexport */}
      <div 
        ref={bracketRef} 
        className="p-8 min-h-screen overflow-x-auto relative bg-gradient-to-br from-[#4D00FF] via-[#FF004D] to-[#00B3FF]"
      >
        {/* Dekorasi Background Ala FIFA 26 */}
        <div className="absolute top-10 right-10 text-right text-[20rem] font-black opacity-20 pointer-events-none leading-none tracking-tighter text-white mix-blend-overlay">
          WE<br/>ARE<br/>26
        </div>

        {/* Watermark dihapus dari sini, dipindah ke samping final */}

        <div className="flex gap-16 min-w-max items-center mt-20 z-10 relative">
        
        {/* Round of 32 (16 Matches) */}
        <div id="round-32" className="flex flex-col gap-4 relative z-10 scroll-mt-20">
          <h3 className="text-white text-2xl font-black tracking-tighter mb-6 text-center uppercase drop-shadow-md">Round of 32</h3>
          {round32.length === 0 && <p className="text-white/80 font-bold text-sm text-center w-72 mt-8 uppercase">No Matches Yet</p>}
          {round32.map(match => <MatchCard key={match.id || Math.random()} match={match} roundIndex={0} searchQuery={searchQuery} showLiveOnly={showLiveOnly} />)}
        </div>

        {/* Round of 16 (8 Matches) */}
        <div id="round-16" className="flex flex-col gap-8 relative z-10 scroll-mt-20">
          <h3 className="text-white text-2xl font-black tracking-tighter mb-6 text-center uppercase drop-shadow-md">Round of 16</h3>
          {round16.length === 0 && <p className="text-white/80 font-bold text-sm text-center w-72 mt-8 uppercase">No Matches Yet</p>}
          {round16.map(match => <MatchCard key={match.id || Math.random()} match={match} roundIndex={1} searchQuery={searchQuery} showLiveOnly={showLiveOnly} />)}
        </div>

        {/* Quarter-finals (4 Matches) */}
        <div id="round-QF" className="flex flex-col gap-16 relative z-10 scroll-mt-20">
          <h3 className="text-white text-2xl font-black tracking-tighter mb-6 text-center uppercase drop-shadow-md">Quarter-Finals</h3>
          {quarterFinals.length === 0 && <p className="text-white/80 font-bold text-sm text-center w-72 mt-8 uppercase">No Matches Yet</p>}
          {quarterFinals.map(match => <MatchCard key={match.id || Math.random()} match={match} roundIndex={2} searchQuery={searchQuery} showLiveOnly={showLiveOnly} />)}
        </div>

        {/* Semi-finals (2 Matches) */}
        <div id="round-SF" className="flex flex-col gap-32 relative z-10 scroll-mt-20">
          <h3 className="text-white text-2xl font-black tracking-tighter mb-6 text-center uppercase drop-shadow-md">Semi-Finals</h3>
          {semiFinals.length === 0 && <p className="text-white/80 font-bold text-sm text-center w-72 mt-8 uppercase">No Matches Yet</p>}
          {semiFinals.map(match => <MatchCard key={match.id || Math.random()} match={match} roundIndex={3} searchQuery={searchQuery} showLiveOnly={showLiveOnly} />)}
        </div>

        {/* Final (1 Match) */}
        <div id="round-FINAL" className="flex flex-col gap-4 relative z-10 scroll-mt-20">
          <h3 className="text-white text-4xl font-black tracking-tighter mb-6 text-center uppercase drop-shadow-md">FINAL</h3>
          {final.length === 0 && <p className="text-white/80 font-bold text-sm text-center w-72 mt-8 uppercase">No Matches Yet</p>}
          {final.map(match => <MatchCard key={match.id || Math.random()} match={match} roundIndex={1} searchQuery={searchQuery} showLiveOnly={showLiveOnly} />)}
        </div>

        {/* Watermark nineteen.dev di samping Final */}
        <div className="flex flex-col items-start justify-center ml-8 pointer-events-none">
          <div className="text-7xl font-black text-white/70 tracking-tighter leading-none drop-shadow-2xl">
            nineteen.dev
          </div>
          <div className="text-white/90 font-black text-sm tracking-widest uppercase mt-4 bg-black/30 px-6 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
            Updated: {new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }).replace('.', ':')} WIB
          </div>
        </div>

      </div>
    </div>
  </div>
);
}
