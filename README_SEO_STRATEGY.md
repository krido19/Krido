# 🚀 Strategi SEO & Person Schema untuk Website Portofolio

Dokumen ini berisi panduan lengkap strategi SEO dan referensi Schema Markup yang diterapkan pada website ini.

## 🤵 Penerapan Person Schema Markup

Schema Markup ini memberi tahu Google bahwa halaman ini adalah tentang Anda sebagai individu profesional. Ini membantu memunculkan Knowledge Panel dan meningkatkan relevansi pencarian nama.

### Struktur JSON-LD (Referensi)
Berikut adalah struktur yang direkomendasikan dan telah diadaptasi ke dalam kode (`src/pages/Home.jsx`):

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Krido Bahtiar",
  "url": "https://kridobahtiar.my.id/",
  "jobTitle": "Frontend Developer",
  "alumniOf": "Nama Universitas/Pendidikan Anda", 
  "worksFor": {
    "@type": "Organization",
    "name": "Freelance"
  },
  "knowsAbout": ["Next.js", "React", "JavaScript", "Tailwind CSS", "Web Development"],
  "sameAs": [
    "https://www.linkedin.com/in/profileanda",
    "https://github.com/profileanda",
    "https://twitter.com/profileanda"
  ],
  "image": "https://kridobahtiar.my.id/foto-profil-anda.jpg",
  "description": "Frontend Developer spesialis Next.js, React, dan modern web development."
}
```

### Penjelasan Properti Kunci
| Properti | Deskripsi | Pentingnya untuk Portofolio |
|---|---|---|
| `@type: "Person"` | Mendefinisikan entitas ini sebagai individu. | Wajib |
| `name` | Nama lengkap Anda. | Wajib |
| `url` | URL kanonis dari halaman portofolio. | Wajib |
| `jobTitle` | Peran profesional utama (e.g., Frontend Developer). | Penting untuk SEO keahlian. |
| `worksFor` | Status pekerjaan (Freelance/Perusahaan). | Menambah kredibilitas. |
| `knowsAbout` | Daftar keahlian teknis. | Menguatkan kata kunci keahlian. |
| `sameAs` | Tautan ke profil sosial/profesional. | Meningkatkan brand authority. |
| `image` | URL foto profil. | Identifikasi visual oleh Google. |

---

## 🚀 Strategi SEO Website Portofolio

Fokus utama adalah **Personal Branding** dan **Kata Kunci Keahlian**.

### 1. 🎯 Fokus Kata Kunci (Keyword Strategy)
Targetkan audiens yang mencari jasa atau profil Anda.
*   **Target Utama**: Nama Anda ("Krido Bahtiar portofolio", "Krido Bahtiar developer").
*   **Target Keahlian**: "Frontend Developer", "Next.js Developer", "React Developer", "Jasa Pembuatan Website".
*   **Target Spesifik**: Jika ada, misal "Frontend Developer untuk Startup".

### 2. 📝 Optimasi On-Page & Konten
| Area | Strategi | Status di Website Ini |
|---|---|---|
| **Title Tag** | Mencakup nama & kata kunci utama. | ✅ Sudah dioptimasi di `SEO.jsx`. |
| **Meta Deskripsi** | Ringkas, menarik, ada CTA. | ✅ Sudah diimplemen. |
| **H1 Tag** | Hanya satu per halaman (Nama/Role). | ✅ Sudah dicek di `Home.jsx`. |
| **Konten Home** | Sebutkan tools/skill secara eksplisit. | ✅ Ada di bagian deskripsi profil. |
| **Alt Text Gambar** | Deskripsi pada foto profil. | ✅ Sudah ditambahkan. |
| **URL** | Bersih dan jelas. | ✅ Route `/apps`, `/services` sudah bersih. |

### 3. 🛠️ Optimasi Teknis (Technical SEO)
*   **Core Web Vitals**: Pastikan LCP (Largest Contentful Paint) dan CLS hijau. (Sudah dioptimasi dengan Caching & Code Splitting).
*   **Mobile-Friendly**: Website harus responsif. (Library Tailwind & React menjamin ini).
*   **Google Search Console**: Wajib daftar & submit sitemap. (Lihat `README_SEO_SETUP.md`).
*   **Schema Markup**: Person Schema & CreativeWorkProject. (Sudah diterapkan).

### 4. 🔗 Strategi Off-Page (Otoritas)
*   **Halaman Proyek**: Jadikan setiap proyek sebagai "Studi Kasus" dengan penjelasan detail (Masalah, Solusi, Teknologi, Hasil).
*   **Backlink Profil**: Pastikan LinkedIn, GitHub, Instagram melink balik ke website ini.
*   **Guest Posting**: Menulis artikel teknis di Medium/Dev.to dengan link ke portofolio.

### 💡 Aksi Prioritas
1.  **Cek Title & Meta**: Pastikan mengandung kata kunci "Frontend Developer".
2.  **Google Search Console**: Monitor index coverage.
3.  **Konten Proyek**: Pertajam deskripsi proyek di database Supabase agar tampil lebih informatif di website.
