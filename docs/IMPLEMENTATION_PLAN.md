# Rencana Implementasi — Algebra Adventure

> Revisi 12 Nov 2026: urutan mengikuti prioritas peneliti; tenggat belum ditetapkan → fitur inti dulu.
> Setiap fase berakhir dengan **gerbang uji** (TESTING_PLAN). Fase berikutnya dimulai setelah gerbang lulus dan Anda meninjau hasilnya.
> Kompleksitas: S (≤ 1 sesi kerja) · M (2–3 sesi) · L (4+ sesi).

## Fase 0 — Persiapan
| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| Pasang Node.js LTS | S | `node -v`, `npm -v` berjalan |
| Inisialisasi Vite + React (JS), ESLint, Prettier, Vitest | S | `npm run dev` jalan; `npm test` lulus |
| PWA dasar (manifest + service worker) | S | Dapat dibuka dari HP lewat jaringan lokal/preview |

## Fase 1 — Fondasi, design system, mesin polinomial
| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| `tokens.css` + font offline + komponen UI dasar | M | Halaman "katalog komponen" menampilkan semua token & komponen; target sentuh ≥ 48 px |
| Router, tata letak responsif, pengaturan tersimpan | M | Tanpa scroll horizontal 320–1440 px; pengaturan bertahan setelah reload |
| **Mesin polinomial** (parser, ekuivalensi, faktor penuh, pembagian suku tunggal, diagnosis M1–M9) | L | ≥ 95% cakupan uji; semua kunci di CONTENT_PLAN & instrumen lulus |

## Fase 2 — Welcome, dashboard, TATA  *(prioritas 1–2)*
| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| Latar welcome SVG orisinal (berlapis, ambient lembut) | M | Tidak memakai gambar referensi; tanpa teks acak; responsif |
| Welcome + onboarding + nama panggilan | M | US-01 |
| TATA 2D (SVG) 6 ekspresi + speech bubble | M | Semua ekspresi dapat dipicu |
| TATA 3D prosedural (lazy) + fallback otomatis | M | Bundle awal tidak bertambah; tetap lancar di HP uji |
| Peta petualangan (dunia terkunci/terbuka/selesai, XP, bintang) | M | US-07 (sebagian) |

## Fase 3 — Mesin pelajaran, Algebra Tiles, World 1–2  *(prioritas 3–4)*
| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| Mesin pelajaran (Misi → Pembahasan) membaca JSON | L | Satu World dapat dimainkan utuh |
| Petunjuk 3 tingkat lewat TATA + umpan balik diagnosis | M | US-05, US-06 |
| Papan ketik matematika | M | Semua jawaban World 1–4 dapat diketik tanpa keyboard sistem |
| **Algebra Tiles** (Bagi Sama, Bangun Persegi Panjang) + **Mesin Pembagi** | L | US-04; diuji mouse, sentuh (HP nyata), keyboard |
| Papan Matematika | M | Susun bentuk, pilih faktor, cek dengan mengalikan |
| Konten World 1 (termasuk 1.6 pembagian suku tunggal) & World 2 | M | Semua kunci lulus uji otomatis |

## Fase 4 — World 3–5, latihan & kuis  *(prioritas 3, 5)*
| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| Visual potong-geser a² − b² (dapat diseret) | L | Sisi berlabel benar; animasi menjelaskan, bukan hiasan |
| Puzzle pasangan (drag-and-drop + ketuk) | M | Validasi langsung |
| Kuis dunia 1–4, misi literasi World 5, bintang, badge, riwayat | L | FN-04; skor tersimpan lokal |

## Fase 5 — Pretest & posttest  *(prioritas 6)*
| Prasyarat | Instrumen revisi **sudah disetujui** peneliti |
|-----------|-----------------------------------------------|

| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| Data instrumen terkunci (`versi-b-rev1.json`) + uji teks identik | S | AS-03 |
| Modul tes: simpan otomatis, navigasi soal, kirim, kunci | M | US-02, AS-01, AS-02 |

## Fase 6 — Penyimpanan hasil, penilaian, ekspor  *(prioritas 7)*
| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| Proyek Supabase + migrasi SQL (tabel, RLS, fungsi, trigger) | M | SC-02, SC-03 lulus |
| Gabung kelas (auth anonim) + sinkronisasi antrean offline | M | PW-05: tanpa duplikasi |
| Halaman Guru: login, daftar siswa, penilaian per tahap, audit, relink | L | US-11, AS-04, AS-05 |
| Ekspor CSV + ringkasan per indikator & N-gain + ekspor cadangan lokal | M | US-12, AS-06, AS-08 |

## Fase 7 — Responsif & PWA penuh, audio  *(prioritas 8)*
| Tugas | Komp. | Kriteria selesai |
|-------|-------|------------------|
| Offline penuh, banner pembaruan, tombol pasang | M | PW-01 – PW-04; Lighthouse PWA lulus |
| Audit responsif & aksesibilitas | M | §6 TESTING_PLAN |
| AudioManager: musik, efek, narasi Web Speech | M | US-08 |
| Deploy ke hosting gratis + uji coba terbatas | S | Dapat dipasang dari URL HTTPS di Android |

**Titik "fitur inti selesai" = akhir Fase 7.**

## Fase 8+ — Fitur lanjutan (setelah fitur inti berjalan baik)
1. AI Learning Assistant (FastAPI + penyedia AI — perlu persetujuan biaya).
2. Narasi rekaman, model GLB TATA final.
3. Animasi demonstrasi lanjutan / video.
4. Unggah foto coretan pada tes.

## Risiko utama

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Drag-and-drop tidak nyaman di HP kecil | Tinggi | Mode ketuk-taruh; uji HP nyata sejak Fase 3 |
| Pemeriksa jawaban salah menilai | Tinggi | Uji unit luas; semua kunci konten diuji otomatis |
| Instrumen berubah tanpa sengaja | Tinggi | JSON terkunci + uji teks identik |
| Revisi instrumen belum disetujui saat Fase 5 | Sedang | Fase 1–4 tidak bergantung padanya |
| Sesi anonim hilang (data browser dihapus) | Sedang | Data terkirim tetap aman; guru dapat relink; ekspor cadangan |
| 3D berat di Android kelas menengah | Sedang | Lazy load, fallback 2D, anggaran poligon |
| Suara id-ID tidak tersedia | Rendah | Tombol disembunyikan; narasi rekaman nanti |
| Supabase free tier dijeda | Sedang | Aktifkan sebelum uji coba; offline-first |
| Cakupan kurikulum belum terverifikasi | Sedang | Tidak mengklaim terverifikasi; periksa saat CP/ATP diterima |
