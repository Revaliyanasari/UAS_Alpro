# Rencana Konten — Algebra Adventure

> Semua contoh di bawah sudah diperiksa secara aritmetika. Konten final disimpan sebagai data JSON di `frontend/src/content/` (lihat TECHNICAL_ARCHITECTURE §4) agar mudah direvisi tanpa mengubah kode.
> Soal instrumen pretest/posttest **tidak** dipakai di sini (lihat ASSESSMENT_PLAN).

## World 0 — Welcome to Algebra Adventure

| Layar | Isi |
|-------|-----|
| Welcome | Logo, "Algebra Adventure", tagline, TATA melambai, tombol **Mulai Petualangan**; tautan kecil **Masuk Guru** |
| Gabung kelas | Isi **kode kelas** + **kode siswa** (mis. S01) agar hasil tersimpan untuk guru; pilihan "Coba tanpa kelas" untuk demo (data hanya di perangkat) |
| Kenalan TATA (1) | "Halo, teman-teman! Kenalin, nama aku TATA — Teman Asyik Temukan Aljabar!" |
| Kenalan TATA (2) | "Aku akan menemani kalian menjelajahi dunia aljabar: mengenali bentuk aljabar, menemukan faktor, dan menyelesaikan tantangan seru." |
| Cara pakai (3 kartu) | ① Ketuk *Lanjut* sesuai kecepatanmu ② Tombol 💡 untuk petunjuk kecil ③ Tombol ✔ *Cek* untuk memeriksa jawaban |
| Nama panggilan | Isian opsional (tanpa nama lengkap) |
| Ajakan | "Siap memulai petualangan kita?" → Pretest |

## World 1 — Lembah Aljabar (Mengenal Dunia Aljabar)

**Misi:** "Kenali bagian-bagian bentuk aljabar dan temukan FPB-nya."

| Pelajaran mikro | Isi inti | Aktivitas interaktif |
|-----------------|----------|----------------------|
| 1.1 Variabel & konstanta | Variabel = huruf pengganti bilangan yang belum diketahui; konstanta = bilangan tanpa variabel | Ketuk bagian 3x + 5 yang merupakan variabel/konstanta |
| 1.2 Koefisien | Angka di depan variabel; x berarti 1x | **Sortir:** seret 7x, −2y, 5, x² ke keranjang "koefisien = …" |
| 1.3 Suku & suku sejenis | Suku dipisahkan + / −; sejenis = variabel & pangkat sama | **Kelompokkan:** seret 4x, 3x², −x, 9, 2x², 5 ke kelompok sejenis |
| 1.4 Perkalian suku | 4x × 2x = 8x²; ubin: x × x membentuk persegi x² | Algebra tiles: bentuk persegi panjang 2x × 3 → hitung luas 6x |
| 1.5 FPB bilangan | FPB 8 & 12 = 4 lewat daftar faktor | Ketuk faktor bersama dari dua daftar |
| 1.6 Pembagian suku tunggal *(disetujui, F-3)* | 8x² : 4x = 2x karena 4x × 2x = 8x². Bagi angka, lalu bagi variabel — rincian di bawah | **Mesin Pembagi** berbasis ubin (lihat spesifikasi 1.6) |
| 1.7 FPB suku aljabar | FPB 8x² & 12x = 4x (angka: 4, variabel: x) | Papan: pilih FPB dari dua suku |

### Spesifikasi pelajaran 1.6 — Pembagian suku tunggal

Tujuan: siswa memahami **mengapa** 8x² : 4x = 2x dan 12x : 4x = 3, bukan sekadar menghafal aturan. Pembagian dibatasi pada **suku tunggal dibagi suku tunggal** dengan hasil bulat; tidak ada pembagian polinomial atau pecahan aljabar.

| Layar | Ide (satu per layar) | Visual / interaksi |
|-------|----------------------|--------------------|
| 1 | Pembagian adalah kebalikan perkalian: 3 × 4 = 12, maka 12 : 4 = 3 | Persegi panjang 3 × 4 dari ubin satuan; siswa mengetuk sisi untuk melihat panjangnya |
| 2 | Hal yang sama berlaku untuk aljabar: 4x × 2x = 8x² | Persegi panjang dengan sisi 4x dan 2x tersusun dari **8 ubin x²** |
| 3 | Maka 8x² : 4x berarti "luasnya 8x², satu sisinya 4x — berapa sisi lainnya?" | Sisi 4x disorot; sisi lain diberi tanda "?" |
| 4 | Langkah 1 — **bagi angkanya:** 8 : 4 = 2 | Siswa mengisi kotak 8 : 4 = □ |
| 5 | Langkah 2 — **bagi variabelnya:** x² = x · x, dibagi x tinggal x | Animasi "x · x" lalu satu x dicoret; siswa mengisi x² : x = □ |
| 6 | Langkah 3 — **gabungkan:** 2 dan x → 2x. **Cek:** 4x × 2x = 8x² ✔ | Tombol "Cek dengan mengalikan" memperlihatkan persegi panjang terbentuk kembali |
| 7 | Contoh kedua: 12x : 4x. Angka: 12 : 4 = 3. Variabel: x : x = 1 (variabel "habis") → hasil **3** | 12 ubin x disusun 4 baris; sisi 4x, sisi lain 3 satuan |
| 8 | Ringkasan "Langkah Jitu Pembagian": ① bagi angka ② bagi variabel ③ gabung ④ cek dengan mengalikan | Kartu yang bisa dibuka lagi dari World 2–5 |

**Aktivitas "Mesin Pembagi":** siswa diberi kumpulan ubin (mis. 6 ubin x²) dan satu sisi yang sudah ditentukan (mis. 3x). Siswa menyeret ubin untuk membentuk persegi panjang dengan sisi tersebut, lalu sistem menampilkan sisi lainnya (2x) dan siswa mengisi 6x² : 3x = □. Mendukung seret (mouse/sentuh) dan ketuk-taruh.

**Latihan bertahap (semua hasil bulat):**
1. 6x : 3 = 2x (variabel tidak dibagi)
2. 10x : 5x = 2 (variabel habis)
3. 6x² : 2x = 3x
4. 15x² : 3x = 5x
5. 20y² : 4y = 5y

**Kesalahan yang dikenali & umpan balik:**

| Jawaban keliru | Kemungkinan penyebab | Umpan balik TATA |
|----------------|----------------------|------------------|
| 8x² : 4x = 4x | Mengurangkan angka (8 − 4) | "Coba lihat angkanya saja. 8 dibagi 4 berapa?" |
| 8x² : 4x = 2x² | Variabel tidak dibagi | "x² itu x · x. Kalau dibagi x, tinggal berapa x?" |
| 12x : 4x = 3x | Lupa variabel habis | "x dibagi x hasilnya 1. Jadi hasilnya masih punya x atau tidak?" |
| 8x² : 4x = 2 | Variabel dibagi habis semuanya | "Cek: 4x × 2 = 8x atau 8x²?" |

**Contoh TATA (lengkap):** FPB dari 6x² dan 9x → angka FPB(6,9)=3 → variabel x² & x → x → FPB = 3x.
**Contoh rumpang:** FPB dari 10y² dan 15y → angka □ → variabel □ → FPB □. (Jawab: 5, y, 5y)
**Latihan (bertingkat):** FPB 12 & 18 (6); FPB 4a & 6a (2a); FPB 14x² & 21x (7x); 20x² : 5x (4x); 18y : 6 (3y).
**Kuis Dunia 1 (5 soal):** PG koefisien dari −5x² (−5); B/S "3x dan 3x² suku sejenis" (Salah); isian FPB 16x² & 24x (8x); drag kelompok suku sejenis; isian 15x² : 3x (5x).

## World 2 — Gua Rahasia Pemfaktoran

**Misi:** "Ubah penjumlahan menjadi perkalian — temukan rahasia pemfaktoran!"

| Pelajaran mikro | Isi inti | Aktivitas |
|-----------------|----------|-----------|
| 2.1 Faktor itu apa? | 12 = 3 × 4; faktor = bilangan yang dikalikan | Susun 12 ubin satuan menjadi persegi panjang berbeda (1×12, 2×6, 3×4) |
| 2.2 Distributif | 3(x + 2) = 3x + 6 — ubin: persegi panjang 3 × (x + 2) | Tiles mode *Bangun*: lihat luas otomatis |
| 2.3 Pemfaktoran = kebalikan | 3x + 6 → 3(x + 2). Panah dua arah "kalikan ⇄ faktorkan" | Papan: geser panah, lihat dua bentuk setara |
| 2.4 Pemfaktoran dengan FPB | 6 "Langkah Jitu" (LEARNING_DESIGN §4.1) | Tiles mode *Bagi Sama* lalu *Bangun* |
| 2.5 Cek dengan mengalikan | Selalu kalikan kembali | Tombol ✔ Cek pada papan |
| 2.6 Siapa yang benar? | Dua tokoh menjawab berbeda | Pilih + pilih alasan |

**Contoh TATA (lengkap):** 8x² + 12x → FPB 4x → 8x² : 4x = 2x, 12x : 4x = 3 → **4x(2x + 3)** → cek: 4x·2x + 4x·3 = 8x² + 12x ✔.
**Contoh rumpang:** 6x² + 9x → FPB □ → 6x² : 3x = □ → 9x : 3x = □ → 3x(□ + □).
**Latihan bertingkat:** 5x + 10 = 5(x + 2); 4a + 6b = 2(2a + 3b); x² + 7x = x(x + 7); 10y² − 15y = 5y(2y − 3); 12x² + 18x = 6x(2x + 3).
**Siapa benar:** "Faktorkan 10x² + 5x." Ani: 5x(2x + 1); Budi: 5x(2x). → Ani; Budi lupa bahwa 5x : 5x = 1.
**Kuis Dunia 2:** PG 7x + 14; isian 9y² + 6y (3y(3y + 2)); B/S "2x(3x + 4) = 6x² + 8x" (Benar); tiles 6x² + 4x → 2x(3x + 2); siapa benar (M1).

### Spesifikasi aktivitas Algebra Tiles (World 2)

Soal utama: **8x² + 12x**. Wadah berisi 8 ubin x² (persegi besar, toska) dan 12 ubin x (persegi panjang, kuning).

- **Mode A — Bagi Sama (koefisien):** siswa membagi ubin ke dalam k kelompok identik. 4 kelompok masing-masing berisi 2 ubin x² dan 3 ubin x → tertulis 4(2x² + 3x). TATA: "Bagus! Angka 4 sudah keluar. Tapi lihat, setiap kelompok masih punya x…" → lanjut Mode B.
- **Mode B — Bangun Persegi Panjang (faktor lengkap):** siswa menyusun ubin di papan bergrid hingga membentuk persegi panjang penuh. Sistem membaca sisi: tinggi 4x (4 ruas x), lebar 2x + 3 (2 ruas x + 3 ruas satuan) → **4x(2x + 3)**. Susunan sah lain (mis. 2x × (4x + 6) atau x × (8x + 12)) diterima sebagai "benar tetapi belum terbesar" (M2).
- **Validasi:** semua ubin terpakai; tidak ada celah/tumpukan; setiap baris punya tinggi seragam & setiap kolom punya lebar seragam.
- **Petunjuk:** (1) "Ubin x² harus berkumpul di satu pojok." (2) "Coba 4 baris." (3) Garis bantu 4x × 2x digambar samar.
- **Alternatif tanpa drag:** ketuk ubin lalu ketuk sel tujuan.

## World 3 — Kepulauan Kuadrat (Misi Selisih Dua Kuadrat)

**Misi:** "Potong, geser, dan temukan rahasia a² − b²."

| Pelajaran mikro | Isi inti | Aktivitas |
|-----------------|----------|-----------|
| 3.1 Bilangan kuadrat | 1, 4, 9, 16, 25, … ; y² = y × y | Bangun persegi dari ubin satuan |
| 3.2 Persegi dikurangi persegi | Persegi a×a, pojoknya dipotong b×b → luas a² − b² | **Gunting:** seret pemotong ke pojok persegi |
| 3.3 Potong & pindah | Sisa berbentuk L dipotong menjadi dua persegi panjang; satu diputar & dipindah → persegi panjang (a + b) × (a − b) | **Animasi interaktif:** siswa menyeret potongan; sisi berlabel |
| 3.4 Rumus | a² − b² = (a + b)(a − b) — muncul **setelah** visual | Papan: isi a dan b |
| 3.5 Kenali bentuknya | Kedua suku kuadrat sempurna & dipisah tanda minus | Sortir: x² − 9 ✔, x² + 9 ✘ (tanda plus), x² − 7 ✘ (7 bukan bilangan kuadrat), 4y² − 1 ✔ |
| 3.6 Cek | (a + b)(a − b) dikalikan → suku tengah saling menghapus | Papan perkalian 2×2 |

**Contoh TATA:** x² − 25: a = x, b = 5 → (x + 5)(x − 5) → cek: x² − 5x + 5x − 25 = x² − 25 ✔.
**Contoh rumpang:** y² − 49 → a = □, b = □ → (□ + □)(□ − □).
**Latihan:** x² − 4; a² − 36; 4x² − 9 = (2x + 3)(2x − 3); 9y² − 16; "Benar/Salah: x² + 16 = (x + 4)(x − 4)" (Salah).
**Kuis Dunia 3:** 5 soal (PG, isian, B/S, puzzle visual luas, siapa benar M4).

## World 4 — Menara Tantangan

Empat lantai — siswa naik satu lantai setelah 3 soal benar (petunjuk boleh dipakai).

| Lantai | Level | Contoh soal |
|--------|-------|-------------|
| 1 | Pemahaman dasar | Faktorkan 14x + 21 → 7(2x + 3) |
| 2 | Penerapan konsep | Faktorkan 18a² − 12a → 6a(3a − 2); faktorkan 16 − y² → (4 + y)(4 − y) |
| 3 | Masalah sederhana | "Luas persegi panjang 15x² + 10x, lebarnya 5x. Panjangnya?" → 3x + 2 |
| 4 | Kontekstual | "Lantai aula persegi bersisi p meter. Panggung persegi bersisi 4 meter di pojok. Nyatakan luas sisa dalam bentuk faktor." → (p + 4)(p − 4) |

Puzzle Dunia 4: **Pasangkan** 6 kartu bentuk ↔ 6 kartu faktor (drag-and-drop; validasi langsung; kartu pengecoh memuat kesalahan M1, M2, M4).

## World 5 — Petualangan Literasi Matematis

Empat "misi", satu per indikator, dengan **konteks berbeda** dari instrumen. Jawaban dikerjakan bertahap dengan panel "Yang diketahui / Ditanya / Model / Hitung / Simpulkan" (scaffold ini **hanya** di latihan, tidak di pretest/posttest).

| Misi | Indikator | Konteks latihan (draf) | Kunci |
|------|-----------|------------------------|-------|
| 5.1 | Reasoning | Stiker (6x² + 18x) lembar dibagikan ke kelompok, tiap kelompok 6x lembar. Sari: (x + 3); Tono: (x + 18). Siapa benar? | Sari; 6x(x + 3) |
| 5.2 | Formulating | Lapangan persegi sisi k meter, pojok untuk pos jaga persegi 2 meter. Sisa disusun ulang menjadi persegi panjang. Modelkan. | k² − 4 = (k + 2)(k − 2) |
| 5.3 | Employing | Dua papan pengumuman berbentuk persegi panjang dengan luas (10x² + 15x) dm² dan (15x² + 5x) dm². Lebar kedua papan sama, yaitu faktor persekutuan terbesar dari kedua luas. Tentukan lebar dan panjang masing-masing papan. | 5x(2x + 3) dan 5x(3x + 1) → lebar 5x dm; panjang (2x + 3) dm dan (3x + 1) dm |
| 5.4 | Interpreting | ~~Kolam~~ → **Lahan parkir sepeda** (x² − 36) m² = (x + 6)(x − 6) (diganti 27 Nov 2026: "kolam" terlalu dekat dengan konteks instrumen Soal 2). Usulan x = 5. Wajar? Pilih x yang masuk akal. | Tidak wajar (lebar −1 m); x > 6, mis. x = 8 → 14 m × 2 m |

> Catatan 5.3: angka dipilih agar FPB berupa **suku tunggal** (5x). Pasangan seperti (8x² + 4x) dan (12x² + 6x) sengaja dihindari karena FPB-nya 2x(2x + 1) — terlalu sulit untuk kelas VII. Konteks "lebar sama" mengikuti usulan perbaikan E-1(a); jika E-1 tidak disetujui, konteks 5.3 tetap boleh dipakai karena ini soal latihan, bukan instrumen.

## Konten pendukung

| Jenis | Rencana | Status kepastian |
|-------|---------|------------------|
| Kartu "Langkah Jitu" | 2 kartu ringkas (FPB, selisih dua kuadrat), dapat dibuka dari mana saja | Pasti |
| Narasi suara | Salam, instruksi aktivitas, petunjuk, motivasi | Fase 1: suara sintetis browser; final: rekaman (ASSET_GUIDE) |
| "Video" demonstrasi | 3 animasi interaktif dalam aplikasi (≤ 60 dtk, dapat dijeda): (1) tiles 8x² + 12x, (2) potong-geser a² − b², (3) contoh soal cerita | Dibangun sebagai animasi kode (ringan, offline). Video MP4 hanya jika Anda merekam sendiri |
| Musik | 1 trek eksplorasi, 1 trek fokus (lebih tenang) | Lihat ASSET_GUIDE |

**Di luar cakupan (keputusan peneliti):** trinomial x² + bx + c, pecahan aljabar, pembagian polinomial. Kesesuaian seluruh materi dengan CP/ATP kelas VII semester 1 **belum terverifikasi**.
