import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Trophy, Calendar, ArrowLeft, Target, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { LEAGUES } from '../../lib/footballApi';
import { useLeagueFixtures, useLeagueStandings, useLeagueScorers } from '../../hooks/useLeague';
import { findCachedEventsByTeams } from '../../lib/eventsCache';

const STATUS_MAP = {
  SCHEDULED:  { label: 'UPCOMING', cls: 'bg-blue-500 text-white' },
  TIMED:      { label: 'UPCOMING', cls: 'bg-blue-500 text-white' },
  IN_PLAY:    { label: 'LIVE',     cls: 'bg-red-600 text-white animate-pulse' },
  PAUSED:     { label: 'HT',      cls: 'bg-yellow-500 text-black' },
  FINISHED:   { label: 'FT',      cls: 'bg-gray-800 text-white' },
  POSTPONED:  { label: 'PST',     cls: 'bg-orange-500 text-white' },
  NS:  { label: 'UPCOMING', cls: 'bg-blue-500 text-white' },
  '1H':{ label: 'LIVE',     cls: 'bg-red-600 text-white animate-pulse' },
  HT:  { label: 'HT',       cls: 'bg-yellow-500 text-black' },
  '2H':{ label: 'LIVE',     cls: 'bg-red-600 text-white animate-pulse' },
  FT:  { label: 'FT',       cls: 'bg-gray-800 text-white' },
  PST: { label: 'PST',      cls: 'bg-orange-500 text-white' },
};

const isFinished = s => s === 'FINISHED' || s === 'FT';
const isLive     = s => ['IN_PLAY', '1H', 'HT', '2H'].includes(s);

function formatDate(utcDate) {
  if (!utcDate) return 'TBD';
  return new Date(utcDate).toLocaleString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).toUpperCase() + ' WIB';
}

// ── Countdown Timer ───────────────────────────────────────────────────────────
function NextMatchCountdown({ fixtures }) {
  const [timeLeft, setTimeLeft] = useState(null);

  const next = fixtures
    .filter(m => !isFinished(m.status) && !isLive(m.status) && m.utcDate)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0];

  useEffect(() => {
    if (!next) return;
    const tick = () => {
      const diff = new Date(next.utcDate) - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s, match: next });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [next]);

  if (!timeLeft) return null;
  const m = timeLeft.match;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-indigo-900 dark:bg-[#100b2a] text-white shadow-2xl shadow-indigo-900/50 mb-10 border border-indigo-500/20">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-indigo-600/40 mix-blend-overlay"></div>
      <div className="absolute -right-32 -top-32 w-96 h-96 bg-purple-600/50 rounded-full blur-[100px]"></div>
      <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-blue-600/50 rounded-full blur-[100px]"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center p-8 md:p-12 gap-10">
        
        {/* Left: Info & Countdown */}
        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></span>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-200">Pertandingan Berikutnya</p>
          </div>
          <h2 className="text-2xl md:text-4xl font-black mb-8 leading-tight">
            {m.homeTeam} <span className="text-white/40 font-normal">vs</span> {m.awayTeam}
          </h2>
          
          {/* Countdown Boxes */}
          <div className="flex justify-center md:justify-start gap-3 mb-8">
            {[['Hari', timeLeft.d], ['Jam', timeLeft.h], ['Menit', timeLeft.m], ['Detik', timeLeft.s]].map(([label, val]) => (
              <div key={label} className="flex flex-col items-center justify-center w-16 h-20 md:w-20 md:h-24 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-inner">
                <span className="text-2xl md:text-4xl font-black tabular-nums">{String(val).padStart(2, '0')}</span>
                <span className="text-[9px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-sm font-bold text-white/70">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-300" /> {formatDate(m.utcDate)}
            </div>
            {m.venue && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-300" /> {m.venue}
              </div>
            )}
          </div>
        </div>

        {/* Right: Big Logos */}
        <div className="flex-1 w-full flex items-center justify-center gap-4 md:gap-8 relative">
          <div className="text-center w-28 md:w-40 z-10">
            <div className="w-28 h-28 md:w-40 md:h-40 bg-white/5 backdrop-blur-sm rounded-full p-6 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center mb-4 mx-auto relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {m.homeCrest 
                ? <img src={m.homeCrest} alt={m.homeTeam} className="w-full h-full object-contain filter drop-shadow-2xl" />
                : <span className="text-3xl font-black text-white">{m.homeTeam?.slice(0,3).toUpperCase()}</span>}
            </div>
            <p className="font-black text-sm md:text-base truncate drop-shadow-md">{m.homeTeam}</p>
          </div>
          
          <div className="text-2xl md:text-3xl font-black text-white/30 italic z-10 shrink-0">VS</div>
          
          <div className="text-center w-28 md:w-40 z-10">
            <div className="w-28 h-28 md:w-40 md:h-40 bg-white/5 backdrop-blur-sm rounded-full p-6 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center mb-4 mx-auto relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {m.awayCrest 
                ? <img src={m.awayCrest} alt={m.awayTeam} className="w-full h-full object-contain filter drop-shadow-2xl" />
                : <span className="text-3xl font-black text-white">{m.awayTeam?.slice(0,3).toUpperCase()}</span>}
            </div>
            <p className="font-black text-sm md:text-base truncate drop-shadow-md">{m.awayTeam}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Form Badge ────────────────────────────────────────────────────────────────
function FormBadge({ form }) {
  if (!form) return null;
  return (
    <div className="flex gap-0.5">
      {form.split('').map((r, i) => (
        <span key={i} className={`w-4 h-4 rounded-sm text-[8px] font-black flex items-center justify-center ${
          r === 'W' ? 'bg-green-500 text-white' :
          r === 'D' ? 'bg-yellow-400 text-black' :
          'bg-red-500 text-white'
        }`}>{r}</span>
      ))}
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, onClick }) {
  const st   = STATUS_MAP[match.status] ?? { label: match.status, cls: 'bg-gray-500 text-white' };
  const done = isFinished(match.status);
  const live = isLive(match.status);

  // Styling override for premium dark mode
  const badgeCls = st.label === 'UPCOMING' 
    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
    : st.label === 'FT'
      ? 'bg-gray-800 text-gray-300 border border-gray-600'
      : live ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      : st.cls;

  return (
    <div
      className="bg-white dark:bg-[#131527] rounded-3xl p-5 border border-gray-200 dark:border-[#2a2d4a] hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1 group relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      {/* Header: Date & Status */}
      <div className="flex justify-between items-center mb-5 relative z-10">
        <span className="text-[10px] md:text-xs font-black text-gray-500 dark:text-gray-400 tracking-widest">
          {formatDate(match.utcDate)}
        </span>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider ${badgeCls}`}>
          {live && match.minute ? `${match.minute}'` : st.label}
        </span>
      </div>

      {/* Teams */}
      <div className="space-y-4 relative z-10">
        {[
          { team: match.homeTeam, crest: match.homeCrest, score: match.homeScore },
          { team: match.awayTeam, crest: match.awayCrest, score: match.awayScore },
        ].map(({ team, crest, score }, i) => (
          <div key={i} className="flex justify-between items-center group-hover:transform group-hover:translate-x-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                {crest
                  ? <img src={crest} alt={team} className="w-full h-full object-contain" />
                  : <div className="text-[10px] font-black text-gray-400">{team?.slice(0,3).toUpperCase()}</div>
                }
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[140px] drop-shadow-sm">{team || 'TBD'}</span>
            </div>
            <span className={`font-black text-xl w-6 text-center shrink-0 ${live ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-gray-900 dark:text-white'}`}>
              {done || live ? (score ?? '-') : '-'}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: Location */}
      <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#2a2d4a] flex items-center gap-1.5 relative z-10 text-gray-500 dark:text-gray-400">
        <Target className="w-3.5 h-3.5 opacity-70" />
        <span className="text-[10px] md:text-xs font-bold truncate">
          {match.venue || 'TBA'}
        </span>
      </div>
    </div>
  );
}

// ── Goal Modal ────────────────────────────────────────────────────────────────
function GoalModal({ match, onClose }) {
  const [events, setEvents]   = useState(undefined); // undefined=loading, null=not found
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    import('../../lib/eventsCache').then(({ fetchMatchEvents }) =>
      fetchMatchEvents(match.homeTeam, match.awayTeam)
    ).then(data => {
      if (!cancelled) { setEvents(data); setLoading(false); }
    }).catch(() => {
      if (!cancelled) { setEvents(null); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [match.homeTeam, match.awayTeam]);

  // Sofascore: type='goal', detail='regular'|'penalty'|'ownGoal'
  // team='home'|'away' (bukan nama tim)
  const goals = (events ?? []).filter(e => e.type === 'goal');
  const cards = (events ?? []).filter(e => e.type === 'card');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#0a0c1a] rounded-[2rem] shadow-2xl shadow-indigo-900/20 w-full max-w-[420px] p-6 md:p-8 border border-gray-100 dark:border-indigo-500/20 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10">
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Match Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 mb-6">
            <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest">{formatDate(match.utcDate)}</p>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="text-center w-24">
              <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-white/5 rounded-full p-3 mb-2 shadow-sm border border-transparent dark:border-white/10">
                {match.homeCrest ? <img src={match.homeCrest} alt={match.homeTeam} className="w-full h-full object-contain" /> : <div className="text-xl font-black text-gray-400">{match.homeTeam?.slice(0,3).toUpperCase()}</div>}
              </div>
              <p className="text-xs font-black text-gray-800 dark:text-white truncate">{match.homeTeam}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                {match.homeScore ?? '-'} <span className="text-gray-300 dark:text-gray-700 mx-1">:</span> {match.awayScore ?? '-'}
              </div>
            </div>
            <div className="text-center w-24">
              <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-white/5 rounded-full p-3 mb-2 shadow-sm border border-transparent dark:border-white/10">
                {match.awayCrest ? <img src={match.awayCrest} alt={match.awayTeam} className="w-full h-full object-contain" /> : <div className="text-xl font-black text-gray-400">{match.awayTeam?.slice(0,3).toUpperCase()}</div>}
              </div>
              <p className="text-xs font-black text-gray-800 dark:text-white truncate">{match.awayTeam}</p>
            </div>
          </div>

          <div className="mt-6">
            <span className="inline-block px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] bg-indigo-100 text-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600/30 dark:to-purple-600/30 dark:text-purple-300 border border-indigo-200 dark:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              {STATUS_MAP[match.status]?.label === 'FT' ? 'FULL TIME' : STATUS_MAP[match.status]?.label ?? match.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 border-t border-gray-100 dark:border-white/10 pt-6">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : events === null ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3 opacity-50">📭</p>
              <p className="font-bold text-gray-500 dark:text-gray-400 text-sm">Data gol belum tersedia</p>
            </div>
          ) : goals.length === 0 ? (
            <p className="text-center text-gray-400 font-bold text-sm py-4">Belum ada gol tercatat.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-indigo-500 dark:text-purple-400" />
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pencetak Gol</p>
              </div>
              {goals.map((g, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-[#131527] border border-gray-200 dark:border-[#2a2d4a]">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-indigo-900/40 border border-gray-100 dark:border-indigo-500/30 flex flex-col items-center justify-center shrink-0 shadow-sm text-indigo-600 dark:text-indigo-400">
                    <span className="text-[10px] font-black leading-none">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-sm text-gray-900 dark:text-white truncate">{g.player}</p>
                      {g.detail === 'penalty' && <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded">PEN</span>}
                      {g.detail === 'ownGoal' && <span className="text-[9px] font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">OG</span>}
                    </div>
                    {g.assist && <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold truncate">Assist: {g.assist}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-white/5 text-xs font-black text-gray-700 dark:text-indigo-300">
                      {g.minute}{g.extra ? `+${g.extra}` : "'"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && cards.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-sm" />
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Kartu</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {cards.map((c, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                    c.detail === 'yellow' 
                      ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-500' 
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-500'
                  }`}>
                    <div className={`w-2 h-3 rounded-[2px] ${c.detail === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                    <span className="text-[11px] font-bold">{c.player}</span>
                    <span className="text-[11px] font-black ml-1">{c.minute}'</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Standings Table ───────────────────────────────────────────────────────────
function StandingsTable({ data }) {
  const zoneClass = (i) => {
    if (i < 4)             return 'border-l-2 border-l-indigo-500';
    if (i < 6)             return 'border-l-2 border-l-amber-400';
    if (i >= data.length - 3) return 'border-l-2 border-l-red-500';
    return '';
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
            <th className="text-left pb-3 pl-2 w-6">#</th>
            <th className="text-left pb-3">Klub</th>
            <th className="pb-3 text-center">M</th>
            <th className="pb-3 text-center">M</th>
            <th className="pb-3 text-center">S</th>
            <th className="pb-3 text-center">K</th>
            <th className="pb-3 text-center">SG</th>
            <th className="pb-3 text-center font-black text-gray-700 dark:text-gray-200">Poin</th>
            <th className="pb-3 text-center hidden sm:table-cell">Form</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.team} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${zoneClass(i)}`}>
              <td className="py-3 pl-2 font-black text-gray-500">{row.position}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  {row.crest && <img src={row.crest} alt={row.team} className="w-5 h-5 object-contain" />}
                  <span className="font-bold text-gray-900 dark:text-white truncate max-w-[130px]">{row.team}</span>
                </div>
              </td>
              <td className="py-3 text-center text-gray-600 dark:text-gray-400">{row.played}</td>
              <td className="py-3 text-center text-gray-600 dark:text-gray-400">{row.won}</td>
              <td className="py-3 text-center text-gray-600 dark:text-gray-400">{row.draw}</td>
              <td className="py-3 text-center text-gray-600 dark:text-gray-400">{row.lost}</td>
              <td className="py-3 text-center text-gray-600 dark:text-gray-400">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              <td className="py-3 text-center font-black text-gray-900 dark:text-white">{row.points}</td>
              <td className="py-3 text-center hidden sm:table-cell"><FormBadge form={row.form} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-4 mt-4 text-[11px] font-bold text-gray-400">
        <span><span className="inline-block w-3 h-3 bg-indigo-500 rounded-sm mr-1" />Liga Champions</span>
        <span><span className="inline-block w-3 h-3 bg-amber-400 rounded-sm mr-1" />Liga Europa</span>
        <span><span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1" />Degradasi</span>
      </div>
    </div>
  );
}

// ── Top Scorers ───────────────────────────────────────────────────────────────
function TopScorers({ data, loading, error }) {
  if (error)   return <div className="text-red-500 font-bold text-center py-6">{error.message}</div>;
  if (loading) return <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"/>)}</div>;
  if (!data?.length) return <div className="text-center py-10 text-gray-400 font-bold text-sm uppercase tracking-widest">Data belum tersedia.</div>;

  return (
    <div className="space-y-3">
      {data.map((s) => (
        <div key={s.rank} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-400 transition-all">
          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm shrink-0 ${
            s.rank === 1 ? 'bg-yellow-400 text-black' :
            s.rank === 2 ? 'bg-gray-300 text-black' :
            s.rank === 3 ? 'bg-orange-400 text-white' :
            'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}>{s.rank}</span>

          <img src={s.crest} alt={s.team} className="w-8 h-8 object-contain shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 dark:text-white text-sm truncate">{s.name}</p>
            <p className="text-[11px] text-gray-400 font-bold truncate">{s.team}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{s.goals}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gol</p>
            </div>
            {s.assists > 0 && (
              <div className="text-center hidden sm:block">
                <p className="text-sm font-black text-gray-500">{s.assists}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assist</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Matchday Filter ───────────────────────────────────────────────────────────
function MatchdayNav({ matchdays, active, onChange }) {
  if (matchdays.length <= 1) return null;
  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => onChange(Math.max(matchdays[0], active - 1))}
        disabled={active <= matchdays[0]}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 disabled:opacity-30 hover:bg-indigo-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="font-black text-sm text-gray-700 dark:text-gray-200 min-w-[80px] text-center uppercase tracking-widest">
        Pekan {active}
      </span>
      <button
        onClick={() => onChange(Math.min(matchdays[matchdays.length - 1], active + 1))}
        disabled={active >= matchdays[matchdays.length - 1]}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 disabled:opacity-30 hover:bg-indigo-100 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <select
        value={active}
        onChange={e => onChange(Number(e.target.value))}
        className="ml-2 text-sm font-bold bg-gray-100 dark:bg-gray-700 dark:text-white border-0 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {matchdays.map(md => <option key={md} value={md}>Pekan {md}</option>)}
      </select>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function League() {
  const { code = 'PL' } = useParams();
  const leagueCode = code.toUpperCase() in LEAGUES ? code.toUpperCase() : 'PL';
  const league = LEAGUES[leagueCode];

  const [tab, setTab]               = useState('fixtures');
  const [fixtureTab, setFixtureTab] = useState('upcoming');
  const [search, setSearch]         = useState('');
  const [activeMatchday, setActiveMatchday] = useState(null);
  const [selectedMatch, setSelectedMatch]   = useState(null);

  const { data: fixtures = [], isLoading: loadFix, error: errFix } = useLeagueFixtures(leagueCode);
  const { data: standings = [], isLoading: loadStd, error: errStd } = useLeagueStandings(leagueCode);
  const { data: scorers = [],  isLoading: loadScr, error: errScr } = useLeagueScorers(leagueCode);

  // Derive matchday list from fixtures
  const matchdays = [...new Set(
    fixtures
      .map(m => typeof m.matchday === 'number' ? m.matchday : parseInt(m.matchday?.replace(/\D/g,'')) || null)
      .filter(Boolean)
  )].sort((a,b) => a - b);

  // Auto-select current matchday on first load
  useEffect(() => {
    if (matchdays.length && activeMatchday === null) {
      const liveOrUpcoming = fixtures.find(m => !isFinished(m.status));
      const day = liveOrUpcoming
        ? (typeof liveOrUpcoming.matchday === 'number' ? liveOrUpcoming.matchday : parseInt(liveOrUpcoming.matchday?.replace(/\D/g,'')) || matchdays[0])
        : matchdays[matchdays.length - 1];
      setActiveMatchday(day);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchdays.length]);

  const getMatchday = (m) =>
    typeof m.matchday === 'number' ? m.matchday : parseInt(m.matchday?.replace(/\D/g,'')) || null;

  const filtered = fixtures
    .filter(m => {
      const done = isFinished(m.status);
      if (fixtureTab === 'previous') return done;
      return !done;
    })
    .filter(m => {
      if (fixtureTab === 'upcoming' && activeMatchday) return getMatchday(m) === activeMatchday;
      return true;
    })
    .filter(m =>
      !search ||
      m.homeTeam?.toLowerCase().includes(search.toLowerCase()) ||
      m.awayTeam?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const diff = new Date(a.utcDate) - new Date(b.utcDate);
      return fixtureTab === 'previous' ? -diff : diff;
    });

  const upcomingMatchdays = matchdays.filter(md =>
    fixtures.some(m => getMatchday(m) === md && !isFinished(m.status))
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <SEO title={`${league.name} | nineteen.dev`} />
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="w-full max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <Link to="/league" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-500 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Semua Liga
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{league.flag}</span>
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white" style={{ letterSpacing: '-0.05em' }}>
                  {league.name}
                </h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{league.country}</p>
              </div>
            </div>
          </div>

          {/* League selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(LEAGUES).map(([k, l]) => (
              <Link key={k} to={`/league/${k}`}
                className={`px-4 py-2 rounded-full text-sm font-black transition-all ${
                  k === leagueCode
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
                }`}>
                {l.flag} {l.name}
              </Link>
            ))}
          </div>

          {/* Countdown */}
          {!loadFix && <NextMatchCountdown fixtures={fixtures} />}

          {/* Main Card */}
          <div className="bg-white dark:bg-[#0a0c1a] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-2xl dark:shadow-indigo-900/10 p-6 md:p-10 border border-gray-100 dark:border-indigo-500/10 relative overflow-hidden">
            
            {/* Subtle ambient light for dark mode */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-3 mb-8 relative z-10">
              {[
                { key: 'fixtures',  label: 'Jadwal',   icon: <Calendar className="w-4 h-4" /> },
                { key: 'standings', label: 'Klasemen', icon: <Trophy className="w-4 h-4" /> },
                { key: 'scorers',   label: 'Top Skor', icon: <Target className="w-4 h-4" /> },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all border ${
                    tab === t.key
                      ? 'bg-indigo-600 dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 border-transparent text-white shadow-xl shadow-indigo-500/30 dark:shadow-[0_0_20px_rgba(147,51,234,0.3)] -translate-y-0.5'
                      : 'bg-gray-100 dark:bg-white/5 border-transparent dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── Fixtures ── */}
            {tab === 'fixtures' && (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                  <div className="flex gap-3 bg-gray-100 dark:bg-[#131527] p-1.5 rounded-full border border-transparent dark:border-white/5">
                    <button onClick={() => setFixtureTab('upcoming')}
                      className={`px-5 py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-widest transition-all ${
                        fixtureTab === 'upcoming'
                          ? 'bg-white dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-transparent dark:border-green-500/30 shadow-sm dark:shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'
                      }`}>Akan Datang</button>
                    <button onClick={() => setFixtureTab('previous')}
                      className={`px-5 py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-widest transition-all ${
                        fixtureTab === 'previous'
                          ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-transparent dark:border-gray-500/30 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'
                      }`}>Selesai</button>
                  </div>
                  <div className="relative w-full md:w-64">
                    <input type="text" placeholder="Cari klub..." value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#131527] border-2 border-gray-100 dark:border-[#2a2d4a] rounded-full text-sm font-bold focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 dark:text-white transition-colors"
                    />
                    <Search className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Matchday nav (only on upcoming tab) */}
                {fixtureTab === 'upcoming' && !search && activeMatchday && (
                  <MatchdayNav
                    matchdays={upcomingMatchdays.length ? upcomingMatchdays : matchdays}
                    active={activeMatchday}
                    onChange={setActiveMatchday}
                  />
                )}

                {errFix && <div className="text-red-500 font-bold text-center py-8">{errFix.message}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {loadFix
                    ? Array.from({length:8}).map((_,i)=><div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-2 border-gray-100 dark:border-gray-700 animate-pulse h-[210px]"/>)
                    : filtered.length > 0
                      ? filtered.map(m => <MatchCard key={m.id} match={m} onClick={() => setSelectedMatch(m)} />)
                      : <div className="col-span-full text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-sm">Tidak ada pertandingan.</div>
                  }
                </div>
              </>
            )}

            {/* ── Standings ── */}
            {tab === 'standings' && (
              <>
                {errStd && <div className="text-red-500 font-bold text-center py-8">{errStd.message}</div>}
                {loadStd
                  ? <div className="animate-pulse space-y-3">{Array.from({length:10}).map((_,i)=><div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl"/>)}</div>
                  : standings.length > 0
                    ? <StandingsTable data={standings} />
                    : <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-sm">Data klasemen tidak tersedia.</div>
                }
              </>
            )}

            {/* ── Top Scorers ── */}
            {tab === 'scorers' && (
              <TopScorers data={scorers} loading={loadScr} error={errScr} />
            )}

          </div>
        </div>
      </main>

      <Footer />

      {selectedMatch && (
        <GoalModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
