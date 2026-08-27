# 🤖 Panduan Deploy Scraper (TheSportsDB → Supabase)

**VPS:** `119.28.100.51` | **OS:** OpenCloudOS 9

> ⚠️ **PENTING**: Scraper awalnya pakai Sofascore, tapi Sofascore memblokir semua IP datacenter (403 Forbidden).
> Sudah diganti ke **TheSportsDB** yang gratis dan bisa diakses dari VPS.

---

## STEP 1 — Jalankan SQL di Supabase

Buka **Supabase Dashboard → SQL Editor**, paste dan jalankan:
```
supabase/match_events.sql
```

---

## STEP 2 — Lokasi Scraper di VPS

Scraper ada di dalam repo **Uptimer-Nineteen**, bukan folder terpisah:
```
/root/uptime-kuma/scraper/sofascore.mjs
```

Update scraper via GitHub:
```bash
cd /root/uptime-kuma && git pull origin main
```

---

## STEP 3 — Buat File .env di VPS

```bash
mkdir -p /root/uptime-kuma/scraper
cat > /root/uptime-kuma/scraper/.env << 'EOF'
SUPABASE_URL=https://ratrlqwxzmyhlwnxukkf.supabase.co
SUPABASE_SERVICE_KEY=PASTE_SERVICE_ROLE_KEY_DISINI
TELEGRAM_BOT_TOKEN=xxxx
TELEGRAM_ADMIN_ID=720415606
EOF
```

> `SUPABASE_SERVICE_KEY` ambil dari Supabase → Settings → API → **service_role** (bukan anon!)

---

## STEP 4 — Install Dependency

```bash
cd /root/uptime-kuma
npm install @supabase/supabase-js
```

---

## STEP 5 — Test Jalankan Manual

```bash
# WAJIB cd dulu ke folder uptime-kuma!
cd /root/uptime-kuma

# Jalankan untuk kemarin+hari ini (default)
node --env-file=scraper/.env scraper/sofascore.mjs

# Jalankan untuk tanggal spesifik (backfill/test)
node --env-file=scraper/.env scraper/sofascore.mjs 2026-08-24
```

Output yang diharapkan:
```
[scraper] Start — 2026-08-27T...
  Fetching 2026-08-24 (season 2026-2027)...
    PL: 1 match selesai
    ✓ Fulham 2–3 Chelsea (3 gol)
    SA: 1 match selesai
    ✓ Roma 4–0 Fiorentina (2 gol)
[scraper] Done — 2026-08-27T...
```

---

## STEP 6 — Setup Cron (Tiap Pagi Jam 05:00 WIB)

Gunakan cara ini agar tidak error di vim:
```bash
crontab -l | grep -v "sofascore.mjs" > /tmp/ct.txt
echo "0 22 * * * cd /root/uptime-kuma && node --env-file=scraper/.env scraper/sofascore.mjs >> /var/log/football.log 2>&1" >> /tmp/ct.txt
crontab /tmp/ct.txt
crontab -l  # verifikasi
```

> 05:00 WIB = **22:00 UTC** (hari sebelumnya)

---

## STEP 7 — Cek Log

```bash
tail -f /var/log/football.log
```

---

## ⚠️ Masalah yang Pernah Terjadi

### 1. Sofascore 403 dari VPS
**Gejala:** Semua league `status: 403`
**Penyebab:** Sofascore blokir IP datacenter (Tencent Cloud)
**Solusi:** Sudah diganti TheSportsDB ✅

### 2. Sofascore 403 dari PC Windows
**Gejala:** `CERT_HAS_EXPIRED` lalu `403`
**Penyebab:** SSL cert Windows expired + Sofascore juga blokir
**Solusi:** TheSportsDB tidak ada masalah ini ✅

### 3. `eventsday.php` tidak return PL/Liga Eropa
**Gejala:** Bot bilang "tidak ada pertandingan" padahal ada
**Penyebab:** `eventsday.php` hanya return subset event, PL tidak selalu masuk
**Solusi:** Pakai `eventspastleague.php` per liga + filter by date ✅

### 4. `node: scraper/.env: not found`
**Gejala:** Error saat jalankan scraper
**Penyebab:** Tidak `cd` ke folder `uptime-kuma` dulu
**Solusi:** Selalu jalankan dari `/root/uptime-kuma`:
```bash
cd /root/uptime-kuma && node --env-file=scraper/.env scraper/sofascore.mjs
```

### 5. Import error `./supabaseClient` di web
**Gejala:** Vite error `Failed to resolve import "./supabaseClient"`
**Penyebab:** File `supabaseClient.js` ada di `src/` bukan `src/lib/`
**Solusi:** Fix import di `eventsCache.js` jadi `../supabaseClient` ✅

---

## Catatan

- Scraper jalan otomatis jam **05:00 WIB** tiap pagi
- Data kemarin + hari ini di-fetch per liga via `eventspastleague.php`
- Throttle 500ms antar request (rate-limit friendly)
- Setelah scraper selesai, otomatis kirim ringkasan ke **Telegram**
- Data tersimpan di `match_events`, dibaca GoalModal web via Supabase anon key
- Detail data pipeline: lihat `PANDUAN_DATA_PIPELINE.md`

