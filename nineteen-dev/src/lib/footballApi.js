/**
 * Football API router
 * Standby:  football-data.org (unlimited leagues, 10 req/min)
 * Premium:  api-football via RapidAPI (100 req/day) — hanya dipakai jam sibuk
 *
 * Jam sibuk: Jumat–Minggu, pukul 19:00–02:59 WIB
 * ponytail: fallback sederhana, tanpa retry-loop
 */

// League IDs — football-data.org / api-football
const LEAGUES = {
  PL:  { fdoId: 'PL',  afId: 39,  name: 'Premier League',  country: 'Inggris',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  BL1: { fdoId: 'BL1', afId: 78,  name: 'Bundesliga',      country: 'Jerman',   flag: '🇩🇪' },
  PD:  { fdoId: 'PD',  afId: 140, name: 'La Liga',         country: 'Spanyol',  flag: '🇪🇸' },
  SA:  { fdoId: 'SA',  afId: 135, name: 'Serie A',         country: 'Italia',   flag: '🇮🇹' },
  FL1: { fdoId: 'FL1', afId: 61,  name: 'Ligue 1',         country: 'Prancis',  flag: '🇫🇷' },
};

export { LEAGUES };

const FDO_KEY = import.meta.env.VITE_FOOTBALL_DATA_ORG_KEY;
const AF_KEY  = import.meta.env.VITE_API_FOOTBALL_KEY;
const AF_BASE = 'https://v3.football.api-sports.io';

// Pakai Vite proxy di dev (/fdo) untuk bypass CORS localhost:5173
// Di production, fetch langsung ke origin
const FDO_BASE = import.meta.env.DEV
  ? '/fdo'
  : 'https://api.football-data.org/v4';

/** Apakah sekarang jam sibuk pertandingan? (Jum-Ming, 19:00-02:59 WIB) */
function isPeakTime() {
  const now = new Date();
  const wibHour = (now.getUTCHours() + 7) % 24;
  const wibDay  = new Date(now.getTime() + 7 * 3600000).getUTCDay(); // 0=Minggu,5=Jumat,6=Sabtu
  const isWeekend = wibDay === 0 || wibDay === 5 || wibDay === 6;
  const isEvening = wibHour >= 19 || wibHour <= 2;
  return isWeekend && isEvening;
}

// Normalizer — samakan format dari kedua API ke satu shape

function normalizeFdo(matches) {
  return matches.map(m => ({
    id:        `fdo-${m.id}`,
    source:    'fdo',
    utcDate:   m.utcDate,
    status:    m.status,
    minute:    m.minute ?? null,
    homeTeam:  m.homeTeam.name,
    awayTeam:  m.awayTeam.name,
    homeCrest: m.homeTeam.crest,
    awayCrest: m.awayTeam.crest,
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    matchday:  m.matchday,
    stage:     m.stage,
    group:     m.group ?? null,
  }));
}

function normalizeAf(fixtures) {
  return fixtures.map(f => {
    const g = f.fixture;
    const s = f.score?.fulltime;
    return {
      id:        `af-${g.id}`,
      source:    'af',
      utcDate:   g.date,
      status:    g.status?.short,
      minute:    g.status?.elapsed ?? null,
      homeTeam:  f.teams?.home?.name,
      awayTeam:  f.teams?.away?.name,
      homeCrest: f.teams?.home?.logo,
      awayCrest: f.teams?.away?.logo,
      homeScore: s?.home ?? null,
      awayScore: s?.away ?? null,
      matchday:  f.league?.round ?? null,
      stage:     null,
      group:     null,
    };
  });
}

async function fetchFromFdo(fdoId) {
  const season = new Date().getFullYear();
  const res = await fetch(
    `${FDO_BASE}/competitions/${fdoId}/matches?season=${season}`,
    { headers: { 'X-Auth-Token': FDO_KEY } }
  );
  if (!res.ok) throw new Error(`FDO ${res.status}`);
  const data = await res.json();
  return normalizeFdo(data.matches ?? []);
}

async function fetchFromAf(afId) {
  const season = new Date().getFullYear();
  const res = await fetch(
    `${AF_BASE}/fixtures?league=${afId}&season=${season}`,
    { headers: { 'x-apisports-key': AF_KEY } }
  );
  if (!res.ok) throw new Error(`AF ${res.status}`);
  const data = await res.json();
  return normalizeAf(data.response ?? []);
}

async function fetchStandingsFdo(fdoId) {
  const res = await fetch(
    `${FDO_BASE}/competitions/${fdoId}/standings`,
    { headers: { 'X-Auth-Token': FDO_KEY } }
  );
  if (!res.ok) throw new Error(`FDO standings ${res.status}`);
  const data = await res.json();
  const total = data.standings?.find(s => s.type === 'TOTAL') ?? data.standings?.[0];
  return (total?.table ?? []).map(row => ({
    position: row.position,
    team:     row.team.name,
    crest:    row.team.crest,
    played:   row.playedGames,
    won:      row.won,
    draw:     row.draw,
    lost:     row.lost,
    gf:       row.goalsFor,
    ga:       row.goalsAgainst,
    gd:       row.goalDifference,
    points:   row.points,
    form:     row.form,
  }));
}

/**
 * Fetch fixtures untuk sebuah liga.
 * Jam sibuk -> api-football, fallback -> football-data.org.
 */
export async function fetchFixtures(leagueCode) {
  const league = LEAGUES[leagueCode];
  if (!league) throw new Error(`Unknown league: ${leagueCode}`);

  if (isPeakTime()) {
    try {
      console.log(`[footballApi] peak -> api-football (${leagueCode})`);
      return await fetchFromAf(league.afId);
    } catch (err) {
      console.warn('[footballApi] fallback ke FDO:', err.message);
    }
  }

  console.log(`[footballApi] standby -> football-data.org (${leagueCode})`);
  return fetchFromFdo(league.fdoId);
}

/**
 * Fetch klasemen (selalu pakai football-data.org).
 */
export async function fetchStandings(leagueCode) {
  const league = LEAGUES[leagueCode];
  if (!league) throw new Error(`Unknown league: ${leagueCode}`);
  return fetchStandingsFdo(league.fdoId);
}

/**
 * Fetch top scorers.
 */
export async function fetchScorers(leagueCode, limit = 10) {
  const league = LEAGUES[leagueCode];
  if (!league) throw new Error(`Unknown league: ${leagueCode}`);
  const season = new Date().getFullYear();
  const res = await fetch(
    `${FDO_BASE}/competitions/${league.fdoId}/scorers?season=${season}&limit=${limit}`,
    { headers: { 'X-Auth-Token': FDO_KEY } }
  );
  if (!res.ok) throw new Error(`FDO scorers ${res.status}`);
  const data = await res.json();
  return (data.scorers ?? []).map((s, i) => ({
    rank:         i + 1,
    name:         s.player.name,
    nationality:  s.player.nationality,
    team:         s.team.name,
    crest:        s.team.crest,
    goals:        s.goals,
    assists:      s.assists ?? 0,
    penalties:    s.penalties ?? 0,
    played:       s.playedMatches,
  }));
}
