# 📈 Panduan Setup Google Search Console (GSC)

Berikut adalah langkah-langkah detail untuk mendaftarkan website portofolio Anda (`https://krido-bahtiar.vercel.app/`) ke Google Search Console agar bisa di-crawl dan muncul di pencarian Google.

## Langkah 1: Daftar / Login
1.  Buka [Google Search Console](https://search.google.com/search-console).
2.  Login menggunakan akun Google (Gmail) Anda.

## Langkah 2: Tambahkan Properti
Anda akan diminta memilih tipe properti. Ada dua cara, pilih salah satu:

### Opsi A: URL Prefix (Lebih Mudah untuk Vercel/HTML Tag) - **DIREKOMENDASIKAN**
Opsi ini lebih mudah karena verifikasinya bisa lewat kode HTML tanpa harus masuk ke settingan DNS domain.

1.  Pilih kotak **URL prefix** (di sebelah kanan).
2.  Masukkan URL lengkap website: `https://krido-bahtiar.vercel.app/`
3.  Klik **Continue**.
4.  Pilih metode verifikasi **HTML Tag**:
    *   Google akan memberikan kode seperti: `<meta name="google-site-verification" content="KODE_ACAK_PANJANG" />`
    *   **Salin** kode tersebut.
    *   Berikan kode tersebut kepada saya, nanti saya pasang di `index.html`.
    *   **ATAU** Pasang sendiri di file `index.html` di dalam folder root project, tepat sebelum tutup tag `</head>`.
5.  Setelah kode dipasang dan dideploy, kembali ke GSC dan klik **Verify**.

### Opsi B: Domain (Lebih Professional)
Opsi ini memverifikasi domain `vercel.app` atau custom domain Anda secara menyeluruh.

1.  Pilih kotak **Domain** (di sebelah kiri).
2.  Masukkan domain tanpa https: `krido-bahtiar.vercel.app`
3.  Klik **Continue**.
4.  Anda akan diberi **TXT Record**.
5.  Buka dashboard provider domain Anda (atau Vercel Dashboard jika manage domain di sana).
6.  Tambahkan DNS Record baru:
    *   Type: `TXT`
    *   Name: `@` (atau kosong)
    *   Value: (Paste kode TXT dari Google tadi)
7.  Tunggu beberapa menit, lalu klik **Verify** di GSC.

## Langkah 3: Submit Sitemap
Setelah berhasil diverifikasi:

1.  Di menu sebelah kiri GSC, klik **Sitemaps**.
2.  Di kolom "Add a new sitemap", ketik: `sitemap.xml`
3.  Klik **Submit**.
4.  Status harusnya berubah menjadi "Success". Ini memberitahu Google halaman mana saja yang ada di website Anda.

## Langkah 4: Request Indexing (Opsional tapi Bagus)
Agar halaman utama cepat muncul:

1.  Ketik `https://krido-bahtiar.vercel.app/` di kolom pencarian paling atas ("Inspect any URL").
2.  Tekan Enter.
3.  Klik tombol **Request Indexing**.

---

**Tips**: Jika Anda memilih Opsi A (HTML Tag), silakan kirimkan kode meta tag-nya di chat ini, saya akan bantu pasangkan di kode Anda.
---

## 🛠️ Troubleshooting

### Masalah: Status Sitemap "Couldn't fetch" (Tidak dapat diambil)
Jika Anda melihat status ini di GSC, jangan panik. Ini wajar terjadi terutama saat baru pertama kali submit.

**Penyebab:**
1.  **Deployment Belum Selesai**: Vercel butuh waktu beberapa menit untuk men-deploy perubahan kode. Google mencoba mengakses file sebelum file tersebut "live".
2.  **Google Pending**: Terkadang ini adalah bug tampilan sementara dari Google ("false alarm").

**Solusi:**
1.  Buka link sitemap di browser Anda: [https://kridobahtiar.my.id/sitemap.xml](https://kridobahtiar.my.id/sitemap.xml).
2.  Jika muncul kode XML, berarti website **aman**.
3.  Tunggu beberapa jam atau 1 hari, status di GSC akan berubah menjadi **Success** dengan sendirinya.
4.  Pastikan Anda memasukkan **URL Lengkap** (`https://kridobahtiar.my.id/sitemap.xml`) saat submit, bukan hanya nama filenya.
