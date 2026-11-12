# CLAUDE.md — Algebra Adventure

Instruksi utama untuk Claude Code saat bekerja di repositori ini.

## Konteks proyek

- **Algebra Adventure** — *Exploring the World of Algebra*: PWA pembelajaran **pemfaktoran bentuk aljabar** untuk siswa SMP kelas VII (12–13 tahun), Bahasa Indonesia.
- Pemilik: mahasiswa S1 Pendidikan Matematika yang sedang belajar pemrograman → tulis kode yang jelas, beri komentar pada logika yang tidak jelas, jelaskan keputusan teknis dengan bahasa sederhana.
- Dasar keputusan: wawancara siswa (beban kognitif) dan instrumen literasi matematis. Baca `docs/00_ANALISIS_DOKUMEN.md` dulu.
- Dokumen sumber berada di luar folder proyek: `../Laporan Hasil Wawancara ... .pdf`, `../Bahan Soal (Pretest-Posttest)/`.

## Peta dokumen

| Butuh | Baca |
|-------|------|
| Temuan, keputusan terbuka, masalah instrumen | `docs/00_ANALISIS_DOKUMEN.md` |
| Fitur & kriteria penerimaan | `docs/PRD.md` |
| Prinsip pedagogis, petunjuk, umpan balik | `docs/LEARNING_DESIGN.md` |
| Isi materi & soal per World | `docs/CONTENT_PLAN.md` |
| Pretest/posttest & rubrik | `docs/ASSESSMENT_PLAN.md` |
| Warna, font, komponen, wireframe | `docs/UI_UX_DESIGN.md` |
| Stack, folder, AI, PWA, 3D, audio | `docs/TECHNICAL_ARCHITECTURE.md` |
| Tabel & RLS | `docs/DATABASE_SCHEMA.md` |
| Urutan kerja | `docs/IMPLEMENTATION_PLAN.md` |
| Kasus uji | `docs/TESTING_PLAN.md` |
| Aset & lisensi | `docs/ASSET_GUIDE.md` |

## Aturan tak boleh dilanggar

1. **Instrumen tes tidak boleh diubah** (teks soal, tahap, skor) tanpa persetujuan tertulis pemilik proyek. Sumber: `docs/INSTRUMEN_REVISI_VERSI_B.md` — hanya versi berstatus **disetujui** yang boleh dipakai pada tes siswa. Disimpan di `frontend/src/content/instrument/` dan dijaga oleh uji teks identik.
1a. **Kurikulum:** jangan pernah menyatakan (di aplikasi maupun dokumen) bahwa materi sudah sesuai/terverifikasi CP/ATP sampai dokumen kurikulum diperiksa.
1b. **Cakupan materi:** FPB/distributif, pembagian suku tunggal, selisih dua kuadrat. Trinomial dan pecahan aljabar di luar cakupan.
2. **Kebenaran matematis:** setiap kunci jawaban dan contoh harus lulus pemeriksa di `frontend/src/math/`. Jangan menulis kunci "dari kepala" tanpa uji.
3. **Tidak ada fitur palsu:** tidak ada tombol hiasan, data tiruan yang terlihat nyata, atau fitur yang tampak berfungsi padahal belum. Fitur yang belum siap disembunyikan.
4. **Jangan klaim selesai sebelum diuji.** Laporkan hasil uji apa adanya, termasuk yang gagal.
5. **Rahasia:** kunci `service_role` Supabase dan API key AI tidak boleh ada di frontend, Git, atau log. Hanya kunci `anon` Supabase yang boleh di frontend (dilindungi RLS). Gunakan `.env` (di-`.gitignore`) dan `.env.example`.
5a. **Aset:** gambar referensi di `docs/referensi/` hanya inspirasi — jangan dibundel ke aplikasi.
6. **Jangan menambah layanan berbayar** (AI, TTS, hosting) tanpa menjelaskan biaya & alternatif gratis lalu mendapat persetujuan.
7. **Jangan mengubah tujuan pembelajaran atau cakupan materi** tanpa diskusi.
8. **Data anak:** tanpa email/nama lengkap siswa; jangan kirim data siswa ke layanan AI.

## Aturan desain (ringkas — detail di UI_UX_DESIGN.md)

- Gunakan **hanya** token di `frontend/src/styles/tokens.css`; jangan menulis warna hex langsung di komponen.
- Satu ide/keputusan per layar; teks isi ≤ 40 kata; instruksi ≤ 15 kata, kata kerja di depan.
- Label menempel pada objek; tidak ada auto-advance; animasi ambient hanya di welcome & peta.
- Umpan balik salah: nada menyemangati, warna `--hint-600` (bukan merah), **jangan tampilkan jawaban** sebelum petunjuk tingkat 3 + satu percobaan.
- Target sentuh ≥ 48 px; dukung `prefers-reduced-motion`; semua drag-and-drop punya alternatif ketuk dan keyboard.
- Warna ubin tetap: x² toska, x butter yellow, 1 peach.

## Aturan coding

- Frontend: React + Vite, **JavaScript** (`.jsx`/`.js`), komponen fungsi + hooks, CSS Modules + CSS variables.
- Satu komponen per file; nama komponen `PascalCase`, fungsi/variabel `camelCase`, file konten `kebab-case.json`.
- Teks yang tampil ke siswa ditulis di file konten JSON, bukan di dalam logika komponen (kecuali label UI umum).
- Logika matematika murni (tanpa React) di `src/math/`, wajib diuji unit.
- Data: supabase-js langsung dari frontend; skema/RLS/fungsi sebagai file SQL di `supabase/migrations/`.
- Backend Python (fase AI saja): Python 3.12+, FastAPI, Pydantic, type hints; panggilan AI hanya lewat `app/ai/provider.py`.
- Komentar & pesan commit boleh Bahasa Indonesia; nama variabel dalam bahasa Inggris.
- Jangan menambah dependensi baru tanpa alasan yang ditulis di PR/commit (ukuran bundle penting).
- Bundle awal ≤ 250 KB gzip; three.js hanya dimuat malas.

## Struktur folder

```
UAS_Projek/
├─ CLAUDE.md  README.md
├─ docs/                 dokumen perencanaan
├─ supabase/migrations/  skema, RLS, fungsi SQL
├─ frontend/             React + Vite PWA
│  └─ src/{components,features,math,content,store,services,styles}
└─ backend/              FastAPI (dibuat pada fase AI)
```
(Detail lengkap: `docs/TECHNICAL_ARCHITECTURE.md` §3.)

## Aturan pengembangan fitur

1. Ikuti urutan `docs/IMPLEMENTATION_PLAN.md`; satu fitur per langkah.
2. Sebelum coding fitur: tulis/ perbarui kasus uji dari `docs/TESTING_PLAN.md`.
3. Setelah coding: jalankan uji + lint, periksa di lebar 360 px dan 1440 px.
4. Untuk fitur interaktif: uji dengan mouse, emulasi sentuh, dan keyboard.
5. Laporkan ke pemilik: apa yang dibuat, apa yang diuji, hasil uji, keterbatasan.
6. Commit hanya jika diminta.

## Menjalankan & menguji

> Perintah berikut berlaku setelah Fase 0 (proyek diinisialisasi). Prasyarat: Node.js LTS, Python 3.12+.

```bash
# Frontend
cd frontend
npm install
npm run dev          # server pengembangan (http://localhost:5173)
npm test             # semua uji: test:math lalu test:ui
npm run test:math    # mesin aljabar (test runner bawaan Node, file src/math/*.test.js)
npm run test:ui      # komponen & halaman (Vitest + jsdom, file src/**/*.test.jsx)
npm run test:e2e     # build + Playwright di Microsoft Edge (lebar 360 px & 1440 px)
npm run build && npm run preview   # uji PWA hasil build
# Catatan: nama folder induk berisi '&', yang merusak pintasan .cmd npm di Windows.
# Karena itu skrip di package.json memanggil vite/vitest/playwright lewat `node node_modules/...`.
# Jangan memakai `npx vite` dsb. dari folder ini.

# Backend AI (fitur lanjutan, setelah fitur inti)
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -e ".[dev]"
uvicorn app.main:app --reload   # http://localhost:8000/docs
pytest
```

Uji PWA/instalasi di HP: jalankan `npm run build && npm run preview -- --host`, buka dari HP di jaringan yang sama (fitur instal penuh memerlukan HTTPS → gunakan hosting preview).

## Status keputusan

Keputusan peneliti (F-1 s.d. F-11, 12 Nov 2026) tercatat di `docs/00_ANALISIS_DOKUMEN.md` §F. Hal yang masih menunggu: persetujuan akhir revisi instrumen, dokumen kurikulum, tenggat UAS. Jangan membuat asumsi baru yang lebih besar dari keputusan tersebut.
