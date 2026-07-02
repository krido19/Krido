import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

// Konstanta ISO Country Code (dicopy dari Bracket untuk bendera)
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

const formatScorers = (scorersString) => {
  if (!scorersString || scorersString === "null") return [];
  const cleaned = scorersString.replace(/[{}]/g, '').replace(/[“”"]/g, '');
  return cleaned.split(',').map(s => s.trim()).filter(Boolean);
};

const getInitials = (name) => {
  if (!name) return "TBD";
  const words = name.split(' ');
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  if (words.length === 2) return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  return name.substring(0, 3).toUpperCase();
};

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchAndStadiums = async () => {
      try {
        const [gamesRes, stadiumsRes] = await Promise.all([
          fetch("https://worldcup26.ir/get/games"),
          fetch("https://worldcup26.ir/get/stadiums")
        ]);

        if (!gamesRes.ok) throw new Error(`Games API Error: ${gamesRes.status}`);
        
        const gamesData = await gamesRes.json();
        
        // Stadiums API kadang gagal (misal CORS atau server mati), jadi kita tampung tanpa membatalkan render laga
        if (stadiumsRes.ok) {
          const stadiumsData = await stadiumsRes.json();
          setStadiums(stadiumsData.stadiums || []);
        }
        
        const found = gamesData.games?.find(g => String(g.id) === String(id));
        if (found) {
          setMatch(found);
        } else {
          setError("Pertandingan tidak ditemukan.");
        }
      } catch (err) {
        if (!match) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchAndStadiums();
    const interval = setInterval(fetchMatchAndStadiums, 60000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-white text-black font-black text-2xl uppercase">
          Loading Match...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-primary flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center bg-white">
          <h2 className="text-red-600 font-black text-2xl uppercase mb-4">{error || "Data kosong"}</h2>
          <Link to="/world-cup" className="bg-black text-white px-6 py-2 rounded-full font-bold">Kembali ke Bagan</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse Waktu
  const dateObj = new Date(match.local_date.replace(/-/g, '/') + " -04:00");
  const dateString = isNaN(dateObj) ? match.local_date.split(' ')[0] : dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
  const timeString = isNaN(dateObj) ? match.local_date.split(' ')[1] + ' WIB' : dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':') + ' WIB';

  const isFinished = match.finished === "TRUE" || match.finished === true;
  const isNotStarted = match.time_elapsed === "notstarted";
  const isLive = !isFinished && !isNotStarted;
  let statusDisplay = isFinished ? "FULL TIME" : (isNotStarted ? "UPCOMING" : match.time_elapsed);

  const homeScorers = formatScorers(match.home_scorers);
  const awayScorers = formatScorers(match.away_scorers);

  // Parse Timeline Events
  const timelineEvents = [];
  const parseEvents = (scorersArr, team) => {
    scorersArr.forEach(scorer => {
      const match = scorer.match(/(.+)\s+(\d+)'/);
      if (match) {
        timelineEvents.push({ player: match[1].trim(), minute: parseInt(match[2]), team });
      } else {
        timelineEvents.push({ player: scorer, minute: 999, team }); // unknown minute
      }
    });
  };
  parseEvents(homeScorers, 'home');
  parseEvents(awayScorers, 'away');
  timelineEvents.sort((a, b) => a.minute - b.minute);

  // Parse Phase / Group
  let phaseText = "Match";
  if (match.type === "group") phaseText = `Group ${match.group} • Matchday ${match.matchday}`;
  else if (match.type === "r32") phaseText = "Round of 32";
  else if (match.type === "r16") phaseText = "Round of 16";
  else if (match.type === "qf") phaseText = "Quarter-Finals";
  else if (match.type === "sf") phaseText = "Semi-Finals";
  else if (match.type === "3rd") phaseText = "Third Place Play-off";
  else if (match.type === "final") phaseText = "FINAL";

  // Temukan detail stadion
  const currentStadium = stadiums.find(s => String(s.id) === String(match.stadium_id));

  return (
    <div className="min-h-screen bg-primary flex flex-col font-sans">
      <SEO title={`${match.home_team_name_en} vs ${match.away_team_name_en} | World Cup 2026`} />
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 bg-white relative overflow-hidden flex flex-col items-center justify-center px-4">
        
        {/* Dekorasi Background */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#4D00FF]/20 via-[#FF004D]/10 to-[#00B3FF]/20 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div className="absolute font-black text-[20rem] text-black/5 pointer-events-none whitespace-nowrap z-0 tracking-tighter">
          FIFA 26
        </div>

        <div className="z-10 w-full max-w-4xl flex flex-col items-center">
          
          <Link to="/world-cup" className="mb-8 text-black font-bold uppercase tracking-widest hover:underline hover:text-[#4D00FF] transition-colors self-start">
            ← Kembali ke Bagan
          </Link>

          {/* Info Waktu & Fase */}
          <div className="flex flex-col items-center mb-10">
            <span className="text-[#4D00FF] font-black tracking-widest uppercase mb-2 text-sm sm:text-base bg-blue-50 px-4 py-1 rounded-full border border-blue-200">
              {phaseText}
            </span>
            <span className={`px-4 py-1 rounded-full text-white font-black text-sm tracking-widest mb-4 shadow-lg ${isLive ? 'bg-red-600 animate-pulse' : 'bg-black'}`}>
              {isLive ? 'LIVE' : statusDisplay}
            </span>
            <h2 className="text-black font-bold text-xl uppercase">{dateString}</h2>
            <h3 className="text-gray-500 font-bold text-lg">{timeString}</h3>
          </div>

          {/* Kartu Pertandingan Raksasa */}
          <div className="w-full bg-white rounded-[2rem] sm:rounded-[3rem] p-4 py-8 sm:p-16 border-[4px] sm:border-[6px] border-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-row justify-between items-start sm:items-center relative overflow-hidden group">
            
            {/* Team Home */}
            <div className="flex flex-col items-center w-[35%] sm:w-1/3">
              <div className="w-16 h-12 sm:w-48 sm:h-32 rounded-lg sm:rounded-xl border-2 sm:border-4 border-gray-900 overflow-hidden shadow-xl bg-black mb-3 sm:mb-6">
                {COUNTRY_CODES[match.home_team_name_en] ? (
                  <img src={`https://flagcdn.com/w160/${COUNTRY_CODES[match.home_team_name_en]}.png`} alt={match.home_team_name_en} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-sm sm:text-3xl">{getInitials(match.home_team_name_en)}</div>
                )}
              </div>
              <h2 className="text-sm sm:text-4xl font-black text-black uppercase text-center tracking-tighter leading-none break-words">{match.home_team_name_en || 'TBD'}</h2>
              <div className="mt-2 sm:mt-4 flex flex-col items-center gap-1">
                {homeScorers.map((scorer, idx) => (
                  <span key={idx} className="text-[10px] sm:text-base font-bold text-gray-600 text-center leading-tight">⚽ {scorer}</span>
                ))}
              </div>
            </div>

            {/* Skor Tengah */}
            <div className="flex flex-col items-center mt-2 sm:mt-0 w-[30%] sm:w-1/3">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <span className="text-4xl sm:text-8xl font-black text-black">{isNotStarted ? '-' : match.home_score}</span>
                <span className="text-xl sm:text-5xl font-black text-gray-300">-</span>
                <span className="text-4xl sm:text-8xl font-black text-black">{isNotStarted ? '-' : match.away_score}</span>
              </div>
              {/* Penalti */}
              {((match.home_penalty_score && match.home_penalty_score !== "null") || (match.away_penalty_score && match.away_penalty_score !== "null")) && (
                <div className="mt-2 sm:mt-4 text-center">
                  <span className="bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-gray-500 uppercase tracking-widest text-[8px] sm:text-xs">Penalties</span>
                  <div className="text-sm sm:text-2xl font-black text-gray-400 mt-1 sm:mt-2">({match.home_penalty_score} - {match.away_penalty_score})</div>
                </div>
              )}
            </div>

            {/* Team Away */}
            <div className="flex flex-col items-center w-[35%] sm:w-1/3">
              <div className="w-16 h-12 sm:w-48 sm:h-32 rounded-lg sm:rounded-xl border-2 sm:border-4 border-gray-900 overflow-hidden shadow-xl bg-black mb-3 sm:mb-6">
                {COUNTRY_CODES[match.away_team_name_en] ? (
                  <img src={`https://flagcdn.com/w160/${COUNTRY_CODES[match.away_team_name_en]}.png`} alt={match.away_team_name_en} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-sm sm:text-3xl">{getInitials(match.away_team_name_en)}</div>
                )}
              </div>
              <h2 className="text-sm sm:text-4xl font-black text-black uppercase text-center tracking-tighter leading-none break-words">{match.away_team_name_en || 'TBD'}</h2>
              <div className="mt-2 sm:mt-4 flex flex-col items-center gap-1">
                {awayScorers.map((scorer, idx) => (
                  <span key={idx} className="text-[10px] sm:text-base font-bold text-gray-600 text-center leading-tight">⚽ {scorer}</span>
                ))}
              </div>
            </div>

          </div>

          {/* Match Timeline Section */}
          {(timelineEvents.length > 0) && (
            <div className="w-full max-w-2xl mt-12 flex flex-col">
              <h3 className="text-center font-black text-2xl uppercase tracking-tighter mb-8">Match Timeline</h3>
              <div className="relative border-l-4 border-gray-200 ml-[50%] flex flex-col gap-6 py-4">
                {timelineEvents.map((ev, idx) => (
                  <div key={idx} className={`relative flex items-center w-full ${ev.team === 'home' ? 'justify-end pr-[50%] left-[-50%]' : 'justify-start pl-[50%] left-0'}`}>
                    {/* Event Dot */}
                    <div className="absolute left-[50%] transform -translate-x-[52%] w-4 h-4 bg-[#FF004D] rounded-full border-4 border-white shadow-md z-10"></div>
                    
                    {/* Content Box */}
                    <div className={`bg-gray-50 px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${ev.team === 'home' ? 'mr-4 flex-row-reverse' : 'ml-4'}`}>
                      <div className="text-base sm:text-xl">⚽</div>
                      <div className={`flex flex-col ${ev.team === 'home' ? 'items-end' : 'items-start'}`}>
                        <span className="font-bold text-gray-900 text-xs sm:text-base">{ev.player}</span>
                        {ev.minute !== 999 && <span className="text-[10px] sm:text-xs font-black text-[#4D00FF]">{ev.minute}'</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Stadion Raksasa */}
          {currentStadium ? (
            <div className="w-full mt-12 relative rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-gray-900 bg-black">
              {/* Cover Foto Stadion Keren dari Unsplash */}
              <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop" alt="Stadium" className="w-full h-48 sm:h-64 object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex justify-between items-end">
                <div className="flex flex-col text-white w-2/3">
                  <span className="text-[#00B3FF] font-black uppercase tracking-widest text-[10px] sm:text-xs mb-1">Matchday {match.matchday} • Host Venue</span>
                  <h3 className="font-black text-2xl sm:text-4xl leading-tight uppercase tracking-tighter drop-shadow-lg">{currentStadium.name_en}</h3>
                  <p className="font-bold text-gray-300 text-xs sm:text-sm mt-1 sm:mt-2 tracking-wide">📍 {currentStadium.city_en}, {currentStadium.country_en}</p>
                </div>
                <div className="flex flex-col items-end text-white w-1/3">
                  <span className="text-gray-400 font-bold uppercase text-[10px] sm:text-xs">Capacity</span>
                  <span className="font-black text-xl sm:text-3xl text-white">{currentStadium.capacity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">Stadium ID</span>
                <span className="text-gray-900 font-black text-xl">{match.stadium_id || "TBD"}</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">Matchday</span>
                <span className="text-gray-900 font-black text-xl">{match.matchday || "-"}</span>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
