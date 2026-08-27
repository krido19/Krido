#!/usr/bin/env node
/**
 * TheSportsDB → Supabase scraper
 * Jalankan di VPS via cron: 0 18 * * * (jam 01:00 WIB)
 *
 * Install: npm install @supabase/supabase-js
 * Run:     node --env-file=.env sofascore.mjs
 *
 * TheSportsDB free API (key=3) — accessible dari VPS, ada goal scorer + kartu
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TG_TOKEN             = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID             = process.env.TELEGRAM_ADMIN_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TSDB = 'https://www.thesportsdb.com/api/v1/json/3';

// TheSportsDB league IDs → kode kita
const LEAGUES = [
  { tsdbId: '4328', code: 'PL',  name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { tsdbId: '4335', code: 'PD',  name: 'La Liga',         flag: '🇪🇸' },
  { tsdbId: '4331', code: 'BL1', name: 'Bundesliga',       flag: '🇩🇪' },
  { tsdbId: '4332', code: 'SA',  name: 'Serie A',          flag: '🇮🇹' },
  { tsdbId: '4334', code: 'FL1', name: 'Ligue 1',          flag: '🇫🇷' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

/** Ambil semua event untuk satu hari dari TheSportsDB */
async function fetchEventsByDate(dateStr) {
  const data = await fetchJson(`${TSDB}/eventsday.php?d=${dateStr}&s=Soccer`);
  return data.events ?? [];
}

/** Ambil timeline (gol, kartu) untuk satu match */
async function fetchTimeline(idEvent) {
  const data = await fetchJson(`${TSDB}/lookupeventtimeline.php?id=${idEvent}`);
  return (data.timeline ?? [])
    .filter(t => t.strTimeline === 'Goal' || t.strTimeline === 'Card')
    .map(t => ({
      type:    t.strTimeline === 'Goal' ? 'goal' : 'card',
      minute:  parseInt(t.intTime) || 0,
      player:  t.strPlayer ?? null,
      assist:  t.strAssist || null,
      team:    t.strHome === 'Yes' ? 'home' : 'away',
      detail:  t.strTimelineDetail ?? null,  // 'Normal Goal', 'Penalty', 'Own Goal', 'Yellow Card', 'Red Card'
    }));
}

async function saveMatch(row) {
  const { error } = await supabase
    .from('match_events')
    .upsert(row, { onConflict: 'sofascore_id' });
  if (error) console.error('  Supabase error:', error.message);
}

async function sendTelegram(text) {
  if (!TG_TOKEN || !ADMIN_ID) return;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'Markdown' }),
  }).catch(e => console.warn('[tg]', e.message));
}

function getSeason(dateStr) {
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(5, 7));
  return m >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

async function run() {
  const now    = new Date();
  const argDate = process.argv[2]; // opsional: node sofascore.mjs 2026-08-21
  const season  = getSeason(argDate ?? now.toISOString().slice(0, 10));

  console.log(`[scraper] Start — ${now.toISOString()} | season ${season}${argDate ? ' | filter: ' + argDate : ' | all FT'}`);
  const leagueLines = {};

  for (const league of LEAGUES) {
    let allEvents;
    try {
      const res = await fetch(`${TSDB}/eventsseason.php?id=${league.tsdbId}&s=${season}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) { console.warn(`  SKIP ${league.code}: ${res.status}`); continue; }
      const data = await res.json();
      allEvents = data.events ?? [];
    } catch (err) {
      console.warn(`  SKIP ${league.code}:`, err.message);
      continue;
    }
    // Filter: hanya FT, dan jika ada argDate filter by date
    const matches = allEvents.filter(e =>
      e.strStatus === 'FT' && (!argDate || e.dateEvent === argDate)
    );
    if (matches.length === 0) continue;
    console.log(`  ${league.code}: ${matches.length} match selesai`);

    for (const m of matches) {
      await sleep(500);
      let events = [];
      try {
        events = await fetchTimeline(m.idEvent);
      } catch (err) {
        console.warn(`    timeline ${m.idEvent}:`, err.message);
      }

      await saveMatch({
        sofascore_id: parseInt(m.idEvent),
        league_code:  league.code,
        home_team:    m.strHomeTeam,
        away_team:    m.strAwayTeam,
        match_date:   m.dateEvent,
        home_score:   parseInt(m.intHomeScore) ?? null,
        away_score:   parseInt(m.intAwayScore) ?? null,
        events,
        updated_at:   new Date().toISOString(),
      });

      const goals = events.filter(e => e.type === 'goal');
      console.log(`    ✓ ${m.strHomeTeam} ${m.intHomeScore}–${m.intAwayScore} ${m.strAwayTeam} [${m.dateEvent}] (${goals.length} gol)`);

      if (!leagueLines[league.code]) leagueLines[league.code] = { meta: league, lines: [] };
      leagueLines[league.code].lines.push(
        `${m.strHomeTeam} ${m.intHomeScore}–${m.intAwayScore} ${m.strAwayTeam}`
      );
    }
  }

  // Kirim ringkasan ke Telegram
  const sections = Object.values(leagueLines).map(({ meta, lines }) =>
    `${meta.flag} *${meta.name}*\n${lines.join('\n')}`
  );
  const date4tg = argDate ?? new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const msg = `⚽ *Hasil Liga Eropa — ${date4tg}*\n\n` + sections.join('\n\n');
    await sendTelegram(msg);

  console.log(`[scraper] Done — ${new Date().toISOString()}`);
}

run().catch(err => {
  console.error('[scraper] Fatal:', err);
  process.exit(1);
});
