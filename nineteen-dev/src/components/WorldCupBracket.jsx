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

// Hardcoded API bracket topology for worldcup26.ir
const BRACKET_ORDER = {
  r32: ["74", "77", "73", "75", "83", "84", "81", "82", "76", "78", "79", "80", "86", "88", "85", "87"],
  r16: ["89", "90", "93", "94", "91", "92", "95", "96"],
  qf: ["97", "99", "98", "100"],
  sf: ["101", "102"],
  final: ["104"]
};

// Data Stadion Piala Dunia 2026
const STADIUM_INFO = {
  "1": { name: "Estadio Azteca", videoId: "vSHDZYm5HlE" },
  "2": { name: "Estadio Akron", videoId: "5BJ4cnNt3WM" },
  "3": { name: "Estadio BBVA", videoId: "NPM6Y295Zh8" },
  "4": { name: "AT&T Stadium", videoId: "UxyphPYPf6g" },
  "5": { name: "NRG Stadium", videoId: "xjoo2ZtwKUM" },
  "6": { name: "Arrowhead Stadium", videoId: "TnAwHXW5vD0" },
  "7": { name: "Mercedes-Benz Stadium", videoId: "anUhGgUaar4" },
  "8": { name: "Hard Rock Stadium", videoId: "-1yN8Xy1uPo" },
  "9": { name: "Gillette Stadium", videoId: "X07RSoCO2JA" },
  "10": { name: "Lincoln Financial Field", videoId: "pJX9y8eKTtg" },
  "11": { name: "MetLife Stadium", videoId: "ZaqAyf8SgaE" },
  "12": { name: "BMO Field", videoId: "evUTtT_B3JA" },
  "13": { name: "BC Place", videoId: "JAown-dJZLc" },
  "14": { name: "Lumen Field", videoId: "Zghz13xrYM8" },
  "15": { name: "Levi's Stadium", videoId: "7EpDugp0RGM" },
  "16": { name: "SoFi Stadium", videoId: "qlgH-jyB-qo" },
};

// Custom sort function based on predefined ID order
const sortMatches = (matches, orderArray) => {
  return [...matches].sort((a, b) => {
    const indexA = orderArray.indexOf(a.id);
    const indexB = orderArray.indexOf(b.id);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

// Helper untuk format tanggal dari API (EDT -04:00) ke format WIB
const formatMatchDateTime = (localDateStr) => {
  if (!localDateStr) return 'TBD';
  const dateObj = new Date(localDateStr.replace(/-/g, '/') + " -04:00");
  if (isNaN(dateObj)) return localDateStr + ' WIB';
  const dateString = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).toUpperCase();
  const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':') + ' WIB';
  return `${dateString}, ${timeString}`;
};

const buildTreeLevel = (rounds, currentRoundIdx, matchIdx, searchQuery, showLiveOnly, direction = 'left', onStadiumClick) => {
  const currentRoundMatches = rounds[currentRoundIdx] || [];
  // Fallback match jika API belum ada data untuk slot ini
  const match = currentRoundMatches[matchIdx] || { 
    id: `mock-${currentRoundIdx}-${matchIdx}`, 
    home_team_name_en: 'TBD', 
    away_team_name_en: 'TBD', 
    time_elapsed: 'notstarted', 
    local_date: 'TBD TBD',
    isMock: true
  };

  // Ronde pertama (R32) sebagai leaf nodes (tidak punya anak)
  if (currentRoundIdx === 0) {
    return <MatchCard key={match.id} match={match} roundIndex={0} searchQuery={searchQuery} showLiveOnly={showLiveOnly} onStadiumClick={onStadiumClick} />;
  }

  // Rekursif ke ronde sebelumnya (2 anak)
  const leftChildNode = buildTreeLevel(rounds, currentRoundIdx - 1, matchIdx * 2, searchQuery, showLiveOnly, direction, onStadiumClick);
  const rightChildNode = buildTreeLevel(rounds, currentRoundIdx - 1, matchIdx * 2 + 1, searchQuery, showLiveOnly, direction, onStadiumClick);

  const childrenContainer = (
    <div className="flex flex-col gap-4 justify-center relative">
      {direction === 'left' ? (
        <>
          {/* Garis Bracket ] (Anak di kiri, menuju kanan) */}
          <div className="absolute -right-8 top-[25%] bottom-[25%] w-8 border-y-2 border-r-2 border-white/40 rounded-r-xl pointer-events-none z-0" />
          <div className="absolute -right-16 top-1/2 w-8 border-b-2 border-white/40 pointer-events-none z-0" />
        </>
      ) : (
        <>
          {/* Garis Bracket [ (Anak di kanan, menuju kiri) */}
          <div className="absolute -left-8 top-[25%] bottom-[25%] w-8 border-y-2 border-l-2 border-white/40 rounded-l-xl pointer-events-none z-0" />
          <div className="absolute -left-16 top-1/2 w-8 border-b-2 border-white/40 pointer-events-none z-0" />
        </>
      )}
      <div className="relative z-10">{leftChildNode}</div>
      <div className="relative z-10">{rightChildNode}</div>
    </div>
  );

  return (
    <div key={match.id} className="flex items-center gap-16 relative">
      {direction === 'left' ? (
        <>
          {childrenContainer}
          <div className="relative z-10">
            <MatchCard match={match} roundIndex={currentRoundIdx} searchQuery={searchQuery} showLiveOnly={showLiveOnly} onStadiumClick={onStadiumClick} />
          </div>
        </>
      ) : (
        <>
          <div className="relative z-10">
            <MatchCard match={match} roundIndex={currentRoundIdx} searchQuery={searchQuery} showLiveOnly={showLiveOnly} onStadiumClick={onStadiumClick} />
          </div>
          {childrenContainer}
        </>
      )}
    </div>
  );
};

// Komponen Card untuk satu pertandingan
const MatchCard = ({ match, roundIndex, searchQuery = "", showLiveOnly = false, onStadiumClick }) => {
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
    <Link id={`match-${match.id}`} to={`/world-cup/${match.id}`} className={`bg-white/80 backdrop-blur-xl border-white/50 text-black rounded-2xl p-4 w-72 border-4 font-sans relative shrink-0 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden group block ${isDimmed ? 'opacity-30 grayscale saturate-0' : (searchQuery || showLiveOnly ? 'ring-4 ring-white shadow-2xl scale-[1.02] z-50 highlighted-match' : 'shadow-xl')}`} style={{ borderColor: accentColor }}>
      {/* Ornamen Grafis "26" di background */}
      <div 
        className="absolute -right-8 -bottom-10 text-9xl font-black opacity-5 pointer-events-none transition-transform group-hover:scale-110"
        style={{ color: accentColor, letterSpacing: '-0.1em' }}
      >
        26
      </div>

      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-black tracking-widest uppercase text-gray-900">
            {dateString} {isNotStarted && `, ${timeString}`}
          </div>
          {/* Tombol Stadion */}
          {STADIUM_INFO[match.stadium_id] && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onStadiumClick) onStadiumClick(STADIUM_INFO[match.stadium_id]);
              }}
              className="text-[9px] text-white bg-black/80 hover:bg-[#FF004D] px-2 py-0.5 rounded-full w-max flex items-center gap-1 transition-colors"
            >
              <span className="text-yellow-400">🏟️</span> {STADIUM_INFO[match.stadium_id].name}
            </button>
          )}
        </div>
        <span className={`px-2 py-1 rounded text-white text-xs font-black tracking-widest uppercase shrink-0 ${isLive ? 'bg-red-600 animate-pulse' : 'bg-black'}`}>
          {isLive ? 'LIVE' : statusDisplay}
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-2 z-10">
        {/* Team Home */}
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-2.5 rounded-xl border-2 border-white/30 hover:border-white/80 transition-colors shadow-sm">
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
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-2.5 rounded-xl border-2 border-white/30 hover:border-white/80 transition-colors shadow-sm">
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
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stadiumVideo, setStadiumVideo] = useState(null);
  const bracketRef = useRef(null);

  // Parse pencetak gol otomatis dari semua pertandingan untuk Leaderboard
  const topScorers = useMemo(() => {
    const counts = {};
    fixtures.forEach(match => {
      const process = (scorersStr, teamName) => {
        if (!scorersStr || scorersStr === "null") return;
        const cleaned = scorersStr.replace(/[{}]/g, '').replace(/[“”"]/g, '');
        cleaned.split(',').forEach(goal => {
          if (!goal.trim()) return;
          // Hapus angka, koma, kutip, tanda tambah, dan kode (P) / (OG) untuk mendapatkan nama murni
          const name = goal.replace(/[0-9+']|(\([a-zA-Z]+\))/g, '').trim();
          if (name) {
            if (!counts[name]) {
              counts[name] = { goals: 0, team: teamName, lastMatch: null };
            }
            counts[name].goals += 1;
            // Rekam pertandingan terakhir dimana ia mencetak gol
            if (!counts[name].lastMatch || (new Date(match.local_date) > new Date(counts[name].lastMatch.local_date))) {
              counts[name].lastMatch = match;
            }
          }
        });
      };
      process(match.home_scorers, match.home_team_name_en);
      process(match.away_scorers, match.away_team_name_en);
    });
    
    // Cari jadwal laga selanjutnya (jika timnya masih bermain)
    const scorersArray = Object.entries(counts).map(([name, data]) => {
      const nextMatch = fixtures.find(m => 
        (m.home_team_name_en === data.team || m.away_team_name_en === data.team) && 
        m.time_elapsed === 'notstarted'
      );
      return { name, ...data, nextMatch };
    });
    
    return scorersArray.sort((a, b) => b.goals - a.goals).slice(0, 10);
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

  useEffect(() => {
    if (searchQuery || showLiveOnly) {
      setTimeout(() => {
        document.querySelector('.highlighted-match')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
      }, 100);
    }
  }, [searchQuery, showLiveOnly]);

  // Auto-scroll ke Pertandingan Live atau Final saat pertama dimuat
  useEffect(() => {
    if (fixtures && fixtures.length > 0) {
      // Cari pertandingan live pertama
      const liveMatch = fixtures.find(m => {
        const isFinished = m.finished === "TRUE" || m.finished === true;
        const isNotStarted = m.time_elapsed === "notstarted";
        return !isFinished && !isNotStarted;
      });

      if (liveMatch) {
        const liveElement = document.getElementById(`match-${liveMatch.id}`);
        if (liveElement) {
          liveElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
        }
      } else {
        const finalElement = document.getElementById('round-FINAL');
        if (finalElement) {
          finalElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'start' });
        }
      }
    }
  }, [fixtures]);

  if (loading) return <div className="text-black font-black text-2xl p-8 uppercase tracking-widest">Loading FIFA 26...</div>;
  if (error) return <div className="text-red-600 font-black text-2xl p-8 uppercase">Error: {error}</div>;

  // Filter dan Sort menggunakan topology bracket 
  const round32 = sortMatches(fixtures.filter(f => f.type === "r32" || f.group === "R32"), BRACKET_ORDER.r32);
  const round16 = sortMatches(fixtures.filter(f => f.type === "r16" || f.group === "R16"), BRACKET_ORDER.r16);
  const quarterFinals = sortMatches(fixtures.filter(f => f.type === "qf" || f.group === "QF"), BRACKET_ORDER.qf);
  const semiFinals = sortMatches(fixtures.filter(f => f.type === "sf" || f.group === "SF"), BRACKET_ORDER.sf);
  const final = sortMatches(fixtures.filter(f => f.type === "final" || f.group === "FINAL" || f.group === "Final"), BRACKET_ORDER.final);

  const hasSearchResults = searchQuery ? fixtures.some(match => 
    (match.home_team_name_en && match.home_team_name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (match.away_team_name_en && match.away_team_name_en.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : true;

  return (
    <div className="relative" style={{ fontFamily: '"Noto Sans", sans-serif' }}>
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 15s ease infinite;
        }
      `}</style>
      
      {/* Toast Not Found */}
      {searchQuery && !hasSearchResults && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <div className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl border-4 border-black animate-bounce">
            Tim Tidak Ditemukan
          </div>
        </div>
      )}
      
      {/* Tombol Export dan Share di luar area yang diexport agar tidak ikut kefoto */}
      <div className="absolute top-4 right-4 md:right-8 z-50 flex flex-col md:flex-row gap-2 md:gap-4 items-end">
        
        {/* Input Pencarian Tim */}
        <input 
          type="search" 
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

      {/* Area yang akan diexport */}
      <div 
        ref={bracketRef} 
        className="p-8 min-h-screen overflow-x-auto snap-x snap-mandatory relative bg-gradient-to-br from-[#4D00FF] via-[#FF004D] to-[#00B3FF] animate-gradient-flow"
      >
        {/* Dekorasi Background Ala FIFA 26 */}
        <div className="absolute top-10 right-10 text-right text-[20rem] font-black opacity-20 pointer-events-none leading-none tracking-tighter text-white mix-blend-overlay">
          WE<br/>ARE<br/>26
        </div>

        <div className="relative min-w-max z-10 mt-20 pb-20">
          
          {/* Header Kolom (Absolute) agar sejajar dengan 9 node tree (Sisi Kiri, Final, Sisi Kanan) */}
          <div className="flex gap-16 absolute top-0 left-0 pointer-events-none z-20 w-full" style={{ paddingLeft: '0px' }}>
            {/* Kiri */}
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Round of 32</h3></div>
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Round of 16</h3></div>
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Quarter-Finals</h3></div>
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Semi-Finals</h3></div>
            
            {/* Tengah (Final) */}
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-4xl font-black tracking-tighter uppercase drop-shadow-md text-yellow-400">FINAL</h3></div>
            
            {/* Kanan */}
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Semi-Finals</h3></div>
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Quarter-Finals</h3></div>
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Round of 16</h3></div>
            <div className="w-72 shrink-0 text-center"><h3 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">Round of 32</h3></div>
          </div>

          {/* Render Full 2-Sided Bracket Tree */}
          <div className="pt-20 pb-16 flex items-center gap-16">
            
            {/* Sisi Kiri (SF Index 0) */}
            <div className="relative z-10">
              {buildTreeLevel([round32, round16, quarterFinals, semiFinals, final], 3, 0, searchQuery, showLiveOnly, 'left', setStadiumVideo)}
            </div>
            
            {/* Tengah (FINAL) */}
            <div id="round-FINAL" className="relative z-20 flex flex-col items-center gap-16 scroll-mt-20">
              
              <div className="flex flex-col items-center gap-6">
                {/* Piala dan Tulisan Final */}
                <div className="flex flex-col items-center pointer-events-none drop-shadow-2xl z-30">
                  <span className="text-[6rem] leading-none mb-2 filter drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">🏆</span>
                  <h2 className="text-yellow-400 font-black text-4xl tracking-[0.15em] uppercase drop-shadow-lg">World Cup</h2>
                  <h3 className="text-white font-black text-2xl tracking-[0.3em] uppercase mt-1 opacity-90">Final</h3>
                </div>

                <div className="relative">
                  {/* Garis Konektor ke Kiri dan Kanan */}
                  <div className="absolute -left-16 top-1/2 w-16 border-b-2 border-white/40 pointer-events-none z-0" />
                  <div className="absolute -right-16 top-1/2 w-16 border-b-2 border-white/40 pointer-events-none z-0" />
                  
                  <MatchCard 
                    match={final[0] || { id: 'mock-final', home_team_name_en: 'TBD', away_team_name_en: 'TBD', time_elapsed: 'notstarted', local_date: 'TBD TBD', isMock: true }} 
                    roundIndex={4} 
                    searchQuery={searchQuery} 
                    showLiveOnly={showLiveOnly} 
                    onStadiumClick={setStadiumVideo}
                  />
                </div>
              </div>

              {/* Watermark nineteen.dev di bawah Final */}
              <div className="flex flex-col items-center justify-center pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
                <div className="text-5xl font-black text-white/70 tracking-tighter leading-none drop-shadow-2xl">
                  nineteen.dev
                </div>
                <div className="text-white/90 font-black text-xs tracking-widest uppercase mt-4 bg-black/30 px-6 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                  Updated: {new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }).replace('.', ':')} WIB
                </div>
              </div>
            </div>

            {/* Sisi Kanan (SF Index 1) */}
            <div className="relative z-10">
              {buildTreeLevel([round32, round16, quarterFinals, semiFinals, final], 3, 1, searchQuery, showLiveOnly, 'right', setStadiumVideo)}
            </div>

          </div>

        </div>
      </div>

      {/* Modal Top Skor */}
      {showTopScorers && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowTopScorers(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white text-black w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 border-[#FF004D] animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FF004D] text-white p-6 text-center relative">
              <h2 className="text-3xl font-black tracking-tighter uppercase drop-shadow-md">Top Scorers</h2>
              <button 
                onClick={() => setShowTopScorers(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {topScorers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest">
                  Belum ada gol tercetak
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {topScorers.map((scorer, idx) => {
                    const isSelected = selectedPlayer === scorer.name;
                    return (
                      <li key={scorer.name} className="flex flex-col border-b border-gray-100 last:border-b-0">
                        <button 
                          onClick={() => setSelectedPlayer(isSelected ? null : scorer.name)}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors w-full text-left focus:outline-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-inner shrink-0 ${idx === 0 ? 'bg-yellow-400 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {idx + 1}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 uppercase text-sm tracking-wide">{scorer.name}</span>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{scorer.team}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-[#4D00FF]">{scorer.goals}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase">Gol</span>
                          </div>
                        </button>
                        
                        {isSelected && (
                          <div className="bg-gray-50 p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                            {scorer.nextMatch ? (
                              <button 
                                onClick={() => {
                                  setShowTopScorers(false);
                                  setSearchQuery(scorer.team);
                                  setTimeout(() => {
                                    document.getElementById(`match-${scorer.nextMatch.id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
                                  }, 100);
                                }}
                                className="w-full text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#00B3FF] hover:shadow-md transition-all group"
                              >
                                <div className="text-xs font-black text-[#00B3FF] mb-1 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                  <span className="animate-pulse">▶</span> Laga Selanjutnya
                                </div>
                                <div className="font-black text-gray-900 text-sm">{scorer.nextMatch.home_team_name_en} vs {scorer.nextMatch.away_team_name_en}</div>
                                <div className="text-xs font-bold text-gray-500 mt-1">{formatMatchDateTime(scorer.nextMatch.local_date)}</div>
                              </button>
                            ) : scorer.lastMatch ? (
                              <button 
                                onClick={() => {
                                  setShowTopScorers(false);
                                  setSearchQuery(scorer.team);
                                  setTimeout(() => {
                                    document.getElementById(`match-${scorer.lastMatch.id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
                                  }, 100);
                                }}
                                className="w-full text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#FF004D] hover:shadow-md transition-all group"
                              >
                                <div className="text-xs font-black text-[#FF004D] mb-1 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                  <span>⚽</span> Gol Terakhir Dicetak Pada
                                </div>
                                <div className="font-black text-gray-900 text-sm">{scorer.lastMatch.home_team_name_en} vs {scorer.lastMatch.away_team_name_en}</div>
                                <div className="text-xs font-bold text-gray-500 mt-1">{formatMatchDateTime(scorer.lastMatch.local_date)} (Skor: {scorer.lastMatch.home_score} - {scorer.lastMatch.away_score})</div>
                              </button>
                            ) : null}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Video Stadion */}
      {stadiumVideo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setStadiumVideo(null)}
          ></div>
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Header / Judul Stadion */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
              <h2 className="text-white font-black text-2xl uppercase tracking-widest drop-shadow-md">
                🏟️ {stadiumVideo.name}
              </h2>
              <button 
                onClick={() => setStadiumVideo(null)}
                className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-md"
              >
                ✕
              </button>
            </div>

            {/* Area Video */}
            <div className="w-full aspect-video bg-black/50 flex items-center justify-center">
              {stadiumVideo.videoId ? (
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${stadiumVideo.videoId}?autoplay=1&mute=1`} 
                  title={stadiumVideo.name} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-white/50 font-black text-xl tracking-widest uppercase animate-pulse text-center p-8">
                  <span className="text-4xl mb-4 block">🚧</span>
                  Video Tur Stadion<br/>Segera Hadir
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
