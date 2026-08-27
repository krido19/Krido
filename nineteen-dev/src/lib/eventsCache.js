/**
 * Match Events — baca dari Supabase (diisi oleh scraper VPS)
 * Gantikan eventsCache.js yang sebelumnya pakai api-football + localStorage.
 *
 * ponytail: Supabase sudah ada di project ini, tidak perlu dependency baru.
 */

import { supabase } from '../supabaseClient';

/**
 * Cari events (gol, kartu) berdasarkan nama tim (fuzzy match).
 * Return null jika belum ada di database.
 * @returns {Array|null}
 */
export async function fetchMatchEvents(homeTeam, awayTeam) {
  // Fuzzy: pakai kata pertama nama tim (cukup untuk disambiguasi)
  const homeKey = homeTeam.split(' ')[0];
  const awayKey = awayTeam.split(' ')[0];

  const { data, error } = await supabase
    .from('match_events')
    .select('events, home_team, away_team, home_score, away_score')
    .ilike('home_team', `%${homeKey}%`)
    .ilike('away_team', `%${awayKey}%`)
    .order('match_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.events ?? [];
}

// Stub scheduler — tidak dipakai lagi (scraper jalan di VPS)
export function initEventsScheduler() {}
export function findCachedEventsByTeams() { return null; }
