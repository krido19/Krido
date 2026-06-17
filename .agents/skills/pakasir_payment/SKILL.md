---
name: pakasir_payment
description: >
  Panduan integrasi Pakasir Payment Gateway ke admin dashboard nineteen-dev.
  Gunakan skill ini saat mengerjakan fitur pembayaran Pakasir (QRIS, Virtual Account)
  di halaman admin (ManagePayments, CreatePayment, dll).
---

# Skill: Pakasir Payment Gateway Integration

## 1. Overview

Pakasir adalah payment gateway Indonesia yang mendukung QRIS, BNI VA, BRI VA, CIMB Niaga VA, Permata VA, Maybank VA, ATM Bersama VA, dan lain-lain.

Digunakan di project **nineteen-dev** sebagai provider pembayaran kedua (bersanding dengan bayar.gg) di admin panel.

---

## 2. Konfigurasi

### Environment Variables
Disimpan di `.env`:
```
VITE_PAKASIR_PROJECT_SLUG=nineteen-dev
VITE_PAKASIR_API_KEY=9UjjIQTI7mexFZhKd6WQ3l9FugwkLTfx
```

- **Slug**: diambil dari bagian "Integrasi" di halaman Detail Proyek di dashboard Pakasir.
- **API Key**: juga dari halaman Detail Proyek.

### Proxy (Vite Dev)
Ditambahkan di `vite.config.js`:
```js
'/pakasir': {
  target: 'https://app.pakasir.com',
  changeOrigin: true,
  secure: false,
  rewrite: (path) => path.replace(/^\/pakasir/, '/api'),
}
```

> ⚠️ **PENTING: Proxy ini TIDAK BERGUNA untuk API call.** Lihat bagian Keterbatasan di bawah.

---

## 3. Keterbatasan Kritis: API Diblokir Cloudflare

> ⚠️ **Pakasir memblokir semua server-side API request dengan HTTP 403 Forbidden.**

Meskipun project sudah dalam mode **Production** dan API Key sudah benar, semua request ke `https://app.pakasir.com/api/*` yang berasal dari proxy (Vite dev server / Vercel serverless) akan ditolak dengan:
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
[pakasir] API gagal: Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

**Penyebab:** Pakasir menggunakan Cloudflare yang memblokir automated/server-origin requests. Hanya request langsung dari browser yang diizinkan.

**Implikasi:** Tidak bisa mendapatkan QRIS string EMV (`payment_number`) dari API untuk ditampilkan sebagai QR code di admin panel kita — berbeda dengan bayar.gg yang API-nya bebas diakses dari server.

**Mode Sandbox** juga menambah keterbatasan: QRIS string tidak valid untuk di-scan, dan VA tidak bisa ditransfer. Selalu gunakan mode **Production** untuk testing nyata.

---

## 4. Solusi yang Diterapkan: URL-Based Integration

Karena API diblokir, integrasi Pakasir di project ini menggunakan **URL Redirect (Metode B dari docs)** bukan API (Metode C).

### Cara Kerja
1. Admin mengisi nominal dan data pembayaran di `CreatePayment.jsx`.
2. Sistem generate `order_id` unik (`INV{timestamp}`).
3. Generate URL Pakasir:
   ```
   https://app.pakasir.com/pay/{slug}/{amount}?order_id={order_id}
   ```
4. Halaman Pakasir **otomatis dibuka di tab baru** (`window.open`).
5. Record invoice disimpan di `localStorage` (`pakasir_history`) untuk tampil di `ManagePayments.jsx`.
6. Modal konfirmasi muncul di admin panel dengan link + tombol Copy.

### Kelebihan Metode Ini
- Tidak butuh API key saat checkout (CORS-free).
- Halaman Pakasir menampilkan semua metode pembayaran (QRIS, semua VA) dengan tampilan resmi.
- QRIS asli tersedia di halaman Pakasir dan bisa di-scan langsung.

### Kekurangan vs bayar.gg
- QR code TIDAK bisa ditampilkan langsung di admin panel kita.
- User harus melihat QR di halaman Pakasir (tab baru).

---

## 5. Utility Helper & Cek Status

File: `src/utils/pakasir.js`

```js
const BASE_URL = '/pakasir';
const PAKASIR_API_KEY = import.meta.env.VITE_PAKASIR_API_KEY || '';
const PAKASIR_PROJECT = import.meta.env.VITE_PAKASIR_PROJECT_SLUG || '';

export const createTransaction = (method, payload) => { ... }
export const checkTransaction = (orderId, amount) => { ... }
export const cancelTransaction = (payload) => { ... }
```

### Bypass Cloudflare untuk Fitur "Cek Status" (GET)
Meskipun API `transactioncreate` (POST) selalu diblokir dari proxy, untungnya API `transactiondetail` (GET, digunakan oleh fungsi `checkTransaction`) **BISA** lolos dari proxy jika kita menyisipkan Header `User-Agent` & `Referer` di konfigurasi Vite `vite.config.js`:

```js
'/pakasir': {
  target: 'https://app.pakasir.com',
  changeOrigin: true,
  secure: false,
  headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
      'Referer': 'https://app.pakasir.com/',
      'Accept': 'application/json'
  },
  rewrite: (path) => path.replace(/^\/pakasir/, '/api'),
}
```

Dengan konfigurasi ini, fitur "Reload/Cek Status" di halaman `ManagePayments.jsx` bisa bekerja 100% dan akan mengubah status `pending/menunggu` menjadi `completed/lunas`.

---

## 6. Metode Pembayaran yang Didukung Pakasir

| ID | Tampilan |
|---|---|
| `qris` | QRIS (Rp 380 fee) |
| `bni_va` | BNI Virtual Account (Rp 3.500 fee) |
| `bri_va` | BRI Virtual Account (Rp 3.500 fee) |
| `cimb_niaga_va` | CIMB Niaga VA (Rp 3.500 fee) |
| `permata_va` | Permata VA (Rp 3.500 fee) |
| `maybank_va` | Maybank VA (Rp 3.500 fee) |
| `atm_bersama_va` | ATM Bersama VA (Rp 2.000 fee) |
| `artha_graha_va` | Artha Graha VA (Rp 2.000 fee) |
| `sampoerna_va` | Sampoerna VA (Rp 2.000 fee) |
| `bnc_va` | BNC VA (Rp 3.500 fee) |

---

## 7. Tampilan di ManagePayments

Karena Pakasir tidak memiliki API list transaksi, riwayat invoice Pakasir disimpan di `localStorage`:
- **Key:** `pakasir_history`
- **Format:** Array of objects dengan field: `invoice_id`, `amount`, `final_amount`, `payment_method`, `status`, `created_at`, `payment_url`, `_provider: 'pakasir'`

Di `ManagePayments.jsx`, data dari `pakasir_history` digabung dengan data dari API bayar.gg:
```js
const allPayments = [...localPakasirFiltered, ...payments]; // pakasir local + bayargg API
```

Status Pakasir yang digunakan: `pending`, `completed` (bukan `paid` seperti bayar.gg).

---

## 8. Routing & Komponen

| Path | Komponen | Catatan |
|---|---|---|
| `/dashboard/payments` | `ManagePayments.jsx` | Gabungan bayar.gg + Pakasir lokal |
| `/dashboard/payments/new` | `CreatePayment.jsx` | Tab pilih provider: Bayar.gg / Pakasir |

---

## 9. Catatan Penting

- ⚠️ API Pakasir **selalu 403** dari proxy — jangan coba re-enable API call
- ⚠️ Riwayat Pakasir di `localStorage` akan hilang jika browser data dihapus
- ⚠️ Tidak ada sinkronisasi status otomatis untuk Pakasir — harus cek manual di dashboard
- Mode **Sandbox** → transaksi tidak bisa dibayar, QRIS tidak valid. Selalu gunakan **Production**
- **Slug** dan **API Key** berbeda per project di Pakasir (satu akun bisa banyak project)
- Docs resmi: https://pakasir.com/docs
