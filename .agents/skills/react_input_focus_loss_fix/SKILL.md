---
name: react_input_focus_loss_fix
description: Diagnosa dan perbaiki bug React di mana input field kehilangan focus (blur) setiap kali user mengetik 1 karakter. Penyebabnya adalah komponen yang didefinisikan di dalam komponen lain (inline component definition), menyebabkan React unmount/remount seluruh subtree setiap render.
---

# React Input Focus Loss Bug — Panduan Diagnosa & Fix

## Gejala Bug

- User mengetik 1 huruf di input field → focus hilang (seperti di-klik halaman lain)
- User harus klik input lagi untuk melanjutkan mengetik
- Bug terjadi di semua input dalam satu halaman/layout tertentu
- Bug **tidak terjadi** di halaman lain yang tidak memakai layout/komponen yang sama

## Root Cause

Ini adalah bug klasik React:

> **Komponen yang didefinisikan di dalam komponen lain** dianggap React sebagai **tipe komponen baru setiap kali render**.

Setiap kali state berubah (misalnya user ketik 1 huruf → `setState`) → parent component re-render → komponen inline dianggap tipe baru → React **unmount + remount** seluruh subtree termasuk `<input>` di dalamnya → **focus hilang**.

### Contoh Kode Bermasalah

```jsx
// ❌ SALAH — Field didefinisikan DALAM komponen
const MyForm = () => {
  const [name, setName] = useState('');

  // Setiap render MyForm, React anggap Field sebagai TYPE BARU
  const Field = ({ label, children }) => (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );

  return (
    <Field label="Nama">
      <input value={name} onChange={e => setName(e.target.value)} />
    </Field>
  );
};
```

```jsx
// ✅ BENAR — Field didefinisikan DI LUAR komponen
const Field = ({ label, children }) => (
  <div>
    <label>{label}</label>
    {children}
  </div>
);

const MyForm = () => {
  const [name, setName] = useState('');

  return (
    <Field label="Nama">
      <input value={name} onChange={e => setName(e.target.value)} />
    </Field>
  );
};
```

## Cara Diagnosa

### Langkah 1 — Identifikasi scope bug
- Bug hanya di dashboard admin, bukan di halaman publik? → Cek **layout wrapper** (`AdminLayout`, `DashboardLayout`, dll.)
- Bug hanya di form tertentu? → Cek file halaman form itu langsung

### Langkah 2 — Cari inline component definitions
Gunakan grep/search untuk mencari definisi komponen di dalam komponen lain:

```bash
# Cari semua const Field / const FeatureList / const IconInput yang ada di dalam komponen
grep -rn "const Field = " src/pages/
grep -rn "const IconInput = " src/pages/
grep -rn "const FeatureList = " src/pages/
```

**Tanda bahaya:** Jika `const Field =` ada di **dalam** fungsi komponen (indentasi 2 space ke dalam), itu adalah bug.

Tanda aman: Jika `const Field =` ada di **level atas file** (indentasi 0), itu sudah benar.

### Langkah 3 — Cek layout wrapper
Jika bug terjadi di semua halaman admin, cek apakah layout (`AdminLayout.jsx`) mendefinisikan komponen di dalamnya:

```jsx
// ❌ SALAH — SidebarContent di dalam AdminLayout
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => ( // ← INI MASALAHNYA
    <nav>...</nav>
  );

  return <SidebarContent />;
};
```

```jsx
// ✅ BENAR — SidebarContent di luar AdminLayout, data di-pass via props
const SidebarContent = ({ sidebarOpen, setSidebarOpen, profile }) => (
  <nav>...</nav>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
};
```

## Cara Fix

### Fix sederhana — Pindahkan komponen ke luar

```jsx
// Sebelum (di dalam komponen):
const MyPage = () => {
  const Field = ({ label, children }) => (...); // ❌
  const IconInput = ({ icon, ...props }) => (...); // ❌
  return (...);
};

// Sesudah (di luar komponen):
const Field = ({ label, children }) => (...); // ✅
const IconInput = ({ icon, ...props }) => (...); // ✅

const MyPage = () => {
  return (...);
};
```

### Fix komponen yang butuh akses data parent

Jika komponen inline mengakses state/handler dari parent via closure, ubah ke props:

```jsx
// ❌ SALAH — FeatureList menutup (closure) formData dari parent
const MyForm = () => {
  const [formData, setFormData] = useState({ features: [''] });

  const FeatureList = () => (  // ← mengakses formData via closure
    formData.features.map(f => <input value={f} />)
  );
};

// ✅ BENAR — FeatureList menerima data via props
const FeatureList = ({ features, onChange }) => (
  features.map(f => <input value={f} onChange={onChange} />)
);

const MyForm = () => {
  const [formData, setFormData] = useState({ features: [''] });
  return <FeatureList features={formData.features} onChange={handleChange} />;
};
```

## File yang Pernah Diperbaiki di Proyek Ini

Project: `nineteen-dev` (Krido)

| File | Komponen yang Dipindahkan |
|------|--------------------------|
| `src/components/AdminLayout.jsx` | `SidebarContent` |
| `src/pages/EditProfile.jsx` | `Field`, `IconInput` |
| `src/pages/EditService.jsx` | `Field`, `FeatureList` |
| `src/pages/EditOrder.jsx` | `Field` |
| `src/pages/EditApp.jsx` | `Field` |
| `src/pages/EditPortfolio.jsx` | `Field` |

## Aturan Pencegahan

> **Jangan pernah mendefinisikan komponen React (fungsi yang return JSX) di dalam komponen lain.**

Boleh:
- Helper function yang return string/number/boolean (bukan JSX komponen)
- `useMemo` / `useCallback` untuk memoize value
- Render function seperti `renderItem()` yang langsung di-inline (bukan sebagai komponen `<RenderItem />`)

Tidak boleh:
- `const MyComponent = () => <div>...</div>` di dalam komponen lain
- `function MyComponent() { return <div /> }` di dalam komponen lain
