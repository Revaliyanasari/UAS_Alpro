# Rencana Asesmen — Algebra Adventure

> Instrumen pretest & posttest: **Versi B** (keputusan F-1), sama untuk kedua tes. Versi A tidak dipakai; bentuk paralel tidak dibuat.
> Teks soal & rubrik yang dipakai aplikasi: [INSTRUMEN_REVISI_VERSI_B.md](INSTRUMEN_REVISI_VERSI_B.md) — **status: draf, menunggu pemeriksaan akhir peneliti.** Sebelum disetujui, modul tes dibangun dengan data instrumen yang ditandai `draft` dan tidak dipakai untuk siswa.

## 1. Komponen asesmen

| Komponen | Kapan | Tujuan | Penilaian | Umpan balik ke siswa |
|----------|-------|--------|-----------|----------------------|
| Pretest | Sebelum World 1 | Kemampuan awal literasi matematis | Rubrik 24 poin, oleh guru | Tidak ada kunci/benar-salah (mencegah efek belajar dari tes) |
| Kuis Dunia | Akhir World 1–4 | Penguasaan materi per dunia | Otomatis | Langsung + pembahasan |
| Misi Literasi | World 5 | Latihan 4 indikator dengan **konteks dan angka berbeda** dari instrumen | Otomatis per langkah + petunjuk | Langsung |
| Posttest | Setelah World 5 | Kemampuan akhir literasi matematis | Rubrik 24 poin, oleh guru | Skor per indikator setelah guru selesai menilai |

## 2. Instrumen pretest & posttest

| No | Indikator | Konteks | Skor maks |
|----|-----------|---------|-----------|
| 1 | Mathematical Reasoning | Paket buku tulis (8x² + 12x) : 4x, Dinda vs Rafa (revisi: x bilangan asli) | 6 |
| 2 | Formulating Situations Mathematically | Taman bunga y², kolam 3 × 3 (revisi: bentuk faktor tidak lagi diberikan) | 6 |
| 3 | Employing Concepts, Facts, and Procedures | Pita sepanjang lebar meja, FPB L₁ & L₂ (revisi: konteks lebar sama) | 6 |
| 4 | Interpreting, Applying, and Evaluating | Karpet pojok baca (x² − 16) dm², usulan x = 3 (revisi: satuan dm + batas ukuran nyata) | 6 |
| | **Total** | | **24** |

Rincian tahap, kunci, dan kriteria skor per tahap: lihat dokumen revisi. Setelah disetujui, isinya disalin **tanpa perubahan** ke `frontend/src/content/instrument/versi-b-rev1.json` (dengan `approvedAt`) dan dijaga oleh uji teks identik (TESTING_PLAN AS-03).

### 2.1 Aturan pelaksanaan di aplikasi
- Soal ditampilkan satu per satu; siswa bebas berpindah soal sebelum mengirim.
- **Tahapan rubrik tidak ditampilkan ke siswa** (menampilkannya akan menjadi scaffold dan mengubah instrumen).
- Waktu: instrumen tidak menyebut alokasi waktu → default **60 menit** dengan pengingat lunak, tanpa penghentian otomatis. *(Dapat diubah guru.)*
- Selama tes: petunjuk, materi, kartu Langkah Jitu, dan AI dinonaktifkan. TATA hanya memberi semangat umum.
- Setiap siswa mengerjakan pretest dan posttest masing-masing **satu kali**.

### 2.2 Cara siswa menjawab
- Isian teks multi-baris dengan **papan ketik matematika** di layar (x, y, ², (, ), +, −, ×, :, =, ≠, >, <).
- Simpan otomatis di perangkat setiap 5 detik dan saat berpindah soal; dikirim ke Supabase saat siswa menekan **Kirim** (atau saat online kembali).
- Unggah foto coretan: **ditunda** (bukan fitur inti).

## 3. Alur penilaian

```
Siswa kirim → status "menunggu penilaian"
   → Guru masuk ke halaman Guru → pilih siswa & tes
   → Layar: jawaban siswa | daftar tahap + kriteria + skor maks
   → Guru memilih skor tiap tahap (tombol 0 / 1 / 2 sesuai maks — tidak bisa melebihi)
   → Sistem menghitung skor soal, skor indikator, total, nilai
   → Status "dinilai" → siswa dapat melihat rapor per indikator
```

- Skor dibatasi 0…maks tahap di antarmuka **dan** di database.
- Perubahan skor dicatat (siapa, kapan, lama → baru).
- Rubrik disimpan dengan nomor versi; aplikasi tidak dapat mengubahnya.
- **Penilaian berbantuan AI:** ditunda (fitur lanjutan). Jika nanti ditambahkan, hasilnya hanya berupa usulan yang wajib dikonfirmasi guru dan tidak mengubah rubrik.

## 4. Ekspor & analisis

- **CSV** (dari halaman Guru): kode siswa, jenis tes, skor setiap tahap, skor per soal/indikator, total, nilai = (total/24) × 100, waktu mulai & kirim, serta teks jawaban.
- **Ekspor cadangan dari perangkat** (JSON/CSV) jika server tidak tersedia.
- Ringkasan di aplikasi: rata-rata per indikator pretest vs posttest; **N-gain** per siswa g = (post − pre)/(24 − pre), kategori Hake (tinggi ≥ 0,7; sedang 0,3–0,7; rendah < 0,3; tidak terdefinisi jika pre = 24).
- Uji statistik dilakukan di luar aplikasi.

## 5. Kuis dunia (penilaian otomatis)

| Jenis soal | Cara memeriksa |
|------------|----------------|
| Pilihan ganda, benar/salah | Cocokkan kunci |
| Isian bentuk aljabar | Mesin polinomial: ekuivalen? sudah faktor penuh? jenis kesalahan (M1–M9) |
| Drag-and-drop / puzzle | Cocokkan pasangan |
| Algebra tiles | Validator persegi panjang + baca sisi |
| Uraian singkat (World 5) | Dipecah menjadi langkah berisian; setiap langkah diperiksa otomatis |

Skor kuis menentukan bintang (LEARNING_DESIGN §7); ambang membuka dunia berikutnya 60%.
