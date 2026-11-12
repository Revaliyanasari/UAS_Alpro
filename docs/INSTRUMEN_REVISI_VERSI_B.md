# Instrumen Literasi Matematis — Versi B Revisi 2

> **Status: Revisi 2 — dasar sementara yang disetujui peneliti (12 Nov 2026).** Persetujuan akhir dilakukan sebelum Fase 5. Dikonfirmasi: L₁ = 2x(3x + 6) tidak diberi skor; batas karpet lebar ≥ 10 dm, panjang ≤ 30 dm. Kunci jawaban sudah diuji oleh mesin pemeriksa aplikasi (`frontend/src/math/instrument-keys.test.js`).
> Perubahan Revisi 2: Soal 1 memakai "x bilangan asli"; Soal 1 T2 memberi skor 1 untuk 4(2x² + 3x); Soal 3 menerima lebih dari satu bentuk faktor yang sesuai konteks; Soal 4 diberi batas ukuran karpet yang realistis.
> Dasar: Instrumen Versi B (`Instrumen_Soal_Mathematical_Literacy_Pemfaktoran_Aljabar.pdf`) + keputusan peneliti tanggal 12 November 2026 (perbaikan soal 2, 3, 4 dan penyempurnaan rubrik disetujui).
> Materi: Pemfaktoran Bentuk Aljabar (hukum distributif/FPB dan selisih dua kuadrat) · Jenjang: SMP Kelas VII · 4 soal uraian kontekstual · Skor maksimum 24.
> Kesesuaian dengan CP/ATP sekolah **belum diverifikasi** (menunggu dokumen kurikulum).

---

## A. Ringkasan perubahan dari Versi B asli

| Soal | Bagian yang diubah | Alasan | Dampak pada kemampuan yang diukur & tingkat kesulitan |
|------|--------------------|--------|--------------------------------------------------------|
| 1 | Syarat "x > 0" diganti "**x bilangan asli**"; rubrik diperjelas (kriteria skor 1 pada Tahap 2, syarat Tahap 4) | Banyak buku dan kantong harus bilangan asli; rubrik tahap bernilai 2 belum punya kriteria skor 1 | Tidak berubah |
| 2 | Kalimat yang menyebut ukuran "(y + 3) meter dan (y − 3) meter" dihapus; siswa diminta menentukan sendiri panjang dan lebar | Pada versi asli, bentuk faktor sudah tertulis di soal sehingga Tahap 5–6 cukup disalin | Indikator *Formulating* kembali terukur penuh. Soal menjadi sesuai dengan tingkat kesulitan yang **dimaksud** rubrik asli (sedikit lebih menuntut daripada teks asli yang "membocorkan" jawaban) |
| 3 | Konteks diperjelas: kedua meja berbentuk persegi panjang dengan **lebar yang sama**, dan pita dipasang **sepanjang sisi lebar** meja | Versi asli menyatakan "panjang pita = FPB dari dua luas" tanpa alasan dalam cerita; satuan luas (dm²) dan panjang (dm) tidak terhubung | Prosedur, angka (6x² + 12x dan 9x² + 15x), jawaban (3x dm), dan tahapan **tetap sama**. Hanya logika konteks dan satuan yang diperbaiki |
| 4 | Satuan diubah dari **meter** menjadi **desimeter**; alasan usulan x = 3 diganti menjadi "angkanya kecil sehingga karpetnya murah"; ditambah **batas ukuran nyata** pojok baca: lebar paling sedikit 10 dm, panjang paling banyak 30 dm | Dengan meter, selisih panjang dan lebar selalu 8 m sehingga karpet pojok baca tidak pernah wajar. Tanpa batas ukuran, jawaban x = 5 (karpet 9 dm × 1 dm) benar secara matematis tetapi tidak realistis | Prosedur, angka (x² − 16, x = 3), 6 tahap, dan skor **tetap sama**. Tahap 6 kini menuntut siswa memeriksa batas ukuran (sesuai indikator *Interpreting & Evaluating*) — sedikit lebih menuntut daripada versi asli |
| Rubrik | Setiap tahap diberi kriteria skor yang eksplisit, contoh jawaban yang diterima/tidak diterima, dan pedoman umum (diadaptasi dari bagian C Versi A) | Konsistensi antarpenilai | Struktur tahap dan skor maksimum **tidak berubah** (6 + 6 + 6 + 6 = 24) |

Prinsip penerimaan bentuk jawaban (Revisi 2): jawaban **tidak terpaku pada satu bentuk**. Setiap bentuk yang ekuivalen dan sesuai dengan informasi soal serta bentuk yang diminta diterima; bentuk yang ekuivalen tetapi belum paling sederhana mendapat skor parsial bila tahapnya bernilai 2.

---

## B. Kisi-kisi

| No | Indikator literasi matematis | Indikator soal | Materi | Konteks | Bentuk | Skor |
|----|------------------------------|----------------|--------|---------|--------|------|
| 1 | Mathematical Reasoning | Membandingkan dua alternatif hasil pembagian bentuk aljabar, menentukan yang benar, dan memberi alasan matematis letak kesalahan | Pemfaktoran dengan FPB (distributif); pembagian suku tunggal | Pembagian buku tulis ke kantong plastik | Uraian | 6 |
| 2 | Formulating Situations Mathematically | Mengidentifikasi besaran pada situasi luas, menyusun model selisih luas, lalu menerjemahkannya menjadi bentuk perkalian faktor dan ukuran persegi panjang | Selisih dua kuadrat | Taman bunga dengan kolam di sudut | Uraian | 6 |
| 3 | Employing Mathematical Concepts, Facts, and Procedures | Memfaktorkan dua bentuk aljabar dengan FPB dan menentukan FPB dari kedua bentuk untuk memperoleh ukuran | FPB bentuk aljabar; pemfaktoran distributif | Pita pada meja pameran | Uraian | 6 |
| 4 | Interpreting, Applying, and Evaluating Mathematical Outcomes | Memeriksa pemfaktoran, mensubstitusi nilai, menilai kewajaran hasil dalam konteks, dan menentukan nilai yang wajar | Selisih dua kuadrat; substitusi | Ukuran karpet pojok baca | Uraian | 6 |
| | | | | | **Total** | **24** |

---

## C. Soal, tahapan penyelesaian, kunci jawaban, dan rubrik

### SOAL 1 — Mathematical Reasoning (direvisi: syarat x)

> **Pembagian Paket Alat Tulis Kelas.**
> Pengurus kelas memiliki persediaan buku tulis sebanyak (8x² + 12x) buah yang akan dimasukkan ke dalam beberapa kantong plastik secara merata. Setiap kantong plastik diisi sebanyak 4x buah buku tulis (dengan x bilangan asli).

*Perbandingan:* versi asli "(dengan x > 0)".
> Dua orang pengurus kelas menghitung banyak kantong plastik yang dibutuhkan:
> • Jawaban Dinda: (2x + 3) kantong
> • Jawaban Rafa: (2x + 12) kantong
> Jawaban siapa yang benar? Jelaskan alasan matematis Anda.

**Kunci jawaban**
1. Banyak kantong = total buku : isi tiap kantong = (8x² + 12x) : 4x.
2. FPB dari 8x² dan 12x: FPB(8, 12) = 4; variabel x² dan x → x; FPB = 4x.
   8x² : 4x = 2x dan 12x : 4x = 3, sehingga 8x² + 12x = 4x(2x + 3). Banyak kantong = (2x + 3).
3. Uji Rafa: 4x(2x + 12) = 8x² + 48x ≠ 8x² + 12x.
4. Jawaban Dinda benar.
5. Rafa hanya membagi suku pertama (8x² : 4x = 2x) tetapi tidak membagi suku kedua; seharusnya 12x : 4x = 3, bukan tetap 12.

**Rubrik**

| Tahap | Kriteria | Skor | Contoh diterima | Contoh tidak diterima |
|-------|----------|------|-----------------|-----------------------|
| T1 — Memahami masalah & hubungan matematis | Menuliskan bahwa banyak kantong = (8x² + 12x) : 4x, **atau** banyak kantong × 4x = 8x² + 12x | 1 | "kantong = (8x²+12x)/4x"; "k · 4x = 8x² + 12x" | (8x² + 12x) × 4x; hanya menyalin data soal |
| | Tidak ada / hubungan salah | 0 | | |
| T2 — Menerapkan pemfaktoran FPB | FPB 4x benar **dan** 8x² : 4x = 2x **dan** 12x : 4x = 3 (atau tertulis 4x(2x + 3)) — **atau** jalur alternatif: menguji kedua jawaban dengan perkalian dan **kedua** hasil perkalian benar (8x² + 12x dan 8x² + 48x) | 2 | 4x(2x+3); "4x · (2x+3) = 8x²+12x dan 4x · (2x+12) = 8x²+48x" | |
| | Hanya sebagian benar: **pemfaktoran sebagian** yang ekuivalen tetapi belum memakai FPB terbesar (mis. 4(2x² + 3x), 2x(4x + 6)); **atau** FPB 4x benar tetapi salah satu pembagian keliru; **atau** menulis 4x(2x + 3) / (2x + 3) tanpa langkah; **atau** jalur alternatif dengan hanya satu perkalian benar | 1 | 4(2x² + 3x); "FPB 4x, 8x²:4x = 2x, 12x:4x = 4" | |
| | Tidak ada langkah pemfaktoran/perkalian yang benar | 0 | | 4x(2x + 12) tanpa langkah lain; bentuk yang tidak ekuivalen |
| T3 — Membandingkan alternatif | Menyatakan secara eksplisit perbandingan hasil dengan **kedua** jawaban (hasil = jawaban Dinda; jawaban Rafa ≠ hasil, atau 8x² + 48x ≠ 8x² + 12x) | 1 | "Hasilnya 2x+3 sama dengan Dinda, beda dengan Rafa" | Hanya membahas satu tokoh |
| | Tidak membandingkan | 0 | | |
| T4 — Menentukan keputusan | Menyimpulkan **Dinda benar**, dan keputusan ini didukung minimal satu tahap T1–T3 yang memperoleh skor | 1 | "Jadi yang benar Dinda" | "Dinda" tanpa proses apa pun |
| | Keputusan salah, tidak ada, atau tanpa dukungan proses | 0 | | |
| T5 — Alasan matematis | Menunjukkan letak kesalahan Rafa secara spesifik: suku 12x tidak dibagi 4x (seharusnya 3) | 1 | "Rafa lupa membagi 12x dengan 4x, harusnya 3" | "Rafa salah hitung" (terlalu umum) |
| | Alasan tidak ada / tidak spesifik | 0 | | |
| | | **Maks 6** | | |

> Catatan T2 (keputusan peneliti): 4(2x² + 3x) mendapat **1** karena siswa sudah memfaktorkan sebagian dengan benar, meskipun belum sampai bentuk paling sederhana 4x(2x + 3).

---

### SOAL 2 — Formulating Situations Mathematically (direvisi)

> **Pembuatan Taman Bunga Halaman Sekolah.**
> Siswa kelas VII membuat taman bunga berbentuk persegi dengan panjang sisi y meter (dengan y > 3). Di salah satu sudut taman dibuat kolam ikan kecil berbentuk persegi dengan panjang sisi 3 meter. Sisa lahan taman ditanami bunga.
> Pada denah sekolah, lahan bunga tersebut akan digambar sebagai sebuah persegi panjang yang luasnya sama dengan luas lahan bunga, dengan panjang dan lebar berupa bentuk aljabar dalam y.
> Tuliskan model matematika luas lahan bunga dalam bentuk selisih luas dan bentuk perkalian faktor aljabarnya, lalu tentukan panjang dan lebar persegi panjang pada denah tersebut.

*Perbandingan:* versi asli menuliskan "persegi panjang baru dengan ukuran panjang (y + 3) meter dan lebar (y − 3) meter" — kalimat ini dihapus.

**Kunci jawaban**
1. Diketahui: sisi taman = y m (y > 3), sisi kolam = 3 m. Ditanya: model luas lahan bunga (selisih & faktor), panjang dan lebar persegi panjang.
2. Luas taman = y × y = y² m².
3. Luas kolam = 3 × 3 = 9 m².
4. Luas lahan bunga = y² − 9 (m²).
5. y² − 9 = y² − 3² = (y + 3)(y − 3) (selisih dua kuadrat, a = y, b = 3).
6. Model: (y² − 9) m² = (y + 3)(y − 3) m²; panjang = (y + 3) m, lebar = (y − 3) m.

**Rubrik**

| Tahap | Kriteria skor 1 | Contoh tidak diterima (skor 0) |
|-------|-----------------|---------------------------------|
| T1 — Identifikasi informasi | Menuliskan **kedua** besaran yang diketahui (sisi taman y, sisi kolam 3) **dan** yang ditanyakan — boleh berupa gambar berlabel | Hanya satu besaran; tidak menuliskan yang ditanya |
| T2 — Luas taman | Luas taman = y² (boleh y × y) | 4y (keliling); 2y |
| T3 — Luas kolam | Luas kolam = 9 (boleh 3 × 3) | 6; 12 |
| T4 — Model selisih luas | Luas lahan bunga = y² − 9 | y² + 9; 9 − y²; (y − 3)² |
| T5 — Bentuk faktor | y² − 9 = (y + 3)(y − 3) (urutan faktor bebas) | (y − 3)(y − 3); (y − 3)²; (y + 9)(y − 9) |
| T6 — Menafsirkan ke ukuran | Panjang (y + 3) m dan lebar (y − 3) m, ditulis sebagai kesimpulan bersama kedua bentuk model. Tertukarnya sebutan panjang/lebar tidak mengurangi skor | Hanya menulis satu ukuran; ukuran tidak berasal dari faktor (mis. panjang y² − 9, lebar 1) |
| | **Maks 6** (setiap tahap 1 poin) | |

*Tindak lanjut:* T5 dan T6 hanya diberi skor jika bentuk faktor dan ukuran yang ditulis siswa benar untuk luas lahan bunga y² − 9. Jika T4 salah (mis. y² + 9), T5 dan T6 bernilai 0, tetapi T1–T3 tetap dinilai.

---

### SOAL 3 — Employing Mathematical Concepts, Facts, and Procedures (direvisi)

> **Pemasangan Pita pada Meja Pameran.**
> Dua kelompok siswa menghias meja pameran kelas. Kedua meja berbentuk persegi panjang. Meja Kelompok A memiliki luas permukaan L₁ = (6x² + 12x) dm², sedangkan meja Kelompok B memiliki luas permukaan L₂ = (9x² + 15x) dm² (dengan x > 0).
> Kedua meja memiliki **lebar yang sama**, yaitu Faktor Persekutuan Terbesar (FPB) dari L₁ dan L₂. Pada setiap meja akan dipasang pita sepanjang sisi lebarnya.
> Tentukan bentuk aljabar panjang pita untuk satu meja dan nyatakan bentuk faktor dari masing-masing luas meja.

*Perbandingan:* versi asli: "Mereka akan memasang pita pembatas yang panjangnya sama dengan FPB dari L₁ dan L₂." Angka, pertanyaan, dan jawaban tetap.

**Kunci jawaban**
1. Strategi: faktorkan setiap luas dengan FPB suku-sukunya (distributif ab + ac = a(b + c)), lalu cari FPB kedua bentuk.
2. L₁ = 6x² + 12x = 6x(x + 2); L₂ = 9x² + 15x = 3x(3x + 5).
3. FPB koefisien 6 dan 9 = 3; variabel pangkat terkecil yang sama = x → FPB(L₁, L₂) = 3x. (Faktor (x + 2) dan (3x + 5) tidak memiliki faktor persekutuan.)
4. Panjang pita = lebar meja = 3x dm; L₁ = 6x(x + 2) dm², L₂ = 3x(3x + 5) dm².
   *(Informasi tambahan, tidak dinilai: panjang meja A = 2x + 4 dm, meja B = 3x + 5 dm.)*

**Rubrik**

| Tahap | Kriteria | Skor | Contoh diterima | Contoh tidak diterima |
|-------|----------|------|-----------------|-----------------------|
| T1 — Memilih konsep & strategi | Menuliskan strategi (memfaktorkan dengan FPB / distributif lalu mencari FPB kedua luas) **atau** langsung menerapkan pemfaktoran dengan mengeluarkan faktor persekutuan pada minimal satu luas | 1 | "Faktorkan L₁ dan L₂ lalu cari FPB-nya" | Menjumlahkan L₁ + L₂; mengalikan L₁ × L₂ |
| | Tidak ada strategi yang relevan | 0 | | |
| T2 — Memfaktorkan L₁ dan L₂ | **Kedua** bentuk faktor benar: L₁ = 6x(x + 2) **atau** 3x(2x + 4), **dan** L₂ = 3x(3x + 5) | 2 | L₁ = 6x(x + 2) (FPB suku-sukunya) atau 3x(2x + 4) (sesuai konteks lebar meja 3x) — keduanya benar | |
| | **Satu** bentuk faktor benar | 1 | | |
| | Keduanya salah atau tidak ada | 0 | | 6(x² + 2x) dan 3(3x² + 5x) (variabel tidak dikeluarkan) → dihitung salah |
| T3 — Menentukan FPB kedua bentuk | FPB = 3x, dengan koefisien 3 **dan** variabel x benar (dari bentuk faktor atau langsung dari keempat suku) | 2 | 3x | |
| | Hanya satu komponen benar | 1 | 3; x; 3x²; 6x (lihat catatan) | |
| | Keduanya salah atau tidak ada | 0 | | |
| T4 — Solusi akhir | Menyimpulkan panjang pita 3x dm **dan** menyebut bentuk faktor kedua luas | 1 | "Panjang pita 3x dm, L₁ = 6x(x+2), L₂ = 3x(3x+5)" | Hanya "3x" tanpa bentuk faktor |
| | Tidak lengkap / salah | 0 | | |
| | | **Maks 6** | | |

> Catatan T2: diterima bentuk yang (a) mengeluarkan FPB suku-sukunya, **atau** (b) mengeluarkan lebar meja 3x sesuai informasi soal. Bentuk L₁ = 2x(3x + 6) atau x(6x + 12) ekuivalen tetapi tidak memenuhi (a) maupun (b) → **tidak diterima** untuk L₁ tersebut (dikonfirmasi peneliti).
> Catatan T3: "3x²" (koefisien benar, pangkat salah) → 1; "6x" (koefisien salah, variabel benar) → 1; "x" saja → 1; "3" saja → 1.
> Satuan dm tidak dinilai terpisah (lihat pedoman umum D-5).

---

### SOAL 4 — Interpreting, Applying, and Evaluating Mathematical Outcomes (direvisi)

> **Ukuran Karpet Ruang Baca Kelas.**
> Wali kelas ingin membeli karpet berbentuk persegi panjang untuk pojok baca dengan luas (x² − 16) dm². Bentuk luas tersebut dapat difaktorkan menjadi panjang (x + 4) desimeter dan lebar (x − 4) desimeter. Agar muat di pojok baca dan nyaman diduduki beberapa siswa, lebar karpet paling sedikit 10 dm dan panjangnya paling banyak 30 dm.
> Seorang siswa mengusulkan nilai x = 3 desimeter karena angkanya kecil sehingga karpetnya murah. Apakah usulan nilai x = 3 desimeter tersebut masuk akal untuk ukuran karpet nyata? Berikan alasan matematis Anda dan tentukan satu nilai bilangan bulat x yang dapat digunakan beserta ukuran panjang dan lebar karpetnya.

*Perbandingan:* versi asli memakai satuan meter, alasan "karena menghasilkan bilangan bulat", dan tidak memiliki batas ukuran.

**Kunci jawaban**
1. (x + 4)(x − 4) = x² − 4x + 4x − 16 = x² − 16 ✔ (atau x² − 16 = x² − 4² = (x + 4)(x − 4)).
2. x = 3: panjang = 3 + 4 = 7 dm; lebar = 3 − 4 = −1 dm; luas = 3² − 16 = −7 dm².
3. Lebar −1 dm (dan luas −7 dm²) tidak mungkin, karena ukuran benda nyata harus positif.
4. Usulan x = 3 dm tidak masuk akal / tidak dapat diterima.
5. Agar lebar positif: x − 4 > 0 → x > 4 (panjang x + 4 juga otomatis positif). Agar sesuai pojok baca: lebar x − 4 ≥ 10 → x ≥ 14, dan panjang x + 4 ≤ 30 → x ≤ 26. Jadi nilai bulat yang wajar: 14 ≤ x ≤ 26.
6. Contoh: x = 20 → panjang 24 dm, lebar 16 dm (2,4 m × 1,6 m), luas 384 dm² = 20² − 16 ✔. (Setiap bilangan bulat 14 ≤ x ≤ 26 dengan perhitungan benar diterima, mis. x = 14 → 18 dm × 10 dm; x = 26 → 30 dm × 22 dm.)

**Rubrik**

| Tahap | Kriteria skor 1 | Contoh tidak diterima (skor 0) |
|-------|-----------------|---------------------------------|
| T1 — Memeriksa pemfaktoran | Menunjukkan **proses** pemeriksaan: mengalikan (x + 4)(x − 4) hingga x² − 16, **atau** menuliskan x² − 16 = x² − 4² = (x + 4)(x − 4) | Hanya menulis "benar" tanpa proses |
| T2 — Substitusi x = 3 | Menghitung lebar = −1 (boleh disertai panjang 7 dan/atau luas −7) | Lebar = 1 (tanda salah); hanya menghitung panjang |
| T3 — Menilai kewajaran | Menyatakan bahwa ukuran (lebar/luas) negatif tidak mungkin untuk benda nyata | "Tidak masuk akal karena terlalu kecil" (alasan tidak terkait tanda negatif) |
| T4 — Keputusan evaluasi | Menyatakan usulan x = 3 dm **tidak dapat diterima**, didukung T2 atau T3 | Menyetujui usulan; keputusan tanpa alasan |
| T5 — Syarat nilai x | Menuliskan syarat dari ukuran positif x > 4 (atau "x ≥ 5" untuk bilangan bulat), **atau** langsung menuliskan syarat wajar 14 ≤ x ≤ 26 | x > 3; x > −4; x ≥ 4 |
| T6 — Ukuran karpet nyata | Memilih satu bilangan bulat x dengan **14 ≤ x ≤ 26** (lebar ≥ 10 dm, panjang ≤ 30 dm) dan menghitung panjang **dan** lebar dengan benar | x = 5 (9 dm × 1 dm: lebar < 10 dm); x = 30 (34 dm: panjang > 30 dm); x = 4 (lebar 0); perhitungan salah; hanya satu ukuran |
| | **Maks 6** (setiap tahap 1 poin) | |

*Tindak lanjut:* T6 tetap diberi 1 jika T5 salah tetapi nilai x yang dipilih memenuhi 14 ≤ x ≤ 26 dan perhitungannya benar.

---

## D. Pedoman umum penskoran (diadaptasi dari bagian C Versi A)

1. **Skor parsial:** setiap tahap dinilai terpisah. Tahap yang benar tetap mendapat skor walaupun tahap sesudahnya salah.
2. **Skor 0 untuk satu soal** jika lembar jawaban kosong, hanya menyalin informasi soal, atau seluruh langkah tidak relevan dengan pemfaktoran bentuk aljabar.
3. **Jawaban akhir tanpa proses:** tahap keputusan/kesimpulan (Soal 1 T4, Soal 4 T4) hanya diberi skor jika didukung minimal satu tahap proses yang memperoleh skor.
4. **Bentuk setara diterima:** urutan faktor, urutan suku, dan notasi berbeda yang ekuivalen diterima (mis. (y − 3)(y + 3); 4x · (2x + 3); 8x²/4x).
5. **Satuan** tidak dinilai sebagai tahap terpisah; satuan yang hilang atau keliru tidak mengurangi skor.
6. **Kesalahan hitung kecil** pada tahap yang tidak menjadi fokus tahap tersebut tidak mengurangi skor tahap itu, tetapi tahap yang secara langsung menilai perhitungan tersebut mendapat skor sesuai rubrik.
7. **Nilai akhir** = (skor perolehan / 24) × 100. Skor per indikator = skor soal yang bersangkutan (maks 6).
8. Jika dua penilai berbeda pendapat pada satu tahap, keputusan diambil dengan merujuk kolom "contoh diterima/tidak diterima"; kasus baru dicatat dan ditambahkan ke rubrik.

## E. Rekapitulasi skor

| No | Indikator | Rincian tahap | Maks |
|----|-----------|---------------|------|
| 1 | Mathematical Reasoning | T1 (1), T2 (2), T3 (1), T4 (1), T5 (1) | 6 |
| 2 | Formulating Situations Mathematically | T1–T6 (masing-masing 1) | 6 |
| 3 | Employing Concepts, Facts, and Procedures | T1 (1), T2 (2), T3 (2), T4 (1) | 6 |
| 4 | Interpreting, Applying, and Evaluating | T1–T6 (masing-masing 1) | 6 |
| | **Total** | | **24** |

## F. Pemeriksaan matematis yang sudah dilakukan

- 4x(2x + 3) = 8x² + 12x ✔; 4x(2x + 12) = 8x² + 48x ✔
- (y + 3)(y − 3) = y² − 9 ✔
- 6x(x + 2) = 6x² + 12x ✔; 3x(3x + 5) = 9x² + 15x ✔; 3x(2x + 4) = 6x² + 12x ✔; FPB = 3x ✔ ((x + 2) dan (3x + 5) tidak memiliki faktor persekutuan)
- 4(2x² + 3x) = 8x² + 12x ✔ (ekuivalen, faktor belum terbesar)
- (x + 4)(x − 4) = x² − 16 ✔; x = 3 → 7, −1, −7 ✔; x = 20 → 24 × 16 = 384 = 20² − 16 ✔; batas 14 ≤ x ≤ 26 ✔

Semua kunci ini diuji otomatis oleh pemeriksa aljabar aplikasi (`frontend/src/math/instrument-keys.test.js`).
