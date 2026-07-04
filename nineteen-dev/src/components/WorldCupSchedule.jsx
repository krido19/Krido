import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useWorldCupFixtures } from '../hooks/useWorldCupFixtures';

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
  const { fixtures, loading, error } = useWorldCupFixtures();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'previous'
  const [searchQuery, setSearchQuery] = useState('');

  const previousMatches = fixtures
    .filter(m => m.finished === "TRUE" || m.finished === true)
    .filter(m => 
      !searchQuery || 
      (m.home_team_name_en && m.home_team_name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.away_team_name_en && m.away_team_name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    )
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
    .filter(m => 
      !searchQuery || 
      (m.home_team_name_en && m.home_team_name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.away_team_name_en && m.away_team_name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const dateA = new Date(a.local_date.replace(/-/g, '/') + " " + getStadiumTimezone(a.stadium_id));
      const dateB = new Date(b.local_date.replace(/-/g, '/') + " " + getStadiumTimezone(b.stadium_id));
      return dateA - dateB;
    });

  const displayedMatches = activeTab === 'upcoming' ? upcomingMatches : previousMatches;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-8 text-center tracking-tight uppercase transition-colors" style={{ letterSpacing: '-0.05em' }}>Jadwal Pertandingan</h2>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('previous')}
              className={`px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'previous' 
                  ? 'bg-[#FF004D] text-white shadow-xl shadow-[#FF004D]/30 translate-y-[-2px]' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'upcoming' 
                  ? 'bg-[#00FF87] text-black shadow-xl shadow-[#00FF87]/30 translate-y-[-2px]' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Akan Datang
            </button>
          </div>
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Cari negara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-full text-sm font-bold focus:outline-none focus:border-[#4D00FF] dark:text-white transition-colors"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {error && <div className="text-center py-10 text-red-500 font-bold uppercase tracking-widest">Gagal memuat jadwal: {error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 animate-pulse h-[210px]"></div>
            ))
          ) : displayedMatches.length > 0 ? (
            displayedMatches.map(match => {
              const isFinished = match.finished === "TRUE" || match.finished === true;
              const isNotStarted = match.time_elapsed === "notstarted";
              const isLive = !isFinished && !isNotStarted;
              
              let statusText = 'UPCOMING';
              let statusBg = 'bg-[#00B3FF] text-white';
              
              if (isFinished) {
                statusText = 'FT';
                statusBg = 'bg-black dark:bg-gray-900 text-white';
              } else if (isLive) {
                statusText = 'LIVE';
                statusBg = 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/50';
              }

              return (
                <Link key={match.id} to={`/world-cup/${match.id}`} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 hover:border-[#4D00FF] transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden block">
                  <div className="absolute -right-6 -bottom-6 text-7xl font-black opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110" style={{ color: '#4D00FF' }}>26</div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-gray-400 tracking-widest">{formatMatchDateTime(match.local_date, match.stadium_id)}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md tracking-wider ${statusBg}`}>
                        {statusText}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 group-hover:border-[#4D00FF]/20 transition-colors">
                        <div className="flex items-center gap-3">
                          {COUNTRY_CODES[match.home_team_name_en] ? (
                            <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[match.home_team_name_en]}.png`} alt={match.home_team_name_en} className="w-8 h-5 object-cover rounded shadow-sm" />
                          ) : (
                            <div className="w-8 h-5 bg-black text-white text-[9px] flex items-center justify-center font-black rounded shadow-sm">
                              {getInitials(match.home_team_name_en)}
                            </div>
                          )}
                          <span className="font-black text-sm text-gray-900 dark:text-white uppercase truncate max-w-[100px]">{match.home_team_name_en || 'TBD'}</span>
                        </div>
                        <span className="font-black text-2xl text-gray-900 dark:text-white">{isNotStarted ? '-' : (match.home_score ?? '-')}</span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 group-hover:border-[#4D00FF]/20 transition-colors">
                        <div className="flex items-center gap-3">
                          {COUNTRY_CODES[match.away_team_name_en] ? (
                            <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[match.away_team_name_en]}.png`} alt={match.away_team_name_en} className="w-8 h-5 object-cover rounded shadow-sm" />
                          ) : (
                            <div className="w-8 h-5 bg-black text-white text-[9px] flex items-center justify-center font-black rounded shadow-sm">
                              {getInitials(match.away_team_name_en)}
                            </div>
                          )}
                          <span className="font-black text-sm text-gray-900 dark:text-white uppercase truncate max-w-[100px]">{match.away_team_name_en || 'TBD'}</span>
                        </div>
                        <span className="font-black text-2xl text-gray-900 dark:text-white">{isNotStarted ? '-' : (match.away_score ?? '-')}</span>
                      </div>
                    </div>
                    
                    {STADIUM_INFO[match.stadium_id] && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
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
