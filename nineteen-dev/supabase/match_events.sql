-- Tabel untuk menyimpan events (gol, kartu) per pertandingan
-- Diisi oleh scraper VPS dari Sofascore
-- Dibaca oleh frontend via Supabase anon key

create table if not exists match_events (
  id            bigserial primary key,
  -- Identifikasi match: nama tim + tanggal (untuk cross-ref dengan FDO)
  home_team     text not null,
  away_team     text not null,
  match_date    date not null,
  league_code   text not null,   -- 'PL', 'PD', 'BL1', 'SA', 'FL1'
  sofascore_id  bigint unique,   -- ID match di Sofascore (untuk deduplikasi)
  -- Score
  home_score    int,
  away_score    int,
  -- Events (JSON array)
  events        jsonb not null default '[]',
  -- Meta
  scraped_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index untuk query by tanggal + liga
create index if not exists idx_match_events_date    on match_events(match_date);
create index if not exists idx_match_events_league  on match_events(league_code);
create index if not exists idx_match_events_teams   on match_events(home_team, away_team);

-- RLS: biarkan anon bisa baca (frontend pakai anon key)
alter table match_events enable row level security;

create policy "public read match_events"
  on match_events for select
  using (true);

-- Service role bisa insert/update (scraper pakai service key)
create policy "service write match_events"
  on match_events for all
  using (auth.role() = 'service_role');
