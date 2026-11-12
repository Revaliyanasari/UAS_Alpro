# 00 — Analisis Dokumen Sumber (Tahap 1)

> Status: **Ditinjau peneliti** · Disusun: 12 November 2026 · Keputusan dicatat di §F
> Dokumen ini adalah dasar semua dokumen perencanaan lain. Revisi instrumen berdasarkan bagian E ada di [INSTRUMEN_REVISI_VERSI_B.md](INSTRUMEN_REVISI_VERSI_B.md) (menunggu pemeriksaan akhir).

## A. Dokumen yang dianalisis

| # | Dokumen | Lokasi | Catatan |
|---|---------|--------|---------|
| D1 | Laporan Hasil Wawancara (siswa S01) | `../Laporan Hasil Wawancara Algoritma Pemrograman_Reva Liyanasari.pdf` | 21 kutipan berkode: K01–K03, IL01–IL05, EL01–EL05, GL01–GL05, DS01–DS03 |
| D2 | Instrumen Literasi Matematis — **Versi B** (terbaru, dilampirkan) | `../Bahan Soal (Pretest-Posttest)/Instrumen_Soal_Mathematical_Literacy_Pemfaktoran_Aljabar.pdf` / `.docx` | 4 soal, 24 poin. **Tidak** memuat bagian C (pedoman umum), D (keterkaitan), E (kunci jawaban lengkap) |
| D3 | Instrumen — **Versi A** (lama, *tidak* dilampirkan di chat, ditemukan di folder) | `../Bahan Soal (Pretest-Posttest)/Instrumen Soal Full.docx` | 4 soal **berbeda**, struktur skor identik (6/6/6/6), memuat bagian C, D, E |
| D4 | Gambar referensi background | `docs/referensi/background-welcome-referensi.jpg` | Komposisi vertikal, pulau melayang, papan algebra tiles, maskot kubus toska bertunas |

## B. Ringkasan temuan wawancara → implikasi desain

| Kode | Temuan | Jenis beban | Implikasi desain aplikasi |
|------|--------|-------------|---------------------------|
| K01–K03 | Ingat variabel & suku, ragu menguraikan menjadi faktor | — | World 1 cukup *review* singkat; fokus utama pada proses "menguraikan" |
| K02 | Belajar ekspositori di papan tulis | — | Aplikasi harus *aktif* (manipulatif), bukan buku digital |
| IL01 | **Pembagian aljabar** paling sulit | Intrinsik | Tambah mikro-pelajaran **pembagian suku tunggal** (8x² : 4x) sebagai "kebalikan perkalian" — *usulan tambahan, lihat F-3* |
| IL02 | Bingung memikirkan koefisien, variabel, kelompok, rumus **sekaligus** | Intrinsik (element interactivity) | Pecah prosedur: **koefisien dulu → variabel → gabungkan → cek**. Satu langkah per layar |
| IL03 | Perlu ingat perkalian aljabar, FPB, pembagian suku sejenis | Intrinsik (prasyarat) | World 1 = prasyarat; tombol "Ingat lagi" kontekstual di World 2–5 |
| IL04 | Sulit saat soal naik ke pembagian/pecahan aljabar | Intrinsik | Kenaikan kesulitan bertahap 4 level (World 4). Pecahan aljabar **di luar cakupan** |
| IL05 | Lupa rumus/urutan langkah | Intrinsik (retrieval) | Kartu "Langkah Jitu" yang bisa dibuka kapan saja; latihan berjarak (spaced review) |
| EL01 | Petunjuk soal berbelit | Ekstrinsik | Instruksi maks. 1–2 kalimat, kata kerja di depan |
| EL02 | Tata letak tulisan & gambar membingungkan | Ekstrinsik (split-attention) | Label menempel **pada** gambar, bukan di keterangan terpisah |
| EL03 | Terlalu banyak tulisan → cepat lelah | Ekstrinsik | Batas konten per layar (lihat UI_UX_DESIGN §Aturan Beban Kognitif) |
| EL04 | Guru menjelaskan terlalu cepat | Ekstrinsik (transient information) | Semua penjelasan **dikendalikan siswa** (tombol Lanjut/Ulangi), tidak ada auto-advance |
| EL05 | Soal cerita panjang membingungkan | Ekstrinsik | Soal cerita dipecah: konteks singkat + ilustrasi + "Yang diketahui / ditanya" bisa dibuka |
| GL01 | Lebih mudah dengan contoh dulu | Germane (worked example) | Urutan wajib: **Contoh lengkap → Contoh rumpang (faded) → Latihan mandiri** |
| GL02 | Memeriksa kembali jawaban | Germane (self-monitoring) | Tombol "Cek dengan mengalikan kembali" pada setiap soal pemfaktoran |
| GL03 / DS01 | Butuh petunjuk sedikit demi sedikit | Germane (scaffolding) | Sistem **petunjuk 3 tingkat** (lihat LEARNING_DESIGN §4) |
| GL04 | Menjelaskan ke teman sedikit membantu | Germane (elaborasi) | Aktivitas opsional "Jelaskan ke TATA" (self-explanation prompt) |
| GL05 | Soal baru → lihat contoh lagi | Germane (transfer) | Tautan "Lihat contoh mirip" pada setiap latihan |
| DS02 | Petunjuk bertahap, **bukan langsung jawaban** | — | Jawaban akhir hanya muncul setelah 3 petunjuk + percobaan, atau pada pembahasan akhir |
| DS03 | Tampilan sederhana, langkah demi langkah, terutama pembagian | Ekstrinsik | Minimalist UI; pembagian aljabar mendapat animasi langkah |

**Catatan keterbatasan data:** wawancara hanya melibatkan **satu siswa (S01)**. Temuan ini sah sebagai dasar desain awal, tetapi sebaiknya divalidasi dengan uji coba ke beberapa siswa (lihat TESTING_PLAN §7).

## C. Analisis instrumen (Versi B — dilampirkan)

| No | Indikator | Konten | Tahapan & skor | Konsep |
|----|-----------|--------|----------------|--------|
| 1 | Mathematical Reasoning | Buku tulis (8x² + 12x) dibagi 4x per kantong; Dinda (2x+3) vs Rafa (2x+12) | 1+2+1+1+1 = 6 | FPB, distributif, pembagian suku |
| 2 | Formulating | Taman persegi sisi y, kolam 3×3; model y² − 9 = (y+3)(y−3) | 1+1+1+1+1+1 = 6 | Selisih dua kuadrat |
| 3 | Employing | L₁ = 6x² + 12x, L₂ = 9x² + 15x; pita = FPB(L₁, L₂) | 1+2+2+1 = 6 | FPB dua bentuk aljabar |
| 4 | Interpreting & Evaluating | Karpet (x² − 16) = (x+4)(x−4); usulan x = 3 | 1+1+1+1+1+1 = 6 | Selisih dua kuadrat, kewajaran |

Pemeriksaan aritmetika rubrik: **semua perhitungan kunci benar** (4x(2x+12) = 8x² + 48x; FPB(6x(x+2), 3x(3x+5)) = 3x karena (x+2) dan (3x+5) tidak memiliki faktor persekutuan; 3² − 16 = −7). Jumlah skor per soal = 6, total 24 ✔.

## D. Perbandingan Versi A vs Versi B

| Aspek | Versi A (Full.docx) | Versi B (PDF dilampirkan) |
|-------|---------------------|---------------------------|
| Soal 1 | Kartu ucapan (6x² + 9x) : 3x — Rina vs Bima | Buku tulis (8x² + 12x) : 4x — Dinda vs Rafa |
| Soal 2 | Mading x² − 25, **bentuk faktor tidak diberikan** di soal | Taman y² − 9, **bentuk faktor (y+3)(y−3) sudah diberikan** di soal |
| Soal 3 | x² + 7x + 12 (**trinomial**) | FPB dua bentuk aljabar |
| Soal 4 | x² + 2x − 15 (**trinomial**) | x² − 16 (selisih dua kuadrat) |
| Bagian C–E | Ada (pedoman umum, keterkaitan wawancara, kunci jawaban) | Tidak ada |

Versi A dan B **tidak sepenuhnya paralel**: Versi A memuat pemfaktoran trinomial x² + bx + c, Versi B tidak. Jadi Versi A **tidak bisa langsung** dipakai sebagai bentuk paralel posttest tanpa keputusan Anda (lihat F-1, F-2).

## E. Temuan instrumen yang perlu persetujuan (TIDAK diubah sebelum disetujui)

Tingkat: 🔴 memengaruhi validitas/kebenaran · 🟡 memengaruhi kewajaran konteks · 🟢 penyempurnaan kecil.

### E-1 🔴 Soal 3 (Versi B): satuan dan logika konteks "panjang pita = FPB luas"
- **Masalah:** L₁ dan L₂ adalah **luas** (dm²). FPB-nya, 3x, adalah *faktor* dari luas, tetapi soal menyatakannya sebagai **panjang** pita (dm). Tidak ada alasan dalam cerita mengapa panjang pita harus sama dengan FPB dua luas — hubungannya dipaksakan, sehingga siswa yang bernalar kontekstual bisa bingung (bertentangan dengan EL05).
- **Usulan perbaikan (pilih salah satu):**
  - **(a) Lebar meja yang sama** — "Kedua meja berbentuk persegi panjang dan **lebarnya sama**. Lebar itu adalah bentuk aljabar terbesar yang menjadi faktor dari L₁ dan L₂. Pita dipasang di sepanjang sisi lebar meja. Tentukan panjang pita dan panjang masing-masing meja." → lebar = 3x dm, panjang meja A = (2x + 4) dm, meja B = (3x + 5) dm. Satuan konsisten. *Konsekuensi rubrik:* Tahap 2 menerima 6x(x + 2) **atau** 3x(2x + 4) untuk L₁.
  - **(b) Pertahankan soal, ubah kalimat** — hapus kata "pita", tanyakan "faktor persekutuan terbesar dari kedua luas" tanpa klaim satuan panjang. Konteks menjadi lebih lemah tetapi tidak salah.
- **Rekomendasi:** (a).

### E-2 🔴 Soal 2 (Versi B): bentuk faktor sudah tertulis di soal
- **Masalah:** Soal menyebut "persegi panjang baru dengan ukuran panjang (y + 3) meter dan lebar (y − 3) meter". Tahap 5 dan 6 (menemukan (y+3)(y−3)) menjadi **menyalin** dari soal, sehingga indikator *Formulating* tidak terukur penuh (2 dari 6 poin bisa diperoleh tanpa bernalar).
- **Usulan:** ganti kalimat itu dengan "Sisa lahan bunga akan disusun ulang menjadi sebuah persegi panjang. Tentukan model luas lahan bunga dalam bentuk selisih luas dan bentuk perkalian faktor, lalu tentukan panjang dan lebar persegi panjang tersebut." (pola ini sama dengan Soal 2 Versi A).

### E-3 🟡 Soal 4 (Versi B): kewajaran ukuran dan alasan usulan
- **Masalah 1:** Contoh di rubrik x = 5 → karpet **9 m × 1 m**; x = 6 → **10 m × 2 m (20 m²)**. Ukuran ini tidak realistis untuk "pojok baca", padahal soal justru menguji *kewajaran*.
- **Masalah 2:** Alasan "x = 3 karena menghasilkan bilangan bulat" lemah — setiap bilangan bulat x menghasilkan bilangan bulat.
- **Usulan:** ubah satuan ke **dm**: luas (x² − 16) dm², usulan x = 3 dm; contoh wajar x = 20 → 24 dm × 16 dm (2,4 m × 1,6 m). Ganti alasan menjadi "karena angkanya kecil sehingga karpetnya murah". Rubrik Tahap 5–6 menerima **semua** bilangan bulat x > 4 dengan perhitungan benar.

### E-4 🟡 Soal 1 (Versi B): domain x untuk benda yang dihitung
- **Masalah:** Banyak buku dan kantong harus bilangan cacah, tetapi syaratnya "x > 0" (mengizinkan x = 0,3).
- **Usulan:** "(dengan x bilangan asli)".

### E-5 🔴 Rubrik: tahap bernilai 2 poin belum punya kriteria skor 1
- Soal 1 Tahap 2, Soal 3 Tahap 2 dan Tahap 3 bernilai 2 poin, tetapi tidak dijelaskan kapan siswa mendapat 1 poin. Penilai berbeda bisa memberi skor berbeda (reliabilitas antar-penilai turun).
- **Usulan:** lihat tabel sub-kriteria di ASSESSMENT_PLAN §4.2 (misal Soal 3 Tahap 2: 1 poin per bentuk faktor yang benar).

### E-6 🟡 Versi B tidak memuat pedoman umum penskoran
- Versi A memuat bagian C (prinsip skor parsial, kriteria skor 0, rumus Nilai = skor/24 × 100). **Usulan:** pakai bagian C Versi A untuk Versi B.

### E-7 🟡 Judul topik menyebut "Bentuk Kuadrat Sederhana", tetapi Versi B tidak mengujinya
- Header Versi B: "Hukum Distributif/FPB, Selisih Dua Kuadrat, **dan Bentuk Kuadrat Sederhana**". Tidak ada soal x² + bx + c di Versi B (berbeda dengan Versi A). Struktur World yang Anda minta juga tidak memuat trinomial. **Perlu keputusan** (F-2).

## F. Keputusan peneliti (12 November 2026)

| ID | Pertanyaan | Keputusan |
|----|-----------|-----------|
| F-1 | Versi instrumen | **Versi B** untuk pretest **dan** posttest (soal sama). Versi A **tidak** dipakai. Bentuk paralel tidak dibuat |
| F-2 | Trinomial x² + bx + c | **Tidak** masuk cakupan (termasuk tidak ada "Pulau Bonus") |
| F-3 | Pembagian suku tunggal di World 1 | **Disetujui**, bertahap, visual, interaktif; tidak masuk ke pembagian kompleks |
| F-4 | Perbaikan instrumen | Perbaikan soal 2, 3, 4 dan rubrik **disetujui secara prinsip**; draf revisi di [INSTRUMEN_REVISI_VERSI_B.md](INSTRUMEN_REVISI_VERSI_B.md) **menunggu pemeriksaan akhir** sebelum dipakai di aplikasi. E-4 (soal 1) tidak termasuk persetujuan |
| F-5 | Bentuk TATA | **Robot kubus toska dengan antena tunas daun**, 3D ringan, ekspresi + narasi bila memungkinkan |
| F-6 | Tujuan penggunaan | Proyek kuliah + demonstrasi + **uji coba terbatas**. Tes, penyimpanan jawaban, penilaian, dan progres wajib berfungsi; backend sederhana & gratis (Supabase free tier) |
| F-7 | Cara menjawab uraian | Default tetap (ketik + papan ketik matematika); foto coretan **ditunda** (bukan fitur inti) |
| F-8 | Kurikulum | Dokumen menyusul. Materi **tidak boleh dinyatakan terverifikasi kurikulum** sampai dokumen diperiksa |
| F-9 | Penyedia AI | Ditunda — AI dikerjakan setelah fitur inti |
| F-10 | Tenggat | Belum ditetapkan → kerjakan fitur inti dulu sesuai urutan prioritas peneliti |
| F-11 | Gambar referensi | Hanya **inspirasi** gaya, komposisi, dan palet. Aset final dibuat sendiri atau berlisensi jelas |

## G. Catatan kesesuaian kurikulum — **BELUM TERVERIFIKASI**

- Tidak ada dokumen kurikulum yang dilampirkan. Pada beberapa buku, pemfaktoran selisih dua kuadrat dan trinomial ditempatkan di kelas VIII atau IX, bukan kelas VII semester 1. **Bukti yang ada** (wawancara K01 dan foto buku hlm. 94–97) menunjukkan buku yang dipakai sekolah memuat distributif dan selisih dua kuadrat di kelas VII. Mohon kirim **CP/ATP atau daftar isi buku** untuk verifikasi, termasuk apakah bab ini memang di **semester 1**.
- Pecahan aljabar (disebut di IL04) **tidak** dimasukkan ke cakupan.

## H. Catatan gambar referensi

- Gambar referensi **tidak memuat objek gurun** — isinya sudah dunia matematika (pulau melayang, algebra tiles, simbol +, −, ×). Instruksi "ganti objek gurun" saya tafsirkan sebagai: pertahankan arah visual gambar ini.
- Area atas (langit) cukup kosong untuk logo/judul ✔; area bawah (bukit) untuk tombol ✔; tidak ada teks acak ✔.
- Lisensi gambar belum pasti → **hanya dipakai sebagai inspirasi** (F-11). Latar final digambar ulang sebagai SVG orisinal (lihat ASSET_GUIDE).
