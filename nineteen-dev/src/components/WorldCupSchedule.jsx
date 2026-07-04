import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

const STADIUM_INFO = {
  "1": { name: "Estadio Azteca" },
  "2": { name: "Estadio Akron" },
  "3": { name: "Estadio BBVA" },
  "4": { name: "AT&T Stadium" },
  "5": { name: "NRG Stadium" },
  "6": { name: "Arrowhead Stadium" },
  "7": { name: "Mercedes-Benz Stadium" },
  "8": { name: "Hard Rock Stadium" },
  "9": { name: "Gillette Stadium" },
  "10": { name: "Lincoln Financial Field" },
  "11": { name: "MetLife Stadium" },
  "12": { name: "BMO Field" },
  "13": { name: "BC Place" },
  "14": { name: "Lumen Field" },
  "15": { name: "Levi's Stadium" },
  "16": { name: "SoFi Stadium" },
};

const getStadiumTimezone = (stadiumId) => {
  return {
    "1": "-06:00", "2": "-06:00", "3": "-06:00",
    "4": "-05:00", "5": "-05:00", "6": "-05:00",
    "13": "-07:00", "14": "-07:00", "15": "-07:00", "16": "-07:00"
  }[stadiumId] || "-04:00";
};

const formatMatchDateTime = (localDateStr, stadiumId) => {
  if (!localDateStr) return 'TBD';
  const tzOffset = getStadiumTimezone(stadiumId);
  const dateObj = new Date(localDateStr.replace(/-/g, '/') + " " + tzOffset);
  if (isNaN(dateObj)) return localDateStr + ' WIB';
  const dateString = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).toUpperCase();
  const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':') + ' WIB';
  return `${dateString}, ${timeString}`;
};

const getInitials = (name) => {
  if (!name) return "TBD";
  const words = name.split(' ');
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  if (words.length === 2) return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  return name.substring(0, 3).toUpperCase();
};

export default function WorldCupSchedule() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'previous'

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch("https://worldcup26.ir/get/games");
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setFixtures(data.games || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, []);

  if (loading) return <div className="text-center py-10 font-bold uppercase tracking-widest text-gray-500">Memuat jadwal...</div>;
  if (error) return <div className="text-center py-10 text-red-500 font-bold uppercase tracking-widest">Gagal memuat jadwal: {error}</div>;

  const previousMatches = fixtures
    .filter(m => m.finished === "TRUE" || m.finished === true)
    .sort((a, b) => {
      const dateA = new Date(a.local_date.replace(/-/g, '/') + " " + getStadiumTimezone(a.stadium_id));
      const dateB = new Date(b.local_date.replace(/-/g, '/') + " " + getStadiumTimezone(b.stadium_id));
      return dateB - dateA;
    });

  const upcomingMatches = fixtures
    .filter(m => {
      const isFinished = m.finished === "TRUE" || m.finished === true;
      return !isFinished;
    })
    .sort((a, b) => {
      const dateA = new Date(a.local_date.replace(/-/g, '/') + " " + getStadiumTimezone(a.stadium_id));
      const dateB = new Date(b.local_date.replace(/-/g, '/') + " " + getStadiumTimezone(b.stadium_id));
      return dateA - dateB;
    });

  const displayedMatches = activeTab === 'upcoming' ? upcomingMatches : previousMatches;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10 border border-gray-100">
        <h2 className="text-4xl font-black text-gray-900 mb-8 text-center tracking-tight uppercase" style={{ letterSpacing: '-0.05em' }}>Jadwal Pertandingan</h2>
        
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('previous')}
            className={`px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
              activeTab === 'previous' 
                ? 'bg-[#FF004D] text-white shadow-xl shadow-[#FF004D]/30 translate-y-[-2px]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-[#00FF87] text-black shadow-xl shadow-[#00FF87]/30 translate-y-[-2px]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            Akan Datang
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedMatches.length > 0 ? (
            displayedMatches.map(match => {
              const isFinished = match.finished === "TRUE" || match.finished === true;
              const isNotStarted = match.time_elapsed === "notstarted";
              const isLive = !isFinished && !isNotStarted;
              
              let statusText = 'UPCOMING';
              let statusBg = 'bg-[#00B3FF] text-white';
              
              if (isFinished) {
                statusText = 'FT';
                statusBg = 'bg-black text-white';
              } else if (isLive) {
                statusText = 'LIVE';
                statusBg = 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/50';
              }

              return (
                <Link key={match.id} to={`/world-cup/${match.id}`} className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100 hover:border-[#4D00FF] transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden block">
                  <div className="absolute -right-6 -bottom-6 text-7xl font-black opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110" style={{ color: '#4D00FF' }}>26</div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-gray-400 tracking-widest">{formatMatchDateTime(match.local_date, match.stadium_id)}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md tracking-wider ${statusBg}`}>
                        {statusText}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-[#4D00FF]/20 transition-colors">
                        <div className="flex items-center gap-3">
                          {COUNTRY_CODES[match.home_team_name_en] ? (
                            <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[match.home_team_name_en]}.png`} alt={match.home_team_name_en} className="w-8 h-5 object-cover rounded shadow-sm" />
                          ) : (
                            <div className="w-8 h-5 bg-black text-white text-[9px] flex items-center justify-center font-black rounded shadow-sm">
                              {getInitials(match.home_team_name_en)}
                            </div>
                          )}
                          <span className="font-black text-sm text-gray-900 uppercase truncate max-w-[100px]">{match.home_team_name_en || 'TBD'}</span>
                        </div>
                        <span className="font-black text-2xl text-gray-900">{isNotStarted ? '-' : (match.home_score ?? '-')}</span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-[#4D00FF]/20 transition-colors">
                        <div className="flex items-center gap-3">
                          {COUNTRY_CODES[match.away_team_name_en] ? (
                            <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[match.away_team_name_en]}.png`} alt={match.away_team_name_en} className="w-8 h-5 object-cover rounded shadow-sm" />
                          ) : (
                            <div className="w-8 h-5 bg-black text-white text-[9px] flex items-center justify-center font-black rounded shadow-sm">
                              {getInitials(match.away_team_name_en)}
                            </div>
                          )}
                          <span className="font-black text-sm text-gray-900 uppercase truncate max-w-[100px]">{match.away_team_name_en || 'TBD'}</span>
                        </div>
                        <span className="font-black text-2xl text-gray-900">{isNotStarted ? '-' : (match.away_score ?? '-')}</span>
                      </div>
                    </div>
                    
                    {STADIUM_INFO[match.stadium_id] && (
                      <div className="mt-4 pt-3 border-t border-gray-200 text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                        <span>🏟️</span> {STADIUM_INFO[match.stadium_id].name}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-sm">
              Tidak ada pertandingan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
