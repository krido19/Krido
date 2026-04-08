---
name: global_rules
description: Aturan global yang SELALU berlaku di semua sesi kerja di proyek ini, tanpa terkecuali.
---

# Aturan Global Proyek

## ❌ DILARANG — Jangan Pernah Membuka Browser

**JANGAN PERNAH** menggunakan tool `browser_subagent` untuk alasan apapun, termasuk:
- Verifikasi tampilan UI
- Mengecek apakah perubahan berhasil diterapkan
- Screenshot halaman web
- Testing interaktif di browser

### Alternatif yang Diizinkan
- Verifikasi kode dengan membaca file langsung menggunakan `view_file`
- Cek error dengan membaca output terminal menggunakan `command_status`
- Konfirmasi hasil dengan bertanya kepada USER secara langsung
