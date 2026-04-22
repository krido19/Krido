---
name: bayargg_payment
description: >
  Panduan integrasi Payment Gateway bayar.gg ke admin dashboard nineteen-dev.
  Gunakan skill ini saat mengerjakan fitur pembayaran QRIS, GoPay, OVO, atau BRI QRIS
  di halaman admin (ManagePayments, CreatePayment, dll).
---

# Skill: bayar.gg Payment Gateway Integration

## 1. Overview

bayar.gg adalah payment gateway yang mendukung QRIS, GoPay Merchant QRIS, BRI QRIS, dan OVO.
Digunakan di project **nineteen-dev** untuk fitur pembayaran di admin panel.

---

## 2. Konfigurasi

### API Key
Disimpan di `.env`:
```
VITE_BAYARGG_API_KEY=API-acec8c9a29b34ddb1ad15c0b52f344b3dcacb756b016c6b4
```

### Proxy (Wajib — CORS)

> ⚠️ **JANGAN** hit `https://www.bayar.gg/api` langsung dari frontend — kena CORS block.
> Selalu gunakan path `/bayargg` yang sudah dikonfigurasi sebagai proxy.

| Environment | Mapping |
|---|---|
| Dev | Vite proxy `/bayargg` → `https://www.bayar.gg/api` |
| Prod | Vercel rewrite `/bayargg/:path*` → `https://www.bayar.gg/api/:path*` |

**`vite.config.js`:**
```js
'/bayargg': {
  target: 'https://www.bayar.gg',
  changeOrigin: true,
  secure: false,
  rewrite: (path) => path.replace(/^\/bayargg/, '/api'),
}
```

**`vercel.json`** (sebelum SPA catch-all):
```json
{ "source": "/bayargg/:path*", "destination": "https://www.bayar.gg/api/:path*" }
```

**Authentication header:**
```
X-API-Key: <VITE_BAYARGG_API_KEY>
```

---

## 3. Utility Helper

File: `src/utils/bayargg.js`

```js
const BASE_URL = '/bayargg';
const API_KEY  = import.meta.env.VITE_BAYARGG_API_KEY;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok || data.success === false) {
    console.error('[bayargg] API error:', res.status, data);
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
};

export const createPayment = (payload) =>
  fetch(`${BASE_URL}/create-payment.php`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(payload),
  }).then(handleResponse);

export const checkPayment = (invoiceId) =>
  fetch(`${BASE_URL}/check-payment.php?invoice=${encodeURIComponent(invoiceId)}`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const listPayments = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return fetch(`${BASE_URL}/list-payments.php${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  }).then(handleResponse);
};

export const getPaymentMethods = () =>
  fetch(`${BASE_URL}/get-payment-methods.php`, { headers: getHeaders() }).then(handleResponse);
```

---

## 4. Endpoints

### POST `/api/create-payment.php`
Membuat pembayaran baru.

**Payload:**
| Field | Tipe | Keterangan |
|---|---|---|
| `amount` | number | **Required.** Min Rp 1.000. Max Rp 500.000 untuk `qris` |
| `description` | string | Deskripsi pembayaran |
| `customer_name` | string | Nama pelanggan |
| `customer_email` | string | Email pelanggan |
| `customer_phone` | string | No. HP pelanggan |
| `payment_method` | string | `qris` (default), `gopay_qris`, `qris_user`, `ovo` |
| `callback_url` | string | URL webhook saat bayar sukses |
| `redirect_url` | string | URL redirect setelah bayar |

**Response sukses (struktur nyata dari API):**
```json
{
  "success": true,
  "data": {
    "invoice_id": "BAYAR-1776900826-9CC4DE",
    "amount": 50000,
    "unique_code": 326,
    "final_amount": 51326,
    "payment_method": "qris",
    "payment_method_label": "QRIS",
    "status": "pending",
    "expires_at": "2026-04-24 06:33:46",
    "payment_url": "https://www.bayar.gg/pay?invoice=BAYAR-xxx",
    "qris_string": "00020101021126580013ID.CO.BRI...",
    "qris_static_string": "00020101021126580013ID.CO.BRI...",
    "qris_static_image_url": "https://www.bayar.gg/qris-info/api/qr.php?text=...&size=300"
  }
}
```

> ⚠️ **Data ada di `result.data`**, bukan `result.payment`. Selalu normalisasi:
> ```js
> const pay = result.data || result.payment || result;
> ```

---

### GET `/api/check-payment.php?invoice=<id>`
Cek status pembayaran.

**Response:**
```json
{
  "success": true,
  "invoice_id": "BAYAR-xxx",
  "status": "paid",
  "amount": 50000,
  "final_amount": 51326,
  "paid_at": "2026-04-16 12:25:30"
}
```

---

### GET `/api/list-payments.php`
Daftar pembayaran dengan filter & pagination.

**Query params:**
| Param | Keterangan |
|---|---|
| `status` | `pending`, `paid`, `expired`, `cancelled` |
| `payment_method` | `qris`, `gopay_qris`, `qris_user`, `ovo` |
| `search` | Cari invoice, nama customer, email, HP |
| `start_date` | Format `YYYY-MM-DD` |
| `end_date` | Format `YYYY-MM-DD` |
| `page` | Default: 1 |
| `limit` | Default: 20, max: 100 |

---

### GET `/api/get-payment-methods.php`
Daftar metode yang tersedia + status subscription.

**Response:**
```json
{
  "success": true,
  "methods": [
    {"id": "qris", "name": "QRIS", "available": true},
    {"id": "gopay_qris", "name": "GoPay QRIS", "available": true}
  ],
  "user_status": {"has_active_subscription": true}
}
```
> Cek `user_status.has_active_subscription` sebelum enable form & tampilkan metode premium.

---

## 5. Normalisasi Response & Akses Data

Setelah `createPayment`, **selalu normalisasi** response sebelum digunakan di UI:

```js
const pay = result.data || result.payment || result; // data ada di result.data

const invoiceId     = pay.invoice_id;
const amount        = pay.amount;
const finalAmount   = pay.final_amount ?? pay.amount;  // termasuk unique_code
const uniqueCode    = pay.unique_code;
const paymentMethod = pay.payment_method;
const expiresAt     = pay.expires_at;
const paymentUrl    = pay.payment_url;

// QR Code fields (tersedia di response QRIS):
const qrisString    = pay.qris_string || pay.qris_static_string || null;
// qris_static_image_url juga tersedia tapi JANGAN load sebagai <img> — kena CORS
```

---

## 6. Menampilkan QR Code QRIS

> ⚠️ **JANGAN** load `qris_static_image_url` sebagai `<img src={...}>` — URL dari domain bayar.gg akan diblokir CORS oleh browser.

**Solusi yang benar:** encode `qris_string` secara lokal menggunakan library `qrcode.react`.

**Install:**
```bash
npm install qrcode.react
```

**Pola lengkap di React:**
```jsx
import { QRCodeSVG } from 'qrcode.react';

// Setelah createPayment berhasil dan result di-set ke state:
const pay        = result.data || result.payment || result;
const paymentUrl = pay.payment_url;
const qrisString = pay.qris_string || pay.qris_static_string || null;

// Render — gunakan qris_string (QRIS standard), fallback ke payment_url
{(qrisString || paymentUrl) && (
  <div className="flex flex-col items-center">
    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
      Scan QR untuk Bayar
    </p>
    <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
      <QRCodeSVG
        value={qrisString || paymentUrl}
        size={200}
        bgColor="#ffffff"
        fgColor="#111827"
        level="M"
        includeMargin={false}
      />
    </div>
  </div>
)}
```

**Mengapa `qris_string` lebih baik dari `payment_url`:**
- `qris_string` adalah QRIS standard EMV — bisa dibaca oleh semua app mobile banking & dompet digital
- `payment_url` hanya membuka halaman web bayar.gg, tidak bisa dibaca scanner QRIS native

---

## 7. Metode Pembayaran

| Metode | ID | Limit | Keterangan |
|---|---|---|---|
| QRIS (default) | `qris` | Maks Rp 500.000 | Butuh subscription aktif |
| GoPay Merchant QRIS | `gopay_qris` | Tanpa limit | Butuh subscription + akun GoPay terhubung |
| BRI Merchant QRIS | `qris_user` | Tanpa limit | Butuh subscription + konfigurasi BRI API |
| OVO | `ovo` | — | Butuh subscription + akun OVO terhubung |

---

## 8. Status Pembayaran

| Status | Label | Warna CSS |
|---|---|---|
| `pending` | Menunggu | `bg-amber-50 text-amber-700` |
| `paid` | Lunas | `bg-emerald-50 text-emerald-700` |
| `expired` | Kadaluarsa | `bg-gray-100 text-gray-600` |
| `cancelled` | Dibatalkan | `bg-red-50 text-red-600` |

---

## 9. Routing Admin

| Path | Komponen | Fungsi |
|---|---|---|
| `/dashboard/payments` | `ManagePayments.jsx` | List semua payment |
| `/dashboard/payments/new` | `CreatePayment.jsx` | Form buat payment baru |

> Menu **Payments** ada di sidebar `AdminLayout.jsx` dengan icon `CreditCard`.

---

## 10. Error Codes

| HTTP | Kondisi | Keterangan |
|---|---|---|
| 400 | Parameter tidak valid | Termasuk: metode tidak tersedia, syarat tidak terpenuhi |
| 400 | `Metode pembayaran tidak tersedia...` | **Subscription belum aktif** — aktifkan di dashboard bayar.gg |
| 401 | Unauthorized | API Key salah / tidak ada |
| 404 | Not Found | Resource tidak ditemukan |
| 429 | Rate limit | Terlalu banyak request |
| 500 | Internal Server Error | Error di sisi bayar.gg |

---

## 11. Catatan Penting

- ⚠️ Semua request **wajib lewat proxy** `/bayargg` — jangan hit bayar.gg langsung (CORS)
- ⚠️ API Key **jangan hardcode** — selalu `import.meta.env.VITE_BAYARGG_API_KEY`
- ⚠️ `qris_static_image_url` **jangan** di-load sebagai `<img>` — encode `qris_string` secara lokal
- **Subscription wajib aktif** untuk semua `createPayment`, termasuk `qris` dasar
- Untuk nominal > Rp 500.000, **wajib** gunakan `gopay_qris` atau `qris_user`
- Data response ada di **`result.data`** (bukan `result.payment`)
- `final_amount` = `amount` + `unique_code` — tampilkan `final_amount` ke customer
- Setelah ubah `vite.config.js`, **wajib restart dev server** agar proxy aktif
- Skill ini diperbarui berkala sesuai perkembangan fitur payment di project ini
