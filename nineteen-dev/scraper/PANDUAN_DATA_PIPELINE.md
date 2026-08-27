# Panduan Data Pipeline: TheSportsDB → Supabase

## Ringkasan Arsitektur

```
TheSportsDB (gratis)
      ↓
  VPS Cron Job
  (sofascore.mjs)
      ↓
  Supabase
  (match_events)
      ↓
  Web Frontend
  (GoalModal)
```

---

## Kenapa TheSportsDB?

| Sumber | Skor | Gol+Assist | Dari VPS | Gratis |
|--------|------|------------|----------|--------|
| Sofascore API | ✅ | ✅ | ❌ (IP block) | ✅ |
| football-data.org | ✅ | ❌ | ✅ | ✅ |
| TheSportsDB | ✅ | ✅ | ✅ | ✅ |

TheSportsDB menggunakan key `3` (free tier) — tidak perlu registrasi.

---

## Endpoint yang Digunakan

### 1. Hasil pertandingan per liga
```
GET https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id={leagueId}&s={season}
```

**League ID yang dipantau:**
| Liga | ID |
|------|----|
| Premier League | `4328` |
| La Liga | `4335` |
| Bundesliga | `4331` |
| Serie A | `4332` |
| Ligue 1 | `4334` |

**Format season:** `2026-2027` (tahun mulai–tahun selesai)

**Filter yang dipakai:**
- `dateEvent === '2026-08-24'` → filter tanggal
- `strStatus === 'FT'` → hanya match yang selesai (Full Time)

**Field penting dari response:**
```json
{
  "idEvent": "2494009",
  "strHomeTeam": "Fulham",
  "strAwayTeam": "Chelsea",
  "intHomeScore": "2",
  "intAwayScore": "3",
  "dateEvent": "2026-08-24",
  "strStatus": "FT"
}
```

---

### 2. Timeline gol & kartu per match
```
GET https://www.thesportsdb.com/api/v1/json/3/lookupeventtimeline.php?id={idEvent}
```

**Field penting dari response:**
```json
{
  "strTimeline": "Goal",
  "strTimelineDetail": "Normal Goal",
  "strPlayer": "João Pedro",
  "strAssist": "Cole Palmer",
  "intTime": "1",
  "strTeam": "Chelsea",
  "strHome": "No"
}
```

**Filter:** `strTimeline === 'Goal'` atau `strTimeline === 'Card'`

**strTimelineDetail options:**
- `"Normal Goal"` → gol biasa
- `"Penalty"` → gol penalti
- `"Own Goal"` → gol bunuh diri
- `"Yellow Card"` / `"Red Card"` → kartu

---

## Struktur Tabel Supabase: `match_events`

```sql
create table match_events (
  id              bigserial primary key,
  sofascore_id    integer unique not null,  -- diisi idEvent dari TheSportsDB
  league_code     text not null,            -- 'PL', 'PD', 'BL1', 'SA', 'FL1'
  home_team       text,
  away_team       text,
  match_date      date,
  home_score      integer,
  away_score      integer,
  events          jsonb,                    -- array of goal/card events
  updated_at      timestamptz default now()
);
```

**Format kolom `events` (jsonb):**
```json
[
  {
    "type": "goal",
    "minute": 1,
    "player": "João Pedro",
    "assist": "Cole Palmer",
    "team": "away",
    "detail": "Normal Goal"
  },
  {
    "type": "card",
    "minute": 5,
    "player": "Levi Colwill",
    "assist": null,
    "team": "away",
    "detail": "Yellow Card"
  }
]
```

**Mapping field TheSportsDB → Supabase events:**
```javascript
{
  type:    t.strTimeline === 'Goal' ? 'goal' : 'card',
  minute:  parseInt(t.intTime) || 0,
  player:  t.strPlayer ?? null,
  assist:  t.strAssist || null,
  team:    t.strHome === 'Yes' ? 'home' : 'away',
  detail:  t.strTimelineDetail ?? null,
}
```

---

## Script Scraper: `scraper/sofascore.mjs`

Jalankan dari **VPS** (bukan Windows PC — karena Sofascore blokir IP Windows tidak relevan di sini, kita sudah pakai TheSportsDB).

### Setup
```bash
cd /root/uptime-kuma/scraper  # atau folder scraper Anda
npm install @supabase/supabase-js
```

### File `.env` yang dibutuhkan
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...   # service_role key, bukan anon!
TELEGRAM_BOT_TOKEN=xxxx       # opsional, untuk notif Telegram
TELEGRAM_ADMIN_ID=720415606   # opsional
```

### Jalankan manual
```bash
node --env-file=.env sofascore.mjs
```

### Cron otomatis (VPS)
Jalankan tiap hari jam 01:00 WIB (18:00 UTC):
```bash
crontab -e
```
Tambahkan:
```
0 18 * * * cd /path/to/scraper && node --env-file=.env sofascore.mjs >> /var/log/football-scraper.log 2>&1
```

---

## Flow Lengkap Scraper

```
1. Tentukan tanggal (kemarin & hari ini UTC)
   └─ new Date() - 1 day → '2026-08-26'

2. Untuk tiap liga (PL, PD, BL1, SA, FL1):
   └─ GET eventspastleague.php?id={leagueId}&s={season}
   └─ Filter: dateEvent === targetDate && strStatus === 'FT'

3. Untuk tiap match yang selesai:
   └─ GET lookupeventtimeline.php?id={idEvent}
   └─ Ambil hanya Goal dan Card
   └─ sleep 500ms (rate limit friendly)

4. Simpan ke Supabase:
   └─ supabase.from('match_events').upsert(row, { onConflict: 'sofascore_id' })
   └─ upsert = insert baru OR update kalau sudah ada

5. Kirim ringkasan ke Telegram (opsional)
```

---

## Web Frontend: Membaca dari Supabase

Di `GoalModal.jsx` atau komponen serupa:

```javascript
const { data } = await supabase
  .from('match_events')
  .select('events, home_team, away_team, home_score, away_score')
  .eq('sofascore_id', matchId)
  .single();

const goals = (data?.events ?? []).filter(e => e.type === 'goal');
```

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| TheSportsDB 403 | Blokir (jarang) | Cek `curl` dari VPS |
| `events` null di Supabase | Match belum di-scrape | Jalankan scraper manual |
| Gol tidak muncul | `lookupeventtimeline` lambat | Tambah sleep atau cek log |
| Season salah | Bulan < 7 di tahun baru | `getSeason()` sudah handle otomatis |
| `strStatus` bukan `'FT'` | Match postponed/suspended | Tambah filter `strPostponed === 'no'` |

---

## Catatan Penting

> **Rate Limit TheSportsDB:** Jangan hit lebih dari 1 request/detik.
> Script sudah ada `sleep(500ms)` per match.

> **`sofascore_id`** — meski nama kolom "sofascore_id", nilainya diisi `idEvent` dari TheSportsDB.
> Rename ke `event_id` di iterasi berikutnya kalau diperlukan.
> — *ponytail: kolom lama dipertahankan agar tidak perlu migrasi schema*

> **TheSportsDB season format:** `2026-2027` bukan `2026/2027`.
> Fungsi `getSeason(dateStr)` di scraper sudah handle konversi otomatis.
