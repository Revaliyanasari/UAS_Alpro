# Perombakan UI/UX — Algebra Adventure (Fase 8)

> 27 Nov 2026. Belum di-commit, menunggu tinjauan pemilik proyek.

## 1. Navigasi utama: menu ⋮

- **HP/tablet (< 1024 px):** tombol **⋮ Menu** di kiri atas membuka *drawer* dari kiri. Drawer ditutup dengan ✕, Esc, ketukan di luar, atau saat berpindah halaman.
- **Laptop (≥ 1024 px):** **sidebar** menu yang bisa dibuka/ditutup (ikon panel). Pilihannya tersimpan di perangkat. Jika sidebar ditutup, tombol ⋮ muncul.
- Tombol ⋮ juga ada di **peta, pelajaran, dan kuis**, sehingga menu konsisten di semua halaman siswa.
- Drawer, panel Suara, dan Tanya TATA dirender lewat *portal* ke `<body>`, sehingga selalu tampil paling atas (sebelumnya bisa tertutup pulau di peta).
- Setiap item punya **ikon SVG bergaris seragam + label teks** (`components/ui/Icon.jsx`). Struktur menu ada di satu file: `components/layout/menu.js`.

| Kategori (warna) | Item → halaman |
|---|---|
| Beranda (mint) | Dashboard → `/beranda` |
| Belajar (biru muda) | Asisten Belajar (Tanya TATA) `/asisten` · Materi Pembelajaran `/materi` · Peta Petualangan `/peta` · Riwayat & Progres `/progres` |
| Game & Aktivitas (peach) | Game Belajar Seru `/game` · Tantangan Cepat Tepat `/game/cepat-tepat` · Pasangkan Ekspresi `/game/pasangkan` · Latihan Soal Interaktif `/game/latihan` |
| Komunitas & Prestasi (ungu muda) | Peringkat `/peringkat` · Pencapaian & Lencana `/pencapaian` · Statistik Belajar `/progres#statistik` |
| Lainnya (kuning lembut) | Galeri Ekspresi TATA `/tata` · Profil Siswa `/profil` · Modul Guru `/guru` · Pengaturan `/pengaturan` |

Alur masuk: halaman pembuka → identitas → perkenalan → **Beranda** (sebelumnya langsung ke peta).

## 2. Halaman baru

| Halaman | Isi | Sumber data |
|---|---|---|
| **Beranda** | Sapaan + TATA, tombol "Lanjutkan" ke langkah berikutnya, kartu XP / bintang / lencana / hari belajar, progres tiap pulau, misi harian, rekomendasi, game, pencapaian | Progres siswa asli (`features/home/progress.js`) |
| **Materi** | Semua pulau: misi, topik, status, tombol Pelajari/Kuis sesuai kunci progres | `worlds.json`, progres |
| **Asisten Belajar** | Halaman penuh Tanya TATA, pilihan topik (umum, World 1–3), contoh pertanyaan per topik. Jika AI belum aktif: pemberitahuan ramah + alasan + tautan ke materi/latihan | Proxy DeepSeek yang sudah ada (`ChatPanel.jsx` dipakai bersama) |
| **Riwayat & Progres** | Garis waktu aktivitas, grafik XP 7 hari, nilai kuis, progres pulau | Catatan aktivitas baru |
| **Game Belajar Seru** | Hanya game yang berfungsi (3 mode). Rencana game lain ditulis sebagai teks, tanpa tombol | — |
| **Tantangan Cepat Tepat** | 60 detik, soal acak World 1–3, umpan balik + pembahasan kesalahan di akhir | `games/questionBank.js` |
| **Latihan Soal Interaktif** | 10 soal tanpa waktu, pembahasan setiap soal | idem |
| **Pasangkan Ekspresi** | 12 kartu (bentuk penjumlahan ↔ bentuk faktor), ketuk/keyboard, petunjuk saat keliru | idem |
| **Pencapaian & Lencana** | 10 lencana dengan status & kemajuan | `achievements/badges.js` |
| **Profil Siswa** | Kartu identitas (avatar, nama, kelas, sekolah), ringkasan XP / bintang / lencana / hari belajar, progres tiap pulau, lencana yang diraih, 5 aktivitas terakhir, riwayat kuis, kelola identitas (ubah, ganti siswa, keluar) | Identitas & progres siswa aktif |
| **Peringkat** | **Hanya siswa di perangkat ini**, nama panggilan saja, penanda "Kamu", disertai penjelasan bahwa peringkat kelas membutuhkan server bersama yang belum ada | Data asli tiap siswa (`aa-profile:<id>`) |

**Kebenaran soal game:** setiap soal dibangkitkan dengan rumus, dan uji `src/math/games.test.js` membangkitkan 740 soal + 50 set pasangan lalu memeriksa dengan mesin aljabar: kunci selalu benar, pengecoh selalu salah, opsi tidak ganda.

**Lencana** (diraih hanya dari aktivitas nyata): Penjelajah Aljabar, Ahli Ekspresi, Pejuang Pemfaktoran, Penemu Kuadrat, Bintang Matematika (6 ⭐), Nilai Sempurna (100%), Pembelajar Konsisten (3 hari), Si Cepat Tepat (skor ≥ 8), Pemasang Jitu, Kolektor XP (300).

## 3. Data & kompatibilitas

- Progres siswa ditambah `activity` (100 aktivitas terakhir) dan `games` (rekor per game). Struktur penyimpanan per siswa (`aa-profile:<id>`) tidak berubah.
- Data lama (tanpa kolom baru) dimuat dengan nilai kosong lewat `merge` khusus, sehingga data siswa lain tidak terbawa saat berganti siswa (diuji).
- Pulau yang lulus kuis pada data lama (tanpa `lessonDone`) dianggap pelajarannya selesai. Ini memperbaiki rekomendasi "pelajari lagi" yang keliru.

## 4. Pengaturan

Gear dengan label **"Pengaturan"** ada di bilah atas setiap halaman hub dan di menu. Halaman disusun menjadi enam bagian berikon dan berwarna: **Suara**, **Tampilan**, **Asisten AI TATA**, **Kenali TATA**, **Untuk guru**, dan **Tentang aplikasi**.

## 5. Audio lebih jelas tanpa pecah

- Ditambahkan **limiter** (DynamicsCompressor) di keluaran akhir, dan penguat kanal dinaikkan (musik ×1,0, efek ×1,35).
- Volume bawaan: musik 50% → **70%**, efek 70% → **85%**. Pengaturan tersimpan versi 2: hanya nilai bawaan lama yang belum diubah siswa yang ikut naik.
- **Diukur di Edge:** puncak musik ±0,23 (sebelumnya ±0,11), puncak musik + 3 efek terkeras bersamaan ±0,49. Batas pecah 1,0, jadi tidak ada *clipping*.
- Lagu kini juga diputar di halaman baru: hub → lagu petualangan, game → lagu ringan.

## 6. Visual

- Token warna baru per kategori (`styles/tokens.css`: sky, lilac, peach, butter + `--cat-*`), kontras teks ≥ 4,5:1.
- Dekorasi matematika samar di halaman hub (`MathDecor.jsx`): simbol, ubin, bentuk, bintang, awan.
- **Peta**: pepohonan, cemara, rumput, bunga, batu, burung, awan, dan simbol di tepi. Jalur & kartu pulau tidak berubah.
- Header peta diringkas di HP (Profil tetap ada di menu ⋮). Di layar ≤ 380 px tombol ⋮ hanya ikon agar judul halaman tidak terpotong.

## 7. Pengujian

- Unit/komponen: `src/test/hub.test.jsx` (16 uji: menu, setiap item menuju halaman berfungsi, misi, rekomendasi, lencana, peringkat & privasi, Pasangkan sampai selesai, Latihan 10 soal, migrasi data & volume) dan `src/math/games.test.js`.
- Browser: `e2e/fase8.spec.js` (navigasi semua item menu di HP & laptop, tanpa error JS & overflow, tangkapan layar halaman baru, game, pengukuran puncak audio, panel tampil paling atas di peta).
