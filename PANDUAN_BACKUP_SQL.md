# 📄 Panduan Migration & Troubleshooting SQL Backup

Dokumen ini berisi panduan langkah-demi-langkah untuk melakukan migrasi database Supabase dan solusi untuk masalah teknis yang telah diselesaikan.

---

## 🚀 Langkah Migrasi (Urutan Sangat Penting!)

Agar migrasi berjalan lancar tanpa error, ikuti urutan ini:

1.  **Sign Up di Project Baru:** 
    *   Buka website Anda (yang sudah dihubungkan ke project Supabase baru) atau gunakan fitur **Add User** di Dashboard Supabase project baru.
    *   Pastikan ada minimal 1 user di tabel `auth.users`.
2.  **Download Smart Backup:**
    *   Gunakan menu **Backup Database** di sidebar aplikasi.
3.  **Jalankan SQL:**
    *   Buka file `.sql` yang didownload.
    *   Copy semua isinya.
    *   Paste ke **SQL Editor** di Dashboard Supabase project baru, lalu klik **Run**.

---

## 🛠 Troubleshooting (Masalah yang Pernah Dihadapi)

Berikut adalah ringkasan error yang sudah diperbaiki agar tidak terulang kembali:

### 1. Foreign Key / Not-Null Constraint Error
*   **Masalah:** Mencoba memasukkan data profile tapi User ID tidak ditemukan (karena user belum mendaftar di project baru).
*   **Solusi:** Alat ekspor sekarang menggunakan "Smart Mapping" `(SELECT id FROM auth.users LIMIT 1)`. 
*   **Catatan:** Pastikan Anda mendaftar akun **sebelum** menjalankan script SQL.

### 2. Error: "cannot determine type of empty array"
*   **Masalah:** PostgreSQL bingung menentukan tipe data untuk list yang kosong (seperti kolom `skills`).
*   **Solusi:** Script SQL sekarang secara otomatis menambahkan casting `ARRAY[]::text[]` untuk setiap list yang kosong.

### 3. Error: "column image_url does not exist"
*   **Masalah:** Struktur tabel di alat backup tidak sama dengan struktur tabel terbaru di database (karena ada update kolom `image_url` dan `is_pinned`).
*   **Solusi:** `dbSchema.js` sudah disinkronkan dengan semua file migrasi SQL terbaru (`update_schema*.sql`).

### 4. Error: JSONB vs Text Array Mismatch
*   **Masalah:** Data fitur di menu Services bersifat `jsonb`, tapi script menganggapnya sebagai `text[]`.
*   **Solusi:** Script ekspor sekarang memiliki logika khusus untuk mengenali kolom yang berawalan `features_` dan memberikan casting `::jsonb` yang tepat.

---

## 📂 Lokasi File Penting
*   `src/utils/sqlExport.js`: Logika pengambilan data dan konversi ke SQL.
*   `src/utils/dbSchema.js`: Definisi struktur tabel (Schema) untuk project baru.
*   `src/components/Layout.jsx`: Lokasi menu tombol Backup di sidebar.

---
*Dokumen ini dibuat pada 24 Desember 2025 sebagai panduan migrasi Krido Portfolio.*
