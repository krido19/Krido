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

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
      <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-2">⏱ Pertandingan Berikutnya</p>
      <p className="font-black text-lg mb-4">
        {timeLeft.match.homeTeam} <span className="text-white/50">vs</span> {timeLeft.match.awayTeam}
      </p>
      <div className="flex gap-4">
        {[['Hari', timeLeft.d], ['Jam', timeLeft.h], ['Menit', timeLeft.m], ['Detik', timeLeft.s]].map(([label, val]) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-black tabular-nums bg-white/20 rounded-xl px-3 py-2 min-w-[56px]">
              {String(val).padStart(2, '0')}
            </div>
            <div className="text-[10px] font-bold text-white/60 mt-1 uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/50 mt-3 font-bold">{formatDate(timeLeft.match.utcDate)}</p>
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

  return (
    <div
      className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {live && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-gray-400 tracking-widest">{formatDate(match.utcDate)}</span>
        <span className={`text-[10px] font-black px-2 py-1 rounded-md tracking-wider ${st.cls}`}>
          {live && match.minute ? `${match.minute}'` : st.label}
        </span>
      </div>
      {[
        { team: match.homeTeam, crest: match.homeCrest, score: match.homeScore },
        { team: match.awayTeam, crest: match.awayCrest, score: match.awayScore },
      ].map(({ team, crest, score }, i) => (
        <div key={i} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl mb-2 shadow-sm border border-gray-100 dark:border-gray-600 group-hover:border-indigo-500/20 transition-colors last:mb-0">
          <div className="flex items-center gap-3">
            {crest
              ? <img src={crest} alt={team} className="w-7 h-7 object-contain" />
              : <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-xs font-black text-indigo-600">{team?.slice(0,2).toUpperCase()}</div>
            }
            <span className="font-black text-sm text-gray-900 dark:text-white uppercase truncate max-w-[110px]">{team || 'TBD'}</span>
          </div>
          <span className={`font-black text-2xl ${live ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
            {done || live ? (score ?? '-') : '-'}
          </span>
        </div>
      ))}
      {match.matchday && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {match.matchday}
        </div>
      )}
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Match header */}
        <div className="text-center mb-6">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{formatDate(match.utcDate)}</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              {match.homeCrest && <img src={match.homeCrest} alt={match.homeTeam} className="w-10 h-10 object-contain mx-auto mb-1" />}
              <p className="text-xs font-black text-gray-700 dark:text-gray-200 truncate max-w-[90px]">{match.homeTeam}</p>
            </div>
            <div className="text-4xl font-black text-gray-900 dark:text-white">
              {match.homeScore ?? '-'} <span className="text-gray-300">:</span> {match.awayScore ?? '-'}
            </div>
            <div className="text-center">
              {match.awayCrest && <img src={match.awayCrest} alt={match.awayTeam} className="w-10 h-10 object-contain mx-auto mb-1" />}
              <p className="text-xs font-black text-gray-700 dark:text-gray-200 truncate max-w-[90px]">{match.awayTeam}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
          </div>
        ) : events === null ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold text-gray-500 dark:text-gray-400 text-sm">Data gol belum tersedia</p>
            <p className="text-xs text-gray-400 mt-1">Scraper VPS memperbarui data tiap malam</p>
          </div>
        ) : goals.length === 0 ? (
          <p className="text-center text-gray-400 font-bold text-sm py-4">Belum ada gol tercatat.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">⚽ Pencetak Gol</p>
            {goals.map((g, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                g.team === 'home'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30'
                  : 'bg-orange-50 dark:bg-orange-900/20 flex-row-reverse'
              }`}>
                <span className="text-lg">
                  {g.detail === 'penalty' ? '⚽🟡' : g.detail === 'ownGoal' ? '⚽🔴' : '⚽'}
                </span>
                <div className={g.team === 'away' ? 'text-right' : ''}>
                  <p className="font-black text-sm text-gray-900 dark:text-white">{g.player}</p>
                  {g.assist && <p className="text-[11px] text-gray-400 font-bold">Assist: {g.assist}</p>}
                  {g.detail === 'penalty'  && <p className="text-[10px] text-yellow-600 font-black">PENALTI</p>}
                  {g.detail === 'ownGoal'  && <p className="text-[10px] text-red-500 font-black">GOL BUNUH DIRI</p>}
                </div>
                <span className="ml-auto text-xs font-black text-gray-400 shrink-0">{g.minute}{g.extra ? `+${g.extra}` : "'"}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && cards.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">🟨 Kartu</p>
            <div className="flex flex-wrap gap-2">
              {cards.map((c, i) => (
                <span key={i} className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                  c.detail === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {c.detail === 'yellow' ? '🟨' : '🟥'} {c.player} {c.minute}'
                </span>
              ))}
            </div>
          </div>
        )}
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10 border border-gray-100 dark:border-gray-700">

            {/* Tab bar */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { key: 'fixtures',  label: 'Jadwal',   icon: <Calendar className="w-4 h-4" /> },
                { key: 'standings', label: 'Klasemen', icon: <Trophy className="w-4 h-4" /> },
                { key: 'scorers',   label: 'Top Skor', icon: <Target className="w-4 h-4" /> },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
                    tab === t.key
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 -translate-y-0.5'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── Fixtures ── */}
            {tab === 'fixtures' && (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex gap-3">
                    <button onClick={() => setFixtureTab('upcoming')}
                      className={`px-5 py-2.5 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
                        fixtureTab === 'upcoming'
                          ? 'bg-green-500 text-white shadow-xl shadow-green-500/30 -translate-y-0.5'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}>Akan Datang</button>
                    <button onClick={() => setFixtureTab('previous')}
                      className={`px-5 py-2.5 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
                        fixtureTab === 'previous'
                          ? 'bg-red-500 text-white shadow-xl shadow-red-500/30 -translate-y-0.5'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}>Selesai</button>
                  </div>
                  <div className="relative w-full md:w-64">
                    <input type="text" placeholder="Cari klub..." value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-full text-sm font-bold focus:outline-none focus:border-indigo-500 dark:text-white transition-colors"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
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
