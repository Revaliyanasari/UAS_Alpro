# Progres Proyek — Algebra Adventure (MVP)

> Diperbarui: 22 November 2026 (Fase 7: musik & efek suara) · Status: **World 1–3 lengkap dengan desain RMT, Galeri Ekspresi TATA, AI Assistant (siap, belum diberi API key), Modul Guru; dapat dijalankan secara lokal** · Belum di-deploy online.

## 1. Cara menjalankan

Prasyarat: Node.js LTS (terpasang v26).

```bash
cd "UAS_Projek/frontend"
npm install          # sekali saja / setelah dependensi berubah
npm run dev          # buka http://localhost:5173
```

Mencoba di HP (Wi-Fi yang sama): `npm run dev -- --host`, lalu buka alamat `http://<IP-laptop>:5173` yang muncul di terminal.
Mode produksi + PWA: `npm run build` lalu `npm run preview` → http://localhost:4173.

Pengujian: `npm run lint`, `npm test` (mesin aljabar + komponen), `npm run test:e2e` (Edge, lebar 360 & 1440 px), `cd ../backend && npm test` (proxy AI).

AI Assistant (opsional): isi `backend/.env` (salin dari `.env.example`), jalankan `npm run ai` di terminal lain, lalu `npm run dev`. Panduan: `docs/AI_SETUP.md`. Tanpa langkah ini aplikasi tetap berjalan; tombol Tanya TATA disembunyikan.

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
| 5 | **Galeri Ekspresi TATA** (`/tata`, dari Pengaturan): 18 ekspresi orisinal SVG parametris, nama, keterangan, "kapan muncul"; pratinjau beranimasi | Uji komponen (18 gambar berbeda) + e2e |
| 5 | **Ekspresi kontekstual** (`tataMood.js`): menyapa, bersorak (benar pertama kali), semangat → berpikir → bingung (salah berulang), fokus (petunjuk), punya ide (pembahasan), kagum (penemuan), bangga (selesai), mengantuk (peta diam 60 dtk). Wajah sedih/kecewa tidak dipakai untuk menilai | Uji komponen |
| 5 | **RMT** (sumber: ringkasan Kinard & Kozulin dari dosen): penanda fase Input/Elaborasi/Output di setiap layar, layar Analisis soal cerita, Refleksi, Jembatan aturan umum (transendensi), diagnosis fase kognitif pada setiap kode kesalahan. Pemetaan lengkap di `docs/RMT_DESIGN.md` | Uji komponen + kunci konten |
| 5 | **AI Learning Assistant** "Tanya TATA" (DeepSeek): proxy aman `backend/` (Node bawaan), API key hanya di `backend/.env`, prompt berbasis MLE/RMT, batas laju, batas waktu, penyamaran data pribadi, pesan error ramah. Tersembunyi bila belum dikonfigurasi, tidak ada di kuis | 10 uji backend + 7 uji UI + uji rantai dengan server DeepSeek tiruan. **Belum diuji dengan API key asli** |
| 5 | **Modul Guru** (`/guru`, dimuat malas): instrumen (materi, indikator, kunci, rubrik bertahap, catatan revisi, draf/disetujui, impor/ekspor JSON); penilaian per tahap rubrik + transkrip jawaban + catatan; laporan per siswa, per soal (penuh/sebagian/nol), ketercapaian indikator, pretest–posttest + N-gain; ekspor CSV, cetak/PDF, cadangan JSON | 7 uji UI/logika + e2e (unduh CSV sungguhan, data bertahan setelah muat ulang) |
| 5 | Google Drive: **belum terhubung** (sengaja, perlu OAuth resmi). Tersedia unduh berkas + langkah unggah manual; rancangan di `docs/GOOGLE_DRIVE_INTEGRATION.md` | — |
| 7 | **Musik latar orisinal** (Web Audio, tanpa file): 4 lagu sesuai suasana — pembuka (ceria), peta (petualangan), pelajaran (pad tenang tanpa melodi, lebih pelan), kuis (ringan) — dengan crossfade, satu lagu saja, mulai setelah interaksi pertama, berhenti saat tab disembunyikan | Uji mesin (AudioContext tiruan) + e2e Edge (AudioContext asli) |
| 7 | **Efek suara**: ketuk tombol, benar, belum tepat (lembut), XP, bintang, pulau terbuka, kemenangan misi; suara TATA "bip-bup" (menyapa / lembut). Benar/salah dipicu dari respons TATA di semua aktivitas | Uji komponen |
| 7 | **Pengaturan suara**: tombol 🔊 di peta, pelajaran, kuis + kartu Suara di Pengaturan — musik & efek on/off, volume masing-masing, opsi "musik lembut saat belajar & kuis" (hening bila dimatikan); tersimpan di perangkat | Uji komponen + e2e (tersimpan setelah muat ulang) |
| 6 | **Identitas siswa** (`/identitas`): nama lengkap, nama panggilan, kelas (pilihan VII A–F atau tulis sendiri), asal sekolah, no. absen opsional; validasi ramah anak; TATA menyapa; sapaan personal "Halo, {nama}! Siap memulai petualangan matematika hari ini?" | Uji validasi + komponen + e2e (360 & 1440 px) |
| 6 | **Beberapa siswa per perangkat**: progres terpisah per siswa, halaman Ganti siswa (`/siswa`), Profil belajar (`/profil`: identitas + XP, bintang, status pulau, riwayat kuis), ubah identitas tanpa menghapus progres, keluar, hapus siswa | Uji pemisahan progres, migrasi, ganti siswa + e2e setelah muat ulang |
| 6 | Penjaga rute: peta, perkenalan, pelajaran, kuis, profil hanya untuk siswa yang sudah mengisi identitas. Langkah "nama panggilan" di perkenalan dihapus (sudah dari identitas) | Uji komponen |
| 6 | Tanya TATA menyapa dengan nama panggilan **di perangkat**; nama & identitas lain tidak dikirim ke AI | Uji UI (isi permintaan diperiksa) |
| 5 | **World 3 Kepulauan Kuadrat (23 layar)**: bilangan kuadrat (16 ubin), aktivitas **Potong & Geser** a² − b² (ketuk potong, ketuk potongan untuk memutar-menggeser, siswa menentukan panjang & lebar), sortir selisih dua kuadrat, contoh rumpang, 4 latihan, B/S, siapa benar (M4), hitung cepat 51² − 49², soal cerita + kewajaran, refleksi. **Kuis Dunia 3** (5 soal × 2 varian) | Uji kunci (sortir diperiksa `isDifferenceOfSquares`) + komponen + e2e (geometri posisi akhir) |

Ukuran: muatan awal ±161 KB JS + 9,5 KB CSS (gzip; batas 250 KB; audio menambah ±4 KB kode, 0 KB file audio); Modul Guru ±8 KB dan TATA 3D ±252 KB dimuat terpisah.

Hasil uji terakhir (22 Nov 2026, Fase 7): lint bersih · 202 uji mesin & kunci konten lulus · 102 uji komponen lulus · 10 uji proxy AI lulus · 44 uji e2e (Edge, 360 & 1440 px) lulus.

## 3. Belum selesai

- **Fase 3 sisa:** pemudaran contoh (fading) otomatis setelah 3 jawaban benar beruntun (LEARNING_DESIGN §5.3), tawaran "Lihat contoh mirip", mode baris tiles dengan jumlah baris bebas, progres tersimpan per layar (saat ini pelajaran diulang dari awal bila keluar di tengah), badge.
- **World 4 (Menara Tantangan) & World 5 (Petualangan Literasi)**: belum dibuat. Pola konten & semua jenis layar sudah siap dipakai.
- **AI**: uji dengan API key DeepSeek asli (setelah pemilik mengisi `backend/.env`) dan tinjau kualitas jawaban bersama dosen.
- **RMT**: hanya ringkasan yang tersedia. Pemetaan kode kesalahan → fase kognitif perlu ditinjau dosen; jurnal RMT siswa belum ada (lihat `docs/RMT_DESIGN.md` §7).
- **Pretest & posttest siswa** di aplikasi: menunggu persetujuan akhir instrumen Revisi 2. Modul Guru sudah bisa menilai uji coba secara manual.
- **Supabase** (gabung kelas, sinkronisasi guru–siswa): data Modul Guru masih lokal per perangkat, tanpa PIN guru.
- **Google Drive otomatis** (OAuth), **deploy HTTPS**, audio & narasi, model GLB TATA final.
- Kesesuaian kurikulum **belum terverifikasi** (menunggu CP/ATP).

## 4. Struktur folder (ringkas)

```
UAS_Projek/
├─ CLAUDE.md, README.md
├─ docs/                       perencanaan + PROGRESS.md (dokumen ini)
├─ backend/                    proxy AI DeepSeek (Node bawaan, tanpa dependensi) + uji
└─ frontend/
   ├─ src/math/                mesin aljabar + uji (node --test)
   ├─ src/content/             teks & materi (JSON): worlds, onboarding, lessons/, quizzes/, feedback
   ├─ src/components/ui/       komponen dasar (Button, MathKeypad, MathText, …)
   ├─ src/components/tata/     TATA 2D/3D
   ├─ src/features/            welcome, onboarding, map, lesson, quiz, ai, teacher, tata-gallery, settings, lab, catalog
   ├─ src/services/aiClient.js klien proxy AI (tanpa API key)
   ├─ src/store/               profil, pengaturan, data guru (zustand + IndexedDB)
   ├─ src/test/                uji komponen (Vitest)
   └─ e2e/                     uji browser (Playwright + Edge)
```

## 5. Teknologi

React 19 + Vite 6 (JavaScript), CSS Modules, zustand, idb-keyval, @dnd-kit/core, three + @react-three/fiber, vite-plugin-pwa, Vitest, Playwright, ESLint. Lihat `docs/TECHNICAL_ARCHITECTURE.md`.

## 6. Melanjutkan pengerjaan

1. Baca `CLAUDE.md` (aturan) dan dokumen ini.
2. Menambah materi: buat/ubah `frontend/src/content/lessons/world-N.json` (jenis layar: info, example, choice, input, divider, tiles, board, sort, identify, factorPairs, commonFactors, order, faded, reflect, cutSlide; `rmt.phase` untuk menimpa fase RMT; field `story`/`known`/`asked` untuk soal cerita), daftarkan di `lessons/index.js`. Kuis: `frontend/src/content/quizzes/world-N.json` (5 slot × ≥ 2 varian; jenis choice, input, sort, tiles), daftarkan di `quizzes/index.js`. Semua kunci pelajaran & kuis diuji otomatis oleh `src/math/lesson-keys.test.js`.
3. Setelah perubahan: `npm run lint && npm test && npm run test:e2e`.

## 7. Roadmap singkat

| Urutan | Isi |
|--------|-----|
| ✔ Selesai | World 1–3, kuis + pembahasan, RMT, Galeri TATA, struktur AI, Modul Guru lokal |
| Berikutnya | World 4 (Menara Tantangan) lalu World 5 (Literasi) dengan pola yang sama |
| Lalu | Aktifkan AI dengan API key + tinjauan dosen; pretest/posttest setelah instrumen disetujui |
| Fase 6 | Supabase: kelas, sinkronisasi hasil ke Modul Guru |
| Fase 7 | Deploy HTTPS, PWA penuh di Android, Google Drive OAuth, audio |

## 8. Alur aplikasi & penyimpanan identitas (Fase 6)

**Alur:** Halaman pembuka → Identitas siswa (sekali saja) → Sapaan personal → Perkenalan TATA (sekali per siswa) → Peta → Pulau → Pelajaran & kuis → Profil/progres.
Siswa yang kembali langsung disapa di halaman pembuka ("Selamat datang kembali, Rara!") dengan pilihan "Bukan Rara? Ganti siswa".

**Penyimpanan (semuanya IndexedDB di perangkat, tidak dikirim ke internet):**

| Kunci | Isi |
|---|---|
| `aa-students` | Daftar identitas siswa di perangkat + `activeId` (siswa yang sedang belajar) |
| `aa-profile:<idSiswa>` | Progres satu siswa: XP, bintang, status pulau, riwayat kuis, perkenalan selesai |
| `aa-profile` (lama) | Progres dari versi sebelum fitur identitas; otomatis dipindahkan ke siswa **pertama** lalu dihapus |
| `aa-settings`, `aa-teacher` | Pengaturan perangkat & Modul Guru (tidak berubah) |

- `profileStore` tetap satu store; `scopedStorage` mengarahkan kunci `aa-profile` ke `aa-profile:<idSiswa>` sesuai siswa aktif. Saat berganti siswa, progres siswa baru dimuat (`persist.rehydrate`), atau dikosongkan bila belum pernah belajar. Progres siswa sebelumnya sudah tersimpan di kuncinya sendiri, sehingga data tidak pernah tercampur.
- Mengubah identitas hanya mengubah `aa-students` (dan menyalin nama panggilan ke progres). XP, bintang, dan misi tidak disentuh.
- "Selesai belajar (keluar)" tidak menghapus data. "Hapus" di halaman Ganti siswa menghapus identitas **dan** progres siswa itu.
- Kode: `src/store/studentStore.js`, `src/store/scopedStorage.js`, `src/features/student/`.

**Privasi:** nama lengkap dan sekolah hanya tampil di halaman Profil. Tanya TATA hanya memakai nama panggilan untuk sapaan di layar, dan nama tidak ikut permintaan ke server AI. Siapa pun yang memakai perangkat yang sama dapat membuka daftar siswa (belum ada PIN).

## 9. Audio (Fase 7)

- **Sumber:** semua musik & efek suara **digubah sendiri sebagai kode** (`src/audio/music.js` berisi nada, `src/audio/engine.js` mensintesis dengan Web Audio API). Tidak ada file MP3/OGG, tidak memakai lagu atau sampel milik orang lain → orisinal, bebas hak cipta, 0 KB aset, berjalan offline.
- **Lagu per halaman:** pembuka/identitas/perkenalan → *welcome*; peta & profil → *map*; pelajaran → *lesson*; kuis → *quiz*; Pengaturan & Galeri TATA → lagu sebelumnya berlanjut; Modul Guru/Lab/Katalog → tanpa musik.
- **Aturan:** tidak berbunyi sebelum ketukan/tombol pertama; hanya satu lagu (lagu lama berhenti menjadwalkan nada, lalu memudar 0,8 dtk; lagu baru muncul 1,2 dtk); lagu kemenangan menurunkan musik sementara; tab tersembunyi → audio dijeda; jika Web Audio tidak didukung, semua suara diam dan aplikasi tetap berjalan.
- **Pengaturan** (`aa-settings`): `musicOn`, `sfxOn`, `musicVolume`, `sfxVolume`, `focusMusic`.
- **Batasan:** musik sintetis terdengar sederhana dibanding rekaman studio; belum ada narasi suara.
