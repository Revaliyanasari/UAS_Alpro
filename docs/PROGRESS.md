# Progres Proyek — Algebra Adventure (MVP)

> Diperbarui: 22 November 2026 · Status: **World 1–2 lengkap (materi, aktivitas manipulatif, soal cerita, kuis + pembahasan); dapat dijalankan secara lokal** · Belum di-deploy online.

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
| 3 | **Materi World 1 lengkap (26 layar)**: variabel/koefisien/konstanta, suku sejenis, perkalian suku, FPB bilangan, FPB suku, pembagian suku tunggal, soal cerita | Uji kunci konten + komponen + e2e |
| 3 | **Materi World 2 lengkap (20 layar)**: faktor bilangan, distributif, tiles, Langkah Jitu, contoh rumpang, papan, 4 latihan bertingkat, 2 "Siapa yang benar?", soal cerita | Uji kunci konten + komponen + e2e |
| 3 | **Aktivitas manipulatif baru**: Sortir/Kelompokkan kartu (seret, ketuk-taruh, keyboard), Bangun persegi panjang dari 12 ubin (faktor), Faktor bersama → FPB, "Jelaskan ke TATA" (urutkan langkah), Contoh rumpang (faded) | Uji komponen + e2e (seret sungguhan, 360 & 1440 px) |
| 3 | **Literasi matematis**: kartu cerita + panel lipat "Yang diketahui / Yang ditanya"; merumuskan (luas → sisi), menerapkan, menafsirkan (substitusi x), menilai kewajaran (ukuran negatif). Konteks berbeda dari instrumen tes | Uji komponen |
| 3 | Pemeriksa baru `checkSimplified` (3x·5x nilainya benar tetapi harus ditulis 15x² → umpan balik NOT_SIMPLE); `runCheck` dipakai bersama | Uji mesin |
| 3 | **Kuis Dunia 1 & 2**: 5 soal (PG, benar/salah, isian, sortir, tiles), 2 varian per soal (ulang = soal berbeda), hanya petunjuk tingkat 1–2, jawaban pertama yang dinilai, umpan balik diagnosis tanpa membocorkan jawaban | Uji kunci kuis + komponen + e2e |
| 3 | **Pembahasan & evaluasi**: nilai %, bintang (≥ 60% = 1, ≥ 80% = 2, 100% = 3), pembahasan tiap soal + jawaban benar, kartu ringkasan Langkah Jitu, tombol ulang | Uji komponen + e2e |
| 3 | **Buka-kunci sesuai desain**: pelajaran selesai → kuis terbuka; lulus kuis ≥ 60% → pulau berikutnya terbuka (data lama tetap kompatibel) | Uji store + komponen |
| 3 | **Riwayat kuis** (tanggal, skor) & nilai terbaik di kartu pulau; XP dari langkah belajar & jawaban kuis benar | Uji komponen + e2e |

Ukuran: muatan awal ±135 KB JS + 8 KB CSS (gzip); TATA 3D ±252 KB dimuat terpisah.

Hasil uji terakhir (22 Nov 2026): lint bersih · 171 uji mesin & kunci konten lulus · 48 uji komponen lulus · 28 uji e2e (Edge, 360 & 1440 px) lulus.

## 3. Belum selesai

- **Fase 3 sisa:** pemudaran contoh (fading) otomatis setelah 3 jawaban benar beruntun (LEARNING_DESIGN §5.3), tawaran "Lihat contoh mirip", mode baris tiles dengan jumlah baris bebas, progres tersimpan per layar (saat ini pelajaran diulang dari awal bila keluar di tengah), badge.
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
   ├─ src/content/             teks & materi (JSON): worlds, onboarding, lessons/, quizzes/, feedback
   ├─ src/components/ui/       komponen dasar (Button, MathKeypad, MathText, …)
   ├─ src/components/tata/     TATA 2D/3D
   ├─ src/features/            welcome, onboarding, map, lesson, quiz, settings, lab, catalog
   ├─ src/store/               profil & pengaturan (zustand + IndexedDB)
   ├─ src/test/                uji komponen (Vitest)
   └─ e2e/                     uji browser (Playwright + Edge)
```

## 5. Teknologi

React 19 + Vite 6 (JavaScript), CSS Modules, zustand, idb-keyval, @dnd-kit/core, three + @react-three/fiber, vite-plugin-pwa, Vitest, Playwright, ESLint. Lihat `docs/TECHNICAL_ARCHITECTURE.md`.

## 6. Melanjutkan pengerjaan

1. Baca `CLAUDE.md` (aturan) dan dokumen ini.
2. Menambah materi: buat/ubah `frontend/src/content/lessons/world-N.json` (jenis layar: info, example, choice, input, divider, tiles, board, sort, factorPairs, commonFactors, order, faded; field `story`/`known`/`asked` untuk soal cerita), daftarkan di `lessons/index.js`. Kuis: `frontend/src/content/quizzes/world-N.json` (5 slot × ≥ 2 varian; jenis choice, input, sort, tiles), daftarkan di `quizzes/index.js`. Semua kunci pelajaran & kuis diuji otomatis oleh `src/math/lesson-keys.test.js`.
3. Setelah perubahan: `npm run lint && npm test && npm run test:e2e`.

## 7. Roadmap singkat

| Urutan | Isi |
|--------|-----|
| ✔ Selesai | World 1–2 lengkap + kuis dunia + pembahasan |
| Berikutnya | World 3 (visual potong-geser a² − b²) dengan pola yang sama |
| Fase 4 | World 3–5, visual a² − b², puzzle |
| Fase 5 | Pretest/posttest (setelah instrumen disetujui) |
| Fase 6 | Supabase + halaman guru + ekspor CSV |
| Fase 7 | Deploy HTTPS, PWA penuh di Android, audio |
| Fase 8+ | AI tutor, aset final |
