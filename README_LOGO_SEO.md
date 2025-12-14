# 🦁 Panduan SEO: Menampilkan Logo di Google Search

Dokumen ini menjelaskan secara teknis dan praktis bagaimana memastikan logo website (Knowledge Graph / Brand Logo) muncul di hasil pencarian Google.

## 🎯 Tujuan
Agar saat orang mencari "Krido Bahtiar" atau nama brand Anda di Google, logo resmi muncul di kotak informasi (Knowledge Panel) atau di samping hasil pencarian.

## 🛠️ Implementasi Teknis yang Dilakukan

Kami telah menerapkan **Structured Data (JSON-LD)** dengan tipe `Organization`. Ini adalah bahasa yang dipahami Google untuk mengidentifikasi detail bisnis.

### 1. Schema Tanpa Syarat (Static Rendering)
Sebelumnya, schema ini hanya muncul *jika* data profil berhasil diambil dari database. Ini berisiko karena Googlebot mungkin tidak menunggu database loading.
**Sekarang:** Kode schema dipasang "mati" (hardcoded/static) di `src/pages/Home.jsx`. Artinya, Googlebot akan **selalu** melihatnya seketika saat mengunjungi halaman, tanpa menunggu loading.

### Kode JSON-LD
Berikut adalah struktur data yang telah ditanam di website Anda:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Krido Bahtiar",
  "url": "https://www.kridobahtiar.my.id",
  "logo": "https://www.kridobahtiar.my.id/logo.png",
  "sameAs": [
    "https://linkedin.com/in/username",
    "https://github.com/username",
    "https://instagram.com/username",
    "https://website-lain.com"
  ]
}
```

*   **@type: Organization**: Memberitahu Google ini adalah entitas organisasi/bisnis/brand pibadi.
*   **logo**: URL absolut gambar logo. Wajib format `.jpg`, `.png`, atau `.webp`. Di sini kita menggunakan `https://www.kridobahtiar.my.id/logo.png`.
*   **url**: Website utama resmi.
*   **sameAs**: Link ke profil sosial media resmi untuk validasi identitas (Social Proof).

### 2. Favicon & Touch Icons
Kami juga memperbarui `index.html` agar menggunakan **Absolute URL**.
*   **Mengapa?** Crawler Google kadang bingung dengan path relatif (`/logo.png`). Dengan path lengkap (`https://.../logo.png`), robot lebih mudah menemukan file gambar.

---

## 🔍 Cara Verifikasi (Wajib Dilakukan)

Setelah kode di-push dan deploy, lakukan langkah ini:

### Langkah 1: Google Rich Results Test
1.  Buka [Google Rich Results Test](https://search.google.com/test/rich-results).
2.  Masukkan URL: `https://www.kridobahtiar.my.id`.
3.  Klik **Test URL**.
4.  **Target**: Anda harus melihat centang hijau **"Organization"** atau **"Logo"** terdeteksi.
5.  Klik panah kecilnya, pastikan detail `name`, `url`, dan `logo` sudah benar.

### Langkah 2: Google Search Console (GSC)
1.  Login ke GSC.
2.  Masukkan URL homepage di kolom search atas (**URL Inspection**).
3.  Klik tombol **REQUEST INDEXING**.
4.  Ini "memanggil" Googlebot untuk datang dan membaca kode baru tersebut.

---

## ⏳ Berapa Lama Sampai Muncul?

*   Ini **TIDAK INSTAN**.
*   Setelah Request Indexing, biasanya butuh **3 hari s/d 2 minggu**.
*   Faktor penentu lain: Seberapa sering website di-update, traffic website, dan validasi "sameAs" (social signals).

## ⚠️ Troubleshooting
Jika setelah 2 minggu logo belum keluar:
1.  **Cek Gambar**: Pastikan `https://www.kridobahtiar.my.id/logo.png` bisa dibuka di browser (tidak 404).
2.  **Ukuran Gambar**: Google menyarankan logo minimal 112x112px. Format `.jpg` atau `.png` paling aman.
3.  **Konsistensi**: Pastikan logo yang sama juga dipakai sebagai foto profil di Social Media yang tertera di `sameAs`.

---
*Dibuat otomatis oleh Asisten AI untuk Dokumentasi Proyek Krido Bahtiar.*
