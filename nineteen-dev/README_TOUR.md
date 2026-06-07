# Panduan Interaktif (Tour Feature) 🗺️

Sistem panduan interaktif ini menggunakan pustaka **`react-joyride`** untuk memberikan pengalaman *onboarding* yang profesional bagi admin.

---

## Apa itu React Joyride?

React Joyride memungkinkan kita membuat tur (*tour*) langkah-demi-langkah yang menyorot elemen tertentu di halaman. Saat sebuah elemen disorot:

- Elemen tersebut akan tampak terang (muncul di atas layar).
- Sisa layar lainnya akan **digelapkan** (efek *spotlight*).
- Muncul kotak penjelasan (tooltip) di sebelah elemen tersebut yang berisi teks panduan, serta tombol `Lanjut`, `Kembali`, dan `Lewati`.

---

## Implementasi Saat Ini

### File Utama
Tour saat ini diimplementasikan di:
```
src/components/AdminLayout.jsx
```

### Cara Import (PENTING ⚠️)
`react-joyride` **tidak menggunakan default export**. Gunakan **named export**:

```javascript
// ✅ BENAR — named import
import { Joyride, STATUS } from 'react-joyride';

// ❌ SALAH — akan error "does not provide an export named 'default'"
import Joyride from 'react-joyride';
```

### Cara Tour Dipanggil Otomatis

Tour muncul **otomatis setelah login**, menggunakan `sessionStorage` dengan delay 1000ms:

```javascript
useEffect(() => {
  // sessionStorage otomatis terhapus saat browser/tab ditutup
  // PLUS: dihapus manual di handleLogout() saat user Sign Out
  // Artinya: tour muncul setiap kali user login baru (baik buka browser baru maupun logout-login)
  if (!sessionStorage.getItem('adminTourShown')) {
    const timer = setTimeout(() => {
      setRunTour(true);
      sessionStorage.setItem('adminTourShown', 'true');
    }, 1000); // delay 1000ms agar sidebar lazy-loaded sempat render
    return () => clearTimeout(timer);
  }
}, []);
```

**Kapan tour muncul:**
- ✅ Buka browser / tab baru → login → tour muncul
- ✅ Logout (klik Sign Out) → login lagi → tour muncul
- ❌ Navigasi antar halaman admin → tour **tidak** muncul lagi (flag masih aktif di sesi)

**Kenapa `sessionStorage` bukan `localStorage`?**
- `localStorage` → tersimpan selamanya → tour tidak pernah muncul lagi setelah pertama kali.
- `sessionStorage` → terhapus saat tab/browser ditutup → lebih ringan.
- Ditambah `sessionStorage.removeItem('adminTourShown')` di `handleLogout()` → tour muncul setiap logout+login meski di tab yang sama.

### Arsitektur "Pilih Sendiri Petualanganmu" (Interactive Hub)
Tour saat ini memandu navigasi sidebar menggunakan arsitektur **Hub-and-Spoke** yang super kompleks, bukan sekadar urutan linear biasa:

1. **Step 0 (Pusat Kendali / Hub)**:
   - Target: `body` (Muncul di tengah layar).
   - Menyediakan 8 tombol interaktif untuk setiap modul menu.
   - Properti `hideFooter: true` digunakan agar user harus mengklik tombol kustom untuk berpindah, mem-bypass tombol Next/Skip bawaan Joyride.

2. **Step 1 - 8 (Detail Modul)**:
   - Melompat menggunakan manipulasi state `stepIndex`.
   - Menggunakan konten berformat **JSX (HTML-nya React)** super detail:
     - Termasuk format teks (`<strong>`, `<em>`).
     - *Bullet points* (`<ul>`, `<li>`) yang menjelaskan fungsionalitas kompleks tiap menu.
     - Lencana status (badge) berwarna.
     - Kotak "Tips" spesial dengan *background* berwarna.
   - Setiap kotak panduan detail memiliki tombol kustom `<BackToHubButton>` (`← Kembali ke Pilihan Menu`) yang mereset `stepIndex(0)` sehingga user kembali ke Menu Utama.

**Struktur Data Steps:**
| Index | Target ID        | Fitur & Kompleksitas JSX                            |
|-------|------------------|-----------------------------------------------------|
| `0`   | `body` (Center)  | Hub interaktif 8 tombol, tanpa *footer* bawaan      |
| `1`   | `#menu-dashboard`| Menjelaskan grafik & aktivitas *real-time*          |
| `2`   | `#menu-profile`  | Update foto, tautan CV, bio, dan tips SEO profil    |
| `3`   | `#menu-portfolio`| Aturan unggah gambar resolusi tinggi & studi kasus  |
| `4`   | `#menu-activities`| Info sistem *audit trail* (jejak login admin)      |
| `5`   | `#menu-apps`     | Kelola produk digital, link unduh, & lisensi        |
| `6`   | `#menu-services` | Setup paket layanan (Basic/Pro) & status ketersediaan|
| `7`   | `#menu-orders`   | Lencana warna status "Pending" hingga "Selesai"     |
| `8`   | `#menu-payments` | Konfirmasi transfer manual, anti penipuan, mutasi   |

### Bagaimana ID Menu Di-generate?

ID menu dibuat otomatis di `navItems` menggunakan pola `menu-{label.toLowerCase()}`:

```jsx
// Di SidebarContent component:
<Link
  id={`menu-${label.toLowerCase()}`}  // → "menu-dashboard", "menu-portfolio", dst.
  to={to}
  ...
>
```

---

## Cara Menambahkan Tour di Halaman Lain

Mulai Juni 2026, kita telah melakukan **refactoring** untuk memusatkan logika Joyride. Anda **TIDAK PERLU LAGI** mengulangi konfigurasi rumit di setiap halaman. Cukup gunakan Custom Hook `useTour` dan komponen wrapper `AppJoyride`.

### 1. Tambahkan ID pada Elemen Target

```jsx
// ManagePortfolio.jsx
<button id="add-portfolio-btn" className="...">
  Add New Portfolio
</button>

<div id="portfolio-table">
  {/* Isi tabel portfolio */}
</div>
```

### 2. Gunakan Custom Hook & Wrapper di Komponen Anda

```javascript
import React, { useState, useEffect } from 'react';
import AppJoyride from '../components/AppJoyride';
import { useTour } from '../hooks/useTour';

const ManagePortfolio = () => {
  const [loading, setLoading] = useState(true);

  // PENTING: Gunakan useTour('nama_modul', !loading)
  // Argumen 1: 'portfolio' (prefix untuk nama key di localStorage/sessionStorage)
  // Argumen 2: isReady (boolean) — memastikan tour otomatis TIDAK JALAN sebelum loading selesai!
  const { runTour, startTour, handleJoyrideCallback } = useTour('portfolio', !loading);

  const portfolioSteps = [
    { target: '#add-portfolio-btn', title: '➕ Tambah', content: 'Klik di sini.', disableBeacon: true, placement: 'bottom' },
    { target: '#portfolio-table', title: '📋 Daftar', content: 'Lihat daftar portofolio.', disableBeacon: true, placement: 'top' },
  ];

  // (Contoh untuk halaman Form / Edit yang dipicu manual via tombol, Anda bisa menggunakan `startTour`)
  // <button onClick={startTour}>Panduan Form</button>

  return (
    <>
      <AppJoyride
        steps={portfolioSteps}
        run={runTour}
        callback={handleJoyrideCallback}
      />
      {/* ...sisa JSX halaman... */}
    </>
  );
};
```

**Keuntungan pendekatan baru ini:**
- Anda tidak perlu menulis fungsi callback `STATUS.FINISHED` secara berulang.
- Anda tidak perlu menulis komponen `AutoClickBeacon` atau konfigurasi CSS/Tooltip di setiap halaman.
- Semua konfigurasi `react-joyride` terpusat di `AppJoyride.jsx`.
- Penyimpanan state ke `sessionStorage` (untuk autostart) dan `localStorage` (agar tidak terus diulang) dikelola rapi di `useTour.js`.

---

## Konfigurasi Joyride yang Digunakan

| Prop              | Nilai   | Keterangan                                          |
|-------------------|---------|-----------------------------------------------------|
| `continuous`      | `true`  | Tombol "Lanjut" untuk navigasi antar step           |
| `showSkipButton`  | `true`  | Tampilkan tombol "Lewati" untuk skip tour           |
| `showProgress`    | `true`  | Tampilkan indikator "1 / 6" di tooltip              |
| `disableScrolling`| `true`  | Tidak auto-scroll saat pindah step (sidebar fix)    |
| `spotlightClicks` | `false` | Klik di area spotlight tidak menutup tour           |
| `primaryColor`    | `#06b6d4` | Warna tombol (sesuai warna `primary` tema)        |
| `zIndex`          | `10000` | Pastikan tour muncul di atas semua elemen lain      |
| beacon (semua)    | `display: none` | Titik hitam/beacon dimatikan agar tidak mengganggu |

---

## Troubleshooting

### ❌ Tour tidak muncul setelah login
- Pastikan `sessionStorage.removeItem('adminTourShown')` atau buka tab browser baru.
- Jika masih gagal, periksa apakah elemen target (`#menu-dashboard`, dll.) sudah ter-render di DOM sebelum tour dijalankan. Naikkan delay jika perlu.

### ❌ Error: "does not provide an export named 'default'"
- Gunakan `import { Joyride, STATUS } from 'react-joyride'` (named import, bukan default import).

### ❌ Tour muncul tapi nyangkut "muter-muter" (Loading tiada akhir)
- **Penyebab**: Terjadi duplikasi ID di DOM (misal Anda merender *Sidebar Desktop* dan *Sidebar Mobile* sekaligus, di mana keduanya memiliki `<a id="menu-dashboard">`). Joyride kebingungan dan memilih elemen pertama yang mungkin sedang `display: none`.
- **Solusi**: Pisahkan ID antara versi desktop dan mobile dengan memberikan *prefix* unik, lalu pastikan target Joyride tertuju pada elemen yang sedang *visible*. (Contoh: Desktop pakai `id="menu-dashboard"`, Mobile pakai `id="mobile-menu-dashboard"`).

### ❌ Titik hitam (beacon) membandel dan tidak mau hilang (Tour tidak otomatis jalan)
- **Penyebab**: Joyride terkadang mengabaikan `disableBeacon: true` pada langkah tertentu, atau jika disembunyikan menggunakan CSS `display: none`, tour malah *nyangkut* menunggu beacon tersebut diklik secara manual.
- **Solusi Paling Ampuh**: Buat komponen `beaconComponent` kustom yang berwujud elemen transparan dan **secara otomatis mengklik dirinya sendiri** saat ter-render.
  
  **Cara Implementasi:**
  ```jsx
  // 1. Buat komponen rahasia (gunakan span untuk mencegah warning HTML <button> dalam <button>)
  const AutoClickBeacon = React.forwardRef((props, ref) => {
    const localRef = React.useRef(null);
    const combinedRef = ref || localRef;
    
    React.useEffect(() => {
      if (combinedRef?.current) combinedRef.current.click();
    }, [combinedRef]);

    // Ekstrak props bawaan Joyride agar tidak bocor dan memicu warning DOM React
    const { continuous, index, isLastStep, size, step, ...domProps } = props;

    return (
      <span 
        ref={combinedRef} 
        {...domProps} 
        style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} 
      />
    );
  });

  // 2. Pasangkan ke Joyride
  <Joyride
    beaconComponent={AutoClickBeacon}
    // ...props lainnya
  />
  ```

### ❌ Tour Cross-Page (Lintas Halaman) Error "404 Page Not Found"
- **Penyebab**: Terjadi salah ketik (*typo*) pada pemanggilan `navigate('/rute')` di dalam aksi tombol. Misalnya, rute yang terdaftar di `App.jsx` adalah `/profile`, namun `navigate` dipanggil dengan `/dashboard/profile`.
- **Solusi**: Selalu periksa daftar `<Route path="...">` di dalam `App.jsx`. Pastikan fungsi `navigate()` pada *tour hub* mengarah tepat ke *path* yang dideklarasikan tersebut.

### ❌ Klik "Lanjut" (Next) tapi sisa panduan malah hilang / eror
- **Penyebab**: Anda menggunakan *controlled mode* (`stepIndex` dikendalikan secara manual) dengan fungsi *updater* React seperti `setStepIndex((prev) => prev + 1)`. Pada React 18 dengan `StrictMode`, *updater* ini dijalankan dua kali secara beruntun (*double invocation*), sehingga `stepIndex` melompat +2 (misal dari langkah 9 langsung ke langkah 11) dan gagal menemukan elemen target jika belum *render*.
- **Solusi**: Gunakan indeks absolut (`index`) bawaan dari parameter *callback* Joyride ketimbang fungsi *updater* `prev`.
  ```javascript
  const handleJoyrideCallback = (data) => {
    const { type, action, index } = data;
    if (type === 'step:after') {
      if (action === 'next') setStepIndex(index + 1); // BENAR
      // JANGAN GUNAKAN: setStepIndex((prev) => prev + 1); // SALAH (terpengaruh StrictMode)
    }
  };
  ```

### ❌ Tour muncul tapi elemen tidak ditemukan (target not found)
- Pastikan ID elemen sudah tepat dan elemen sudah ada di DOM.
- Cek apakah ada typo (misal `#menu-Portfolio` seharusnya `#menu-portfolio` — semua lowercase).

### ❌ Layar menjadi gelap (blur) setelah klik "Lanjut" tapi tooltip tidak muncul
- **Penyebab**: Joyride berhasil menemukan elemen, namun **gagal men-scroll** ke posisinya secara sinkron. Ini hampir selalu disebabkan oleh salah satu (atau kedua) hal berikut:
  1. **Konflik CSS Global**: Anda memiliki `scroll-behavior: smooth;` di elemen `html` atau `body` pada file `index.css`. Animasi *smooth scroll* bawaan browser membuat Joyride salah mengukur posisi elemen karena elemen masih bergerak saat *spotlight* digambar.
  2. **Layout Flex**: Anda menaruh Joyride di dalam layout berbasis `flex` (`flex-1`), sehingga algoritma pendeteksi *scroll parent* Joyride salah mengira sebuah div sebagai scroll container padahal tidak memiliki `overflow`.
- **Solusi Paling Andal**:
  1. **HAPUS** `scroll-behavior: smooth;` dari file CSS global (`index.css`). Ini wajib karena Joyride punya animasi scroll-nya sendiri.
  2. Biarkan Joyride yang mengurus scroll dengan `disableScrolling={false}`.
  3. Tambahkan **`disableScrollParentFix={true}`** pada komponen Joyride. Ini akan memaksa Joyride mengabaikan pengecekan parent yang rumit dan langsung menggunakan `window` sebagai *scroll container*.
  ```jsx
  <Joyride
    disableScrolling={false}
    disableScrollParentFix={true} // WAJIB untuk layout flex Tailwind!
    // ... props lainnya
  />
  ```

### ❌ Layar gelap total tanpa spotlight sama sekali, atau elemen terhighlight tapi tour nyangkut
- **Penyebab**: Ada **dua komponen Joyride yang berjalan bersamaan**. Biasanya ini terjadi jika komponen Layout (yang punya tour sendiri) me-remount dan menjalankan timernya lagi saat halaman anak (yang juga punya tour lokal) sedang berjalan.
- **Solusi**: 
  1. Selalu gunakan `sessionStorage` guard di komponen yang memicu tour otomatis agar timer hanya jalan sekali per sesi.
  2. Saat men-trigger tour lintas halaman dari Hub, pastikan Anda men-set flag selesai untuk tour Hub agar timernya tidak me-restart saat navigasi:
  ```javascript
  // Saat klik tombol menuju halaman Profile di Hub:
  sessionStorage.setItem('adminTourShown', 'true'); // Blokir tour Hub
  sessionStorage.setItem('profileTourPending', 'true'); // Trigger tour Profile
  navigate('/profile');
  ```
  Jangan lupa menghapus flag tersebut di fungsi `handleLogout`.


### ❌ `SyntaxError: does not provide an export named 'default'` saat import Joyride
- **Penyebab**: Menulis `import Joyride from 'react-joyride'` (default import). Paket `react-joyride` **tidak memiliki default export**.
- **Solusi**: Selalu gunakan *named import*:
  ```javascript
  // ❌ SALAH
  import Joyride from 'react-joyride';

  // ✅ BENAR
  import { Joyride, STATUS } from 'react-joyride';
  ```

---

## 🔴 Catatan Kegagalan Aktif — Sesi 2026-06-07 (BELUM TERPECAHKAN)

> **Status**: Tour halaman `EditProfile.jsx` (step ke-2: sorot form "Informasi Dasar") **masih gagal** sampai akhir sesi ini. Semua percobaan di bawah sudah dilakukan dan **tidak berhasil**. Jangan ulangi langkah-langkah ini sebelum ada pendekatan baru yang berbeda.

### Konteks Masalah
- Tour dijalankan di `EditProfile.jsx` (tour lokal, bukan AdminLayout).
- **Step 1** (sorot area foto profil, `#tour-profile-avatar`): ✅ Berhasil — elemen tersorot dengan benar.
- **Step 2** (sorot form "Informasi Dasar", `#tour-profile-basic`): ❌ Gagal — setelah klik "Lanjut", seluruh layar menjadi gelap (blur) tanpa spotlight dan tanpa tooltip.

---

### ❌ Percobaan Gagal #1 — Scroll Manual dengan `window.scrollTo`
- **Yang dilakukan**: Menambahkan kode scroll manual di callback Joyride sebelum step berpindah:
  ```javascript
  if (type === 'step:after' && action === 'next') {
    const el = document.querySelector(steps[index + 1]?.target);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'instant' });
    }
    setProfileStepIndex(index + 1);
  }
  ```
- **Hasil**: ❌ Gagal. Kode scroll manual bentrok dengan mekanisme scroll internal Joyride. Layar tetap blur.

---

### ❌ Percobaan Gagal #2 — `disableScrollParentFix={true}`
- **Yang dilakukan**: Menambahkan prop `disableScrollParentFix={true}` pada komponen `<Joyride>` di `EditProfile.jsx`.
- **Alasan dicoba**: Supaya Joyride mengabaikan deteksi scroll parent yang salah (karena layout `flex-1`) dan langsung gunakan `window`.
- **Hasil**: ❌ Tetap gagal. Layar masih blur total setelah klik "Lanjut".

---

### ❌ Percobaan Gagal #3 — Menghapus `scroll-behavior: smooth` dari `index.css`
- **Yang dilakukan**: Menghapus baris `scroll-behavior: smooth;` dari selector `html` di file `src/index.css`.
- **Alasan dicoba**: `scroll-behavior: smooth` dari CSS global diduga menyebabkan Joyride mengukur koordinat elemen saat masih bergerak (animasi), sehingga spotlight digambar di posisi yang salah.
- **Hasil**: ❌ Tetap gagal setelah refresh. Perilaku tidak berubah sama sekali.

---

### ❌ Percobaan Gagal #4 — Kombinasi `disableScrollParentFix={true}` + Hapus `scroll-behavior: smooth`
- **Yang dilakukan**: Kedua perbaikan di atas (#2 dan #3) diterapkan **bersamaan**.
- **Hasil**: ❌ Masih gagal. Layar blur total, tidak ada spotlight maupun tooltip yang muncul.

---

### 🔍 Temuan Debug Penting (Dari Console Browser)

**Percobaan pertama** — Saat elemen masih bisa ditemukan, posisinya sudah jauh di bawah layar:
```
Element: <div id="tour-profile-basic" class="bg-white rounded-lg p-6">
BoundingRect: DOMRect { x: 272, y: 406, width: 768, height: 512, top: 406, ... }
offsetTop: 406
window.scrollY: 0
window.innerHeight: 822
```
→ Elemen ada di `y: 406`, layar tinggi `822px`. Sebenarnya masih dalam viewport. Tapi Joyride tetap gagal.

**Percobaan berikutnya** — Setelah beberapa kali percobaan, elemen malah hilang dari DOM:
```
Element: null
BoundingRect: undefined
offsetTop: undefined
window.scrollY: 0
window.innerHeight: 822
```
→ `document.querySelector('#tour-profile-basic')` mengembalikan `null` saat tour step 2 sedang berjalan. **Ini indikasi kuat bahwa elemen target tidak ada di DOM saat Joyride mencoba menemukannya.**

**Log callback `[Joyride Profile]` tidak pernah muncul** — Meskipun `console.log('[Joyride Profile]', data)` sudah ditambahkan ke callback, log ini tidak pernah muncul di console. Ini menandakan kemungkinan:
1. Komponen `<Joyride>` tidak me-render/mount dengan benar, atau
2. Klik "Lanjut" pada step 1 justru memicu callback dari Joyride **lain** (misal dari AdminLayout), bukan dari `EditProfile.jsx`.

---

### 🧩 Hipotesis yang Belum Diuji (Untuk Sesi Berikutnya)

1. **Dua Joyride aktif bersamaan**: Meskipun `sessionStorage guard` sudah ada di AdminLayout, ada kemungkinan `AdminLayout.jsx` me-remount dan me-restart timer saat navigasi ke `/profile`. Perlu verifikasi apakah `AdminLayout mounted` muncul lebih dari sekali di console saat di halaman EditProfile.
   - **Bukti**: Log `AdminLayout.jsx:350 [Tour] AdminLayout mounted, starting tour timer...` muncul **4 kali berturut-turut** di console, padahal seharusnya hanya 1 kali.

2. **Elemen `#tour-profile-basic` di-unmount saat step berpindah**: Ada kemungkinan state change dari step 1 ke step 2 menyebabkan re-render yang men-unmount dan remount elemen tersebut, sehingga ada jeda di mana elemen tidak ada di DOM.

3. **Flag `adminTourShown` perlu di-set lebih awal**: Saat navigasi dari hub AdminLayout ke halaman Profile, flag perlu di-set `true` agar timer AdminLayout benar-benar tidak berjalan ulang.

4. **Coba `disableScrolling={true}` + scroll manual yang lebih presisi**: Daripada membiarkan Joyride yang scroll, matikan sepenuhnya dan handle scroll secara manual di `step:before` event (bukan `step:after`).

5. **Cek apakah `#tour-profile-basic` ada di DOM** tepat sebelum `runProfileTour` di-set `true` — gunakan `MutationObserver` atau delay lebih panjang.

---

### 🔄 Percobaan #5 — Trigger tour via `useEffect` dengan DOM Verification (2026-06-07, SEDANG DIUJI)
- **Masalah sebelumnya**: Trigger tour di dalam `finally {}` blok async memiliki race condition — `setLoading(false)` dipanggil, tapi React belum commit perubahan DOM, sehingga `#tour-profile-basic` belum ada saat Joyride mencoba menemukannya.
- **Yang dilakukan (dua perubahan bersamaan)**:

  **Perubahan 1 — `EditProfile.jsx`**: Memindahkan logika trigger tour dari dalam `finally {}` ke `useEffect` dengan dependency `[loading]`:
  ```javascript
  useEffect(() => {
    if (!loading && sessionStorage.getItem('profileTourPending') === 'true') {
      sessionStorage.removeItem('profileTourPending');
      // DOM verification loop — retry 300ms jika elemen belum ada
      const checkAndStart = () => {
        const avatarEl = document.querySelector('#tour-profile-avatar');
        const basicEl = document.querySelector('#tour-profile-basic');
        if (avatarEl && basicEl) {
          setProfileStepIndex(0);
          setRunProfileTour(true);
        } else {
          setTimeout(checkAndStart, 300); // retry
        }
      };
      setTimeout(checkAndStart, 500);
    }
  }, [loading]);
  ```
  **Kenapa lebih baik**: React menjamin `useEffect` dijalankan SETELAH DOM dicommit, tidak seperti kode di dalam `finally {}` async yang dijalankan sebelum React commit.

  **Perubahan 2 — `AdminLayout.jsx`**: Menambahkan guard `isLocalTourPage` untuk memastikan Joyride AdminLayout benar-benar mati saat berada di halaman dengan tour lokal:
  ```javascript
  const isLocalTourPage = ['/profile', '/portfolio'].includes(location.pathname);
  // ...
  <Joyride run={runTour && !isLocalTourPage} ... />
  ```
  **Kenapa perlu**: Ini adalah guard lapis kedua. Guard pertama (sessionStorage `adminTourShown`) bisa bypass jika AdminLayout remount. Guard ini bersifat *reaktif* — langsung berubah saat URL berubah ke `/profile`.

- **Status**: ❌ GAGAL — tour berhasil di-trigger (`setRunProfileTour(true)` dipanggil, kedua elemen ada di DOM), tapi Joyride UI **tidak pernah muncul**. Tidak ada satupun log `[Joyride Profile]` dari callback meskipun `run=true`.
- **Log yang diharapkan di console**: `[Tour EditProfile] loading selesai, DOM sudah commit — akan trigger tour dalam 500ms` diikuti `[Tour EditProfile] Tour dimulai! Kedua target sudah ada di DOM.`
- **Log yang sebenarnya muncul**: Kedua log di atas memang muncul ✅, tapi TIDAK ADA log `[Joyride Profile]` sama sekali ❌. Joyride tidak bereaksi.
- **Hasil**: ❌ Gagal. Penyebab belum teridentifikasi — Joyride menerima `run=true` tapi tidak merender UI-nya.

---

### 🔄 Percobaan #6 — Isolasi dengan target `body` + DOM Overlay Check + Manual Button (2026-06-07, SEDANG DIUJI)
- **Hipotesis**: Bisa jadi masalahnya ada pada spesifik target `#tour-profile-avatar` (bukan Joyride-nya). Dengan mengganti step pertama ke `target: 'body'` (placement center), kita bisa tahu apakah Joyride **sama sekali tidak merender**, atau hanya gagal untuk target elemen spesifik.
- **Yang dilakukan**:
  1. **Step baru index 0** dengan `target: 'body'` dan `placement: 'center'` — ini adalah konfigurasi paling dasar yang PASTI berhasil jika Joyride berfungsi.
  2. **useEffect monitor** `runProfileTour` yang mengecek keberadaan `.react-joyride__overlay`, `.react-joyride__tooltip`, `.react-joyride__spotlight` di DOM 300ms setelah `run=true`.
  3. **Tombol debug `🧪 Test Tour`** di header halaman — bisa trigger tour manual TANPA harus navigasi dari Hub, menghilangkan variabel AdminLayout dari persamaan.
- **Log yang diharapkan**:
  ```
  [Tour DEBUG] runProfileTour = true | profileStepIndex = 0
  [Tour DEBUG] Joyride DOM check: { overlay: 'ADA ✅', tooltip: 'ADA ✅', spotlight: 'ADA ✅' }
  [Joyride Profile] { type: 'step:before', ... }
  ```
- **Jika overlay tidak ada di DOM** → Joyride tidak merender sama sekali (kemungkinan ada error di JS atau komponen tidak mount).
- **Jika overlay ada tapi tidak terlihat** → masalah CSS/z-index (ada parent yang meng-clip atau menutupi).
- **Hasil**: ✅ **SEBAGIAN BERHASIL** — Log konfirmasi:
  ```
  [Tour DEBUG] runProfileTour = true | profileStepIndex = 0
  [Tour DEBUG] Joyride DOM check: {overlay: 'ADA ✅', tooltip: 'ADA ✅', spotlight: 'ADA ✅'}
  ```
  Joyride **memang merender** overlay, tooltip, dan spotlight ke DOM! Ini membuktikan Joyride komponen berfungsi dengan benar. Masalah bukan di level "Joyride tidak jalan", tapi di level **"UI tidak terlihat/terinteraksi oleh user"**. Kemungkinan: layar gelap + tooltip putih muncul tapi user tidak sadar bahwa itu adalah tampilan yang benar untuk `target: 'body'` (seluruh layar gelap = normal karena body = semua halaman).

---

### ✅ SOLUSI FINAL (BERHASIL) — Mode Bebas Kendali (Uncontrolled Mode)
- **Akar Masalah**: Kita sebelumnya memaksa React mengontrol langkah tour menggunakan prop `stepIndex={state}` (Controlled Mode). Meskipun mode ini wajib dipakai di `AdminLayout` karena ada *Hub* yang bisa melompat-lompat antar langkah secara non-linear, mode ini ternyata **sangat fatal** jika dipakai untuk tour linear (seperti di halaman `EditProfile`). Interaksi antara re-render state React dan internal state Joyride menyebabkan event klik pada tombol "Lanjut" sama sekali tidak mendaftarkan *callback*, sehingga UI menjadi *nyangkut*.
- **Penyelesaian**: 
  1. Hapus prop `stepIndex={...}` dari komponen `<Joyride>`.
  2. Hapus seluruh pemanggilan fungsi *setter* state (contoh: `setProfileStepIndex(index + 1)`) dari dalam fungsi *callback*.
  3. Membiarkan `<Joyride>` berjalan sepenuhnya secara *Uncontrolled*. Joyride akan mengurus navigasi antar-langkahnya sendiri secara internal.
- **Kesimpulan Emas**: Gunakan **Controlled Mode** (`stepIndex`) HANYA JIKA Anda butuh *Hub* interaktif atau tombol melompat langkah (seperti di `AdminLayout`). Untuk tour linear berurutan biasa di halaman lain, **selalu gunakan Uncontrolled Mode**.
