# Progres Proyek — Algebra Adventure (MVP)

> Diperbarui: 12 November 2026 · Status: **versi awal (MVP) dapat dijalankan secara lokal** · Belum di-deploy online.

## 1. Cara menjalankan

Prasyarat: Node.js LTS (terpasang v26).

```bash
cd "UAS_Projek/frontend"
npm install          # sekali saja / setelah dependensi berubah
npm run dev          # buka http://localhost:5173
```

Mencoba di HP (Wi-Fi yang sama): `npm run dev -- --host`, lalu buka alamat `http://<IP-laptop>:5173` yang muncul di terminal.
Mode produksi + PWA: `npm run build` lalu `npm run preview` → http://localhost:4173.

Pengujian: `npm run lint`, `npm test` (mesin aljabar + komponen), `npm run test:e2e` (Edge, lebar 360 & 1440 px).

> Catatan Windows: nama folder induk berisi `&`, jadi skrip memanggil alat lewat `node node_modules/...`. Jangan memakai `npx`.

## 2. Fitur yang sudah selesai & teruji

| Fase | Fitur | Bukti uji |
|------|-------|-----------|
| 0–1 | Design system (token warna/huruf/jarak, kontras ≥ 4,5:1), komponen UI dasar | Uji komponen + e2e |
| 0–1 | **Mesin aljabar**: parser, ekuivalensi, faktor penuh, diagnosis kesalahan M1–M11, pembagian suku tunggal, FPB | 125 uji, cakupan ±98% |
| 0–1 | Pengaturan (ukuran tulisan, animasi) tersimpan di IndexedDB; Lab Pemeriksa Aljabar (untuk guru) | Uji komponen + e2e |
| 0–1 | PWA dasar: manifest, ikon TATA, service worker, mode offline, pemberitahuan versi baru | e2e |
| 2 | Welcome (latar SVG orisinal), onboarding 4 langkah, aktivitas drag-and-drop "Kenalan dengan Ubin" | Uji komponen + e2e (seret sungguhan) |
| 2 | TATA 2D (SVG) & 3D (three.js, dimuat malas) dengan 6 ekspresi; fallback 2D otomatis | Uji komponen + e2e |
| 2 | Peta 5 pulau berurutan, kartu misi/materi/indikator, kunci pulau, XP & bintang | Uji komponen + e2e |
| 3 (dasar) | **Pemutar pelajaran mikro**: info, contoh bertahap, pilihan, isian, Mesin Pembagi, Algebra Tiles, Papan Matematika | Uji komponen + e2e |
| 3 (dasar) | **Petunjuk 3 tingkat dari TATA**; pembahasan hanya setelah petunjuk ke-3 + satu percobaan; petunjuk tidak mengurangi XP | Uji komponen |
| 3 (dasar) | **Papan ketik matematika** (tanpa keyboard HP) | Uji komponen |
| 3 (dasar) | **Algebra Tiles** 8x² + 12x: bagi sama ke 4 kotak → 4(2x² + 3x); susun 4 baris → 4x(2x + 3). Seret atau ketuk-taruh | Uji komponen + e2e |
| 3 (dasar) | **Mesin Pembagi** (bagi angka → bagi variabel → cek) dan **Papan Matematika** (faktor luar × isi kurung, perkalian tiap suku) | Uji komponen |
| 3 (dasar) | Materi World 1 (11 layar) & World 2 (9 layar); selesai pulau → bintang + XP + pulau berikutnya terbuka | Uji kunci konten + komponen |

Ukuran: muatan awal ±124 KB JS + 7 KB CSS (gzip); TATA 3D ±252 KB dimuat terpisah.

## 3. Belum selesai

- **Fase 3 lanjutan:** kuis akhir dunia, materi World 1–2 yang lebih lengkap (sesuai CONTENT_PLAN), pemudaran contoh (fading) otomatis, mode baris tiles dengan jumlah baris bebas.
- **Fase 4:** World 3 (visual potong-geser a² − b²), World 4, World 5, puzzle pasangan, badge, riwayat kuis.
- **Fase 5:** pretest & posttest (menunggu persetujuan akhir instrumen Revisi 2).
- **Fase 6:** Supabase (gabung kelas, sinkronisasi), halaman guru (penilaian rubrik, ekspor CSV).
- **Fase 7:** deploy ke hosting HTTPS gratis (agar bisa dipasang di Android), audio & narasi.
- **Fase 8+:** AI tutor, model GLB TATA final, animasi demonstrasi.
- Kesesuaian kurikulum **belum terverifikasi** (menunggu CP/ATP).

## 4. Struktur folder (ringkas)

```
UAS_Projek/
├─ CLAUDE.md, README.md
├─ docs/                       perencanaan + PROGRESS.md (dokumen ini)
└─ frontend/
   ├─ src/math/                mesin aljabar + uji (node --test)
   ├─ src/content/             teks & materi (JSON): worlds, onboarding, lessons/, feedback
   ├─ src/components/ui/       komponen dasar (Button, MathKeypad, MathText, …)
   ├─ src/components/tata/     TATA 2D/3D
   ├─ src/features/            welcome, onboarding, map, lesson, settings, lab, catalog
   ├─ src/store/               profil & pengaturan (zustand + IndexedDB)
   ├─ src/test/                uji komponen (Vitest)
   └─ e2e/                     uji browser (Playwright + Edge)
```

## 5. Teknologi

React 19 + Vite 6 (JavaScript), CSS Modules, zustand, idb-keyval, @dnd-kit/core, three + @react-three/fiber, vite-plugin-pwa, Vitest, Playwright, ESLint. Lihat `docs/TECHNICAL_ARCHITECTURE.md`.

## 6. Melanjutkan pengerjaan

1. Baca `CLAUDE.md` (aturan) dan dokumen ini.
2. Menambah materi: buat/ubah `frontend/src/content/lessons/world-N.json` (jenis layar: info, example, choice, input, divider, tiles, board), daftarkan di `lessons/index.js`. Kunci otomatis diuji oleh `src/math/lesson-keys.test.js`.
3. Setelah perubahan: `npm run lint && npm test && npm run test:e2e`.

## 7. Roadmap singkat

| Urutan | Isi |
|--------|-----|
| Berikutnya | Lengkapi World 1–2 + kuis dunia |
| Fase 4 | World 3–5, visual a² − b², puzzle |
| Fase 5 | Pretest/posttest (setelah instrumen disetujui) |
| Fase 6 | Supabase + halaman guru + ekspor CSV |
| Fase 7 | Deploy HTTPS, PWA penuh di Android, audio |
| Fase 8+ | AI tutor, aset final |
