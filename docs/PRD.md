# PRD — Algebra Adventure

> *Exploring the World of Algebra* · Product Requirements Document · Draf v0.1 (12 Nov 2026)

## 1. Ringkasan produk

Algebra Adventure adalah aplikasi web progresif (PWA) untuk siswa SMP kelas VII yang mengajarkan **pemfaktoran bentuk aljabar** melalui petualangan di lima "dunia". Siswa belajar dengan manipulatif virtual (algebra tiles yang benar-benar bisa digeser), contoh yang dikerjakan bertahap, petunjuk bertingkat dari karakter pendamping **TATA**, dan mengukur kemampuan literasi matematis lewat pretest–posttest berbasis instrumen penelitian.

## 2. Tujuan

| ID | Tujuan | Ukuran keberhasilan |
|----|--------|---------------------|
| G1 | Siswa memahami pemfaktoran (FPB/distributif, selisih dua kuadrat) secara konseptual | Kenaikan skor posttest vs pretest pada instrumen 24 poin; analisis per indikator |
| G2 | Mengurangi beban kognitif ekstrinsik yang ditemukan dalam wawancara | Kuesioner singkat pasca-uji coba (skala beban kognitif); tidak ada keluhan "terlalu banyak tulisan" |
| G3 | Siswa dapat belajar mandiri dengan petunjuk bertahap | ≥ 70% latihan diselesaikan tanpa melihat pembahasan akhir |
| G4 | Dapat dipakai di Android kelas menengah tanpa Play Store | PWA terpasang & berjalan offline; Lighthouse PWA lulus; LCP < 3 dtk di 4G |
| G5 | Peneliti/guru dapat mengumpulkan dan menilai jawaban tes | Jawaban & skor per tahap tersimpan dan dapat diekspor (CSV) |

## 3. Pengguna

| Persona | Deskripsi | Kebutuhan utama |
|---------|-----------|-----------------|
| **Siswa** (utama) | Kelas VII, 12–13 tahun, ponsel Android, terbiasa belajar ekspositori | Langkah kecil, petunjuk bertahap, tampilan sederhana, rasa petualangan |
| **Guru / Peneliti** (Reva) | Menjalankan pretest–posttest, menilai uraian | Daftar jawaban per siswa, form rubrik per tahap, ekspor data |
| **Wali siswa** (tidak langsung) | Memberi persetujuan | Data anak minimal dan aman |

## 4. Masalah yang diselesaikan (dari wawancara S01)

1. Ragu menguraikan bentuk aljabar menjadi faktor (K03).
2. Pembagian aljabar paling sulit (IL01, DS03).
3. Terlalu banyak unsur dipikirkan sekaligus (IL02).
4. Lupa prasyarat dan urutan langkah (IL03, IL05).
5. Bahan ajar padat tulisan, tata letak membingungkan, penjelasan terlalu cepat (EL01–EL04).
6. Soal cerita panjang membebani (EL05).
7. Butuh contoh dulu, petunjuk bertahap, bukan langsung jawaban (GL01, GL03, DS01, DS02).

## 5. Ruang lingkup

**Fitur inti (urutan prioritas peneliti):** (1) welcome & dashboard, (2) TATA, (3) materi World 1–5, (4) algebra tiles yang benar-benar interaktif, (5) latihan & kuis, (6) pretest & posttest (instrumen Versi B revisi yang disetujui), (7) penyimpanan hasil belajar + penilaian rubrik + ekspor, (8) responsif & PWA.

**Setelah fitur inti berjalan:** AI Learning Assistant, narasi rekaman, animasi demonstrasi yang lebih kompleks, video eksternal, unggah foto coretan.

**Tidak termasuk:** trinomial x² + bx + c, pecahan aljabar, materi kelas VIII+, fitur sosial/chat antarsiswa, papan peringkat publik (menghindari kompetisi yang menggeser fokus dari pemahaman), aplikasi native Play Store.

## 6. Fitur utama

| ID | Fitur | Prioritas |
|----|-------|-----------|
| F01 | Welcome screen + pengenalan TATA + onboarding cara pakai | P0 |
| F02 | Peta petualangan (dashboard) dengan World 1–5 & status progres | P0 |
| F14 | TATA: 2D (SVG) + 3D ringan dengan 6 ekspresi, petunjuk lewat speech bubble | P0 |
| F03 | Mesin pelajaran mikro (langkah-langkah, satu ide per layar) | P0 |
| F04 | Contoh bertahap: contoh lengkap → rumpang → mandiri | P0 |
| F05 | Algebra Tiles interaktif (mode Bagi Sama & Bangun Persegi Panjang) | P0 |
| F06 | Papan Matematika (susun bentuk, pilih faktor, cek dengan mengalikan) | P0 |
| F08 | Visual geometris selisih dua kuadrat (potong & susun ulang) | P0 |
| F09 | Petunjuk 3 tingkat + umpan balik informatif berbasis jenis kesalahan | P0 |
| F07 | Puzzle pasangan bentuk ↔ faktor (drag-and-drop) | P0 |
| F10 | Kuis per dunia (PG, B/S, isian, drag-drop, tiles) | P0 |
| F11 | Pretest & posttest (4 soal uraian, rubrik 24 poin) | P0 |
| F12 | Penyimpanan jawaban & progres (lokal + Supabase), penilaian rubrik per tahap, ekspor CSV | P0 |
| F17 | Responsif + PWA (instalasi & offline) | P0 |
| F13 | XP, bintang, badge, progress bar, riwayat kuis | P1 |
| F15 | Musik latar & efek suara (play/pause, volume, mute) | P1 |
| F16 | Narasi suara bahasa Indonesia (on/off, suara perangkat) | P1 |
| F19 | AI Learning Assistant "Tanya TATA" (backend Python) | P2 |
| F20 | Animasi demonstrasi lanjutan / video | P2 |
| F22 | Unggah foto coretan pada tes | P3 |

## 7. User stories & acceptance criteria

### Siswa

**US-01 Memulai petualangan** — Sebagai siswa, saya ingin disambut TATA dan tahu cara memakai aplikasi agar tidak bingung.
- [ ] Welcome screen menampilkan logo, nama, tagline, TATA, tombol "Mulai Petualangan".
- [ ] Audio **tidak** berbunyi sebelum siswa mengetuk tombol.
- [ ] Onboarding ≤ 4 layar, bisa dilewati, bisa dibuka lagi dari menu.

**US-02 Mengerjakan pretest** — Sebagai siswa, saya mengerjakan pretest sebelum belajar.
- [ ] World 1 terkunci sampai pretest dikirim (dapat diatur guru: wajib/tidak).
- [ ] Teks keempat soal **identik** dengan instrumen Versi B revisi yang **sudah disetujui** peneliti (bukan draf).
- [ ] Jawaban tersimpan otomatis setiap 5 detik / saat berpindah soal; tidak hilang jika aplikasi tertutup.
- [ ] Tidak ada petunjuk, kunci, atau umpan balik benar/salah selama pretest.

**US-03 Belajar dengan contoh dulu** — Sebagai siswa, saya ingin melihat contoh langkah demi langkah sebelum mencoba sendiri.
- [ ] Setiap konsep baru diawali contoh lengkap; langkah muncul satu per satu saat siswa mengetuk "Lanjut".
- [ ] Ada tombol "Ulangi langkah" dan tidak ada perpindahan otomatis.
- [ ] Contoh rumpang mendahului latihan mandiri.

**US-04 Menyusun algebra tiles** — Sebagai siswa, saya ingin menggeser ubin untuk menemukan faktor 8x² + 12x.
- [ ] 8 ubin x² dan 12 ubin x dapat diseret dengan jari dan mouse.
- [ ] Ubin menempel (snap) ke grid; dapat dikembalikan ke wadah.
- [ ] Tombol "Periksa" mengenali persegi panjang yang sah dan membaca ukurannya.
- [ ] Susunan sah tetapi belum memakai FPB (mis. 2x(4x + 6)) diberi umpan balik "Benar, tapi masih bisa difaktorkan lagi".
- [ ] Susunan tidak sah memberi petunjuk spesifik, bukan jawaban.

**US-05 Mendapat petunjuk bertahap** — Sebagai siswa, saat kesulitan saya ingin petunjuk kecil dulu.
- [ ] Tombol "Minta Petunjuk" membuka petunjuk tingkat 1 → 2 → 3 berurutan.
- [ ] Menggunakan petunjuk **tidak** mengurangi XP.
- [ ] Pembahasan lengkap hanya muncul setelah petunjuk 3 dan satu percobaan lagi, atau setelah soal selesai.

**US-06 Umpan balik saat salah** — Saya ingin tahu bagian mana yang keliru.
- [ ] Untuk kesalahan umum (lupa membagi suku kedua, FPB kurang besar, tanda salah pada (a+b)(a−b)) muncul pesan khusus.
- [ ] TATA berganti ekspresi "bingung/menyemangati", bukan ekspresi sedih/menghukum.

**US-07 Melihat progres** — Saya ingin melihat sejauh mana petualangan saya.
- [ ] Peta menunjukkan dunia selesai/terbuka/terkunci, bintang per dunia, total XP.
- [ ] Riwayat kuis menampilkan tanggal & skor.

**US-08 Mengatur suara** — Saya ingin mematikan musik saat belajar di kelas.
- [ ] Pengaturan: musik on/off + volume, efek suara on/off, narasi on/off. Tersimpan antarsesi.

**US-09 Memasang aplikasi** — Saya ingin memasang aplikasi di HP tanpa Play Store.
- [ ] Chrome Android menampilkan opsi "Instal aplikasi"; ikon & splash sesuai identitas.
- [ ] Setelah sekali dibuka online, World 1–4 dapat dipelajari offline.

**US-10 Bertanya ke TATA (AI)** — Saya ingin bertanya tentang pemfaktoran.
- [ ] Jawaban berbahasa sederhana, bertahap, mengajukan pertanyaan balik sebelum memberi jawaban akhir.
- [ ] Pertanyaan di luar topik dijawab sopan dan diarahkan kembali.
- [ ] Fitur dinonaktifkan dengan pesan jelas saat offline/backend tidak tersedia (bukan tombol mati tanpa penjelasan).

### Guru / peneliti

**US-11 Menilai uraian** — Sebagai guru, saya ingin menilai jawaban uraian per tahap rubrik.
- [ ] Layar penilaian menampilkan soal, jawaban siswa, dan daftar tahap dengan skor maks. masing-masing.
- [ ] Skor tahap tidak dapat melebihi maksimum; total & skor per indikator dihitung otomatis.
- [ ] Usulan skor AI (jika aktif) ditandai "usulan" dan wajib dikonfirmasi guru.

**US-12 Ekspor data** — Saya ingin mengunduh hasil pretest–posttest.
- [ ] CSV berisi kode siswa, jenis tes, skor per tahap, per soal, per indikator, total, nilai (skor/24 × 100), waktu.

## 8. Persyaratan non-fungsional

- **Performa:** bundle awal (tanpa 3D) ≤ 250 KB gzip; 3D dimuat malas (lazy) ≤ 400 KB tambahan; 60 fps saat drag di perangkat kelas menengah.
- **Aksesibilitas:** target sentuh ≥ 48×48 px; kontras teks ≥ 4.5:1; mendukung `prefers-reduced-motion`; drag-and-drop memiliki alternatif ketuk-pilih-ketuk-taruh.
- **Privasi:** siswa tidak memakai email; data minimal (kode siswa, nama panggilan opsional); persetujuan wali.
- **Keamanan:** tidak ada API key di frontend/repo; rate limit endpoint AI.
- **Bahasa:** Bahasa Indonesia sederhana; kalimat instruksi ≤ 15 kata.
- **Kejujuran fitur:** tidak ada tombol hiasan; fitur yang belum siap disembunyikan, bukan dipalsukan.

## 9. Asumsi & ketergantungan

- Keputusan peneliti: [00_ANALISIS_DOKUMEN.md §F](00_ANALISIS_DOKUMEN.md).
- Kesesuaian materi dengan CP/ATP kelas VII semester 1 **belum terverifikasi**; aplikasi dan dokumentasi tidak boleh mengklaim sebaliknya sampai dokumen kurikulum diperiksa.
- Node.js LTS perlu dipasang di laptop pengembang.
