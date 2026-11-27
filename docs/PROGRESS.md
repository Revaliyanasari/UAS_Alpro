# Progres Proyek — Algebra Adventure (MVP)

> Diperbarui: 27 November 2026 (Fase 8: perombakan UI/UX) · **Online: https://revaliyanasari.github.io/UAS_Alpro/** (GitHub Pages, tanpa AI; panduan Netlify + AI: docs/DEPLOYMENT.md) · Status: **World 1–3 lengkap dengan desain RMT, Galeri Ekspresi TATA, AI Assistant (siap, belum diberi API key), Modul Guru; dapat dijalankan secara lokal** 

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

Ukuran: muatan awal ±178 KB JS + ±11 KB CSS (gzip; batas 250 KB). Modul Guru ±7 KB dan TATA 3D ±252 KB dimuat terpisah.

Hasil uji terakhir (Fase 8, profil dilengkapi): lint bersih · 205 uji mesin & kunci konten (termasuk 740 soal game acak) lulus · 119 uji komponen lulus · 16 uji proxy AI lulus · 54 uji e2e (Edge, 360 & 1440 px) lulus.

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

## 10. Perombakan UI/UX (Fase 8)

Menu ⋮ (drawer di HP, sidebar di laptop) dengan 5 kategori berwarna; Beranda (dashboard) sebagai halaman utama; halaman baru: Materi, Asisten Belajar, Riwayat & Progres + statistik, Game Belajar (Cepat Tepat, Pasangkan Ekspresi, Latihan Soal), Pencapaian (10 lencana), Peringkat (jujur: hanya siswa di perangkat ini); Profil Siswa lengkap (identitas, ringkasan, progres pulau, lencana, riwayat aktivitas & kuis); Pengaturan terstruktur dengan ikon gear berlabel; audio lebih jelas dengan limiter (diukur, tidak pecah); peta lebih hidup. Rincian: `docs/UI_REVAMP.md`.

## 11. Status API key DeepSeek (27 Nov 2026)

- API key di `backend/.env` sudah **benar dan diterima DeepSeek**; sempat tertulis `AI_API_KEY=AI_API_KEY=sk-…` dan telah dirapikan. **Saldo DeepSeek masih kosong** (HTTP 402), jadi Tanya TATA belum menjawab sampai saldo diisi.
- Pemeriksa baru: `cd backend && npm run cek-kunci` (satu permintaan ±20 token; kunci tidak pernah ditampilkan). Server juga memberi peringatan saat dijalankan bila bentuk kunci tidak wajar.
- Langkah perbaikan: `docs/AI_SETUP.md` §2a.

## 12. Pelapisan, tur, audio & suara TATA, World 4–5 (27 Nov 2026 — belum di-commit, menunggu persetujuan)

**Pelapisan & tur**
- Skala z-index tunggal di `styles/tokens.css` (`--z-header` 20 < sheet 60 < drawer 70 < modal 80 < tur 90 < toast 100). Menu ⋮, panel Suara, Tanya TATA dirender lewat portal → selalu di atas. Semua modal bisa ditutup dengan ✕, Esc, dan klik di luar.
- Garis lurus vertikal di peta diganti **jalan setapak berkelok** (`map/MapTrail.jsx`) yang diukur dari posisi pulau dan berada di lapisan paling bawah; bagian yang sudah dilalui berwarna kuning.
- **Tur Beranda** (`components/tour/`): muncul sekali per siswa (`tourDone` di profil), bisa Lanjut/Kembali/Lewati/✕/Esc, diulang dari tombol "Lihat tur aplikasi" (Beranda) atau "Ulangi tur aplikasi" (Pengaturan). Kartu selalu di dalam layar (lembar bawah di HP) dan **bersembunyi otomatis bila ada modal lain terbuka**.

**Audio**
- Penyebab "suara kadang hilang": pendengar ketukan dilepas setelah ketukan pertama, sehingga audio yang ditahan browser/HP (pindah aplikasi, telepon, layar terkunci) tidak pernah dibangunkan lagi. Kini setiap ketukan membangunkan audio; iPhone memakai `audioSession = playback` (tidak dibisukan saklar senyap); tombol speaker memberi titik berdenyut bila suara perlu diaktifkan.
- **Suara TATA** (`audio/voice.js`, Web Speech API bawaan browser, tanpa biaya): memilih suara bahasa Indonesia paling natural, tidak memakai logat bahasa lain, menangani daftar suara yang dimuat belakangan, menghentikan kalimat sebelumnya, jeda per situasi, musik diredam saat TATA berbicara. Kalimat situasional di `content/tata-voice.json` (sapaan pertama, beranda, awal pelajaran/kuis, benar, salah, kesulitan, XP, pulau terbuka, selesai). Tanpa nama siswa (suara "online" diproses server penyedia browser). Tombol 🔊 Dengar di balon TATA.
- Pengaturan suara: tiga kelompok (Musik, Efek suara, Suara TATA) masing-masing dengan sakelar, volume, dan tombol Tes; tombol "Kembalikan pengaturan suara bawaan".

**Materi World 4 & 5 (sebelumnya kosong, tampil "Segera hadir")**
- **World 4 Menara Tantangan** (29 layar): 4 lantai bertingkat (pemahaman dasar → penerapan konsep → pemecahan masalah → kontekstual), masing-masing diawali pengingat materi. Bentuk tantangan beragam: memilah suku sejenis, menyederhanakan, menentukan nilai, memfaktorkan (FPB, selisih dua kuadrat, gabungan keduanya), contoh rumpang, siapa yang benar, menyusun strategi, analisis cerita, belanja alat tulis, menata kursi, menilai kewajaran, puncak "pasangkan bentuk ↔ faktor" dengan keranjang pengecoh, refleksi. Kuis 5 soal × 2 varian.
- **World 5 Petualangan Literasi** (28 layar): 4 misi per indikator literasi — Menalar (stiker untuk kelompok), Merumuskan (halaman & pos satpam), Menerapkan (dua papan pengumuman + uang kas), Menafsirkan (lahan parkir sepeda). Setiap misi: cerita → pilah diketahui/ditanya/tidak diperlukan → manipulatif (ubin aljabar, potong & geser, papan matematika) → model → hitung → simpulkan & nilai kewajaran; ditutup langkah literasi & refleksi. Kuis 5 soal × 2 varian bertema sehari-hari.
- Konteks World 5 **berbeda dari instrumen** pretest/posttest (diuji otomatis: tanpa buku tulis/kantong, taman/kolam, pita/meja pameran, karpet/pojok baca). Draf misi 5.4 di `CONTENT_PLAN.md` (kolam) diganti lahan parkir sepeda karena terlalu dekat dengan konteks instrumen Soal 2.
- Semua kunci diuji mesin aljabar (`lesson-keys.test.js`, `world45.test.js`); lencana baru "Penakluk Menara" & "Petualang Literasi".
- **Lanjutkan pelajaran**: posisi & hasil tiap langkah tersimpan per siswa per pulau (`lessonSaves`); saat dibuka lagi muncul "Melanjutkan dari langkah N" + "Mulai dari awal".
- **Papan ketik**: tombol variabel kini mengikuti soal (a, k, m, p, t, …). Sebelumnya hanya x dan y, sehingga di HP soal ber-variabel lain tidak bisa dijawab. Diuji untuk semua 88 soal isian World 1–5.

**Pengujian (27 Nov 2026):** lint bersih · uji matematika & kunci 283/283 · uji UI 234/234 · e2e Edge 64/64 (HP 360 px & laptop 1440 px), termasuk World 4 & 5 dimainkan penuh (jawaban salah ditolak, keluar-masuk di tengah pelajaran, kuis 5/5 → ★★★, XP, pulau berikutnya terbuka, lencana).

## 13. Tanya TATA: riwayat & Coba lagi · ilustrasi dunia & animasi penghargaan (27 Nov 2026 — belum di-commit)

**Tanya TATA** (backend, provider DeepSeek, dan API key tidak diubah)
- Riwayat percakapan selama sesi browser (`features/ai/chatHistory.js`, `sessionStorage`): tetap ada saat jendela ditutup/dibuka, berpindah halaman, atau memuat ulang; hilang saat tab ditutup. Kunci `aa-chat:<idSiswa>:<topik>` → **tidak tercampur antarsiswa** dan antartopik (pelajaran per dunia, Asisten Belajar per topik). Batas 15 pertanyaan ikut tersimpan (tidak "terisi ulang" dengan membuka ulang jendela). Tombol "Hapus percakapan".
- Bila AI gagal (kuota habis, server, jaringan, waktu habis): pesan galat yang jujur + tombol **Coba lagi** yang mengirim ulang pertanyaan yang sama (tidak terduplikasi). Pertanyaan yang belum terjawab tetap bisa dicoba lagi setelah jendela dibuka ulang. **Tidak pernah ada jawaban buatan** — riwayat hanya berisi jawaban yang benar-benar diterima dari server.
- Indikator memuat (tiga titik berdenyut); topik Asisten Belajar untuk World 4 & 5.
- Perbaikan tata letak: di HP, baris pertanyaan cepat yang bisa digeser melebarkan kartu chat melewati layar (kolom grid kini `minmax(0, 1fr)`).

**Visual**
- `components/art/WorldArt.jsx`: 5 ilustrasi SVG orisinal (Lembah Aljabar, Gua Rahasia, Kepulauan Kuadrat, Menara Tantangan, Petualangan Literasi), hanya token warna, tanpa file gambar. Tampil di kartu Materi (pudar bila terkunci), lembar pulau di peta, dan layar "Pelajaran selesai". Gerak halus & lambat (ubin melayang, bendera berkibar).
- `components/reward/RewardBurst.jsx`: bintang muncul satu per satu + "+N XP" melayang + percikan, di hasil kuis, akhir pelajaran, dan hasil game. Hanya `transform`/`opacity`, berjalan sekali (±1,5 dtk), `pointer-events: none` (tidak menghalangi tombol), dekoratif untuk pembaca layar (nilai tetap tertulis sebagai teks). Pengaturan "Kurangi animasi" dan preferensi sistem dihormati.

**Pengujian (27 Nov 2026):** lint bersih · matematika & kunci 283/283 · UI 251/251 (baru: `chat-history.test.jsx`, `visuals.test.jsx`) · e2e Edge 68/68 di HP 360 px & laptop 1440 px (baru: `fase11.spec.js` — server AI ditiru, tanpa memakai saldo DeepSeek; `fase10` kini juga memeriksa ilustrasi & animasi penghargaan selesai sendiri dan tidak menutupi tombol). Catatan: pada satu putaran penuh, uji World 5 di HP sekali gagal saat 2 browser berjalan bersamaan; lulus 3× berturut-turut saat diulang sendiri dan lulus pada putaran penuh berikutnya.

## 14. Perbaikan pembaruan PWA setelah deploy (27 Nov 2026)

Gejala: situs GitHub Pages sudah berisi build baru (`gh-pages` dari `ffaa1b3`, file live identik dengan build lokal), tetapi perangkat yang pernah membuka aplikasi tetap melihat versi lama. Penyebab & perbaikan: lihat `docs/DEPLOYMENT.md` §F (service worker mode *prompt* menunggu tombol yang tertutup latar halaman → kini *autoUpdate* + `skipWaiting`/`clientsClaim`, penundaan saat pelajaran/kuis/game, pemberitahuan di lapisan teratas). Data siswa tidak disentuh. Uji: `src/test/update.test.jsx` + reproduksi browser (versi lama persis → versi perbaikan → versi berikutnya).

## 15. Tanya TATA memakai Google Gemini (27 Nov 2026 — belum di-commit)

Kunci baru pemilik adalah kunci Google Gemini; backend ditambah penyedia `gemini` (endpoint kompatibel OpenAI, model `gemini-flash-lite-latest` + cadangan otomatis), pemeriksa kunci & pesan galat netral-penyedia, pembersih tampilan LaTeX/Markdown di chat. Diuji dengan AI sungguhan dari browser (HP & laptop, jawaban ±1–2 detik). Rincian: `docs/AI_SETUP.md` §2b. Uji: backend 22/22, UI 258/258, matematika 283/283, e2e 68/68.

## 16. Peluncur satu klik (27 Nov 2026)

`Jalankan Algebra Adventure.bat` (folder proyek) / `npm run mulai` (folder frontend) → `frontend/scripts/start-all.mjs`: memasang dependensi bila belum ada, menyalakan server AI (8787) + aplikasi (5173, juga untuk HP di Wi-Fi yang sama), menampilkan status Tanya TATA (tanpa menampilkan kunci), membuka browser; bila sudah berjalan, hanya membuka browser. Diuji: dijalankan lewat .bat → AI aktif (Gemini) dan Tanya TATA menjawab dari browser (HP & laptop).

## 17. Netlify live + perbaikan lencana host (28 Nov 2026)

Situs Netlify `uas-alpro-9t3y.netlify.app` terverifikasi menyajikan versi terbaru (sama dengan GitHub Pages) dan Tanya TATA (Gemini) aktif. Lencana "Powered by Netlify" (paket gratis) menutupi tombol Lanjut/Soal berikutnya di HP → diperbaiki dengan token `--inset-bottom` + deteksi lencana di `main.jsx`. Rincian: `docs/DEPLOYMENT.md` §G.
