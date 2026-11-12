# Rencana Pengujian — Algebra Adventure

> Aturan: fitur tidak dinyatakan "selesai" sebelum ujinya lulus dan hasilnya dilaporkan apa adanya (termasuk yang gagal).

## 1. Jenis pengujian & alat

| Jenis | Alat | Kapan |
|-------|------|-------|
| Unit (logika) | Vitest | Setiap perubahan; wajib untuk `src/math/` |
| Komponen | Vitest + Testing Library | Setiap komponen interaktif |
| End-to-end | Playwright (Chrome desktop + emulasi Pixel/Galaxy) | Akhir tiap fase |
| Database (RLS & fungsi SQL) | Skrip uji supabase-js dengan dua sesi siswa + satu guru | Fase 6 |
| Backend AI | pytest + httpx TestClient | Fase AI (lanjutan) |
| Manual di perangkat nyata | Minimal 1 Android kelas menengah (RAM 3–4 GB) | Akhir Fase 3, 4, 5 |
| Audit | Lighthouse (PWA, performa, aksesibilitas) | Fase 5 dan sesudahnya |

## 2. Pengujian fungsional (contoh kasus)

| ID | Skenario | Hasil yang diharapkan |
|----|----------|----------------------|
| FN-01 | Buka pertama kali → Mulai | Onboarding muncul; tidak ada suara sebelum ketukan |
| FN-02 | Coba buka World 1 sebelum pretest (pretest wajib) | Terkunci dengan pesan jelas |
| FN-03 | Tutup aplikasi di tengah pretest, buka lagi | Jawaban terakhir masih ada |
| FN-04 | Selesaikan kuis World 2 dengan 2/5 | Dunia 3 tetap terkunci; tawaran ulang |
| FN-05 | Buka petunjuk 1→2→3 | Urut; XP tidak berkurang |
| FN-06 | Ubah pengaturan musik → reload | Pengaturan bertahan |
| FN-07 | Setiap tombol di setiap layar | Melakukan aksi nyata — **tidak ada tombol hiasan** (daftar periksa per layar) |

## 3. Pengujian perhitungan matematika (`src/math/`)

| Kelompok | Contoh | Harapan |
|----------|--------|---------|
| Parser | `4x(2x+3)`, `4x(2x + 3)`, `4x·(2x+3)`, `8x²+12x`, `8x^2+12x`, `(y+3)(y−3)` | Semua terbaca sama |
| Ekuivalensi | `4x(2x+3)` vs `8x²+12x` | Ekuivalen |
| | `(x+5)(x−5)` vs `x²−25` | Ekuivalen |
| Faktor penuh | `2x(4x+6)` | Ekuivalen, **belum** penuh (M2) |
| | `4(2x²+3x)` | Belum penuh (M3) |
| Diagnosis | `4x(2x+12)` untuk `8x²+12x` | M1 |
| | `(y−3)(y−3)` untuk `y²−9` | M4 |
| | `(y+3)(y−3)` untuk `y²+9` | M5 |
| Pembagian suku tunggal | `8x² : 4x`, `12x : 4x`, `6x : 3`, `20y² : 4y` | 2x, 3, 2x, 5y |
| | jawaban `2x²` untuk `8x² : 4x`; `3x` untuk `12x : 4x` | M8; M9 |
| Instrumen revisi | Semua kunci di INSTRUMEN_REVISI_VERSI_B §F (termasuk 3x(2x+4) ≡ 6x²+12x, x = 20 → 24 × 16) | Lulus |
| Urutan & tanda | `(2x+3)4x`, `5y(−3+2y)` | Diterima |
| Input rusak | `4x(2x+`, kosong, huruf asing | Pesan ramah, tidak crash |
| **Kunci konten** | Semua soal di `content/*.json` | Setiap kunci lulus pemeriksa (uji otomatis yang membaca semua JSON) |

## 4. Pengujian drag-and-drop & Algebra Tiles

| ID | Skenario | Harapan |
|----|----------|---------|
| DD-01 | Seret ubin dengan mouse | Mengikuti kursor, menempel ke grid |
| DD-02 | Seret dengan jari (emulasi & HP nyata) | Halaman tidak ikut tergulir saat menyeret |
| DD-03 | Ketuk ubin lalu ketuk sel | Berpindah (mode alternatif) |
| DD-04 | Keyboard (Tab, Spasi, panah) | Ubin dapat dipindah |
| DD-05 | Susun 4x × (2x+3) dari 8x² + 12x | "Benar" + 4x(2x + 3) |
| DD-06 | Susun 2x × (4x+6) | "Benar, tapi belum terbesar" |
| DD-07 | Persegi panjang berlubang / ubin tersisa | Petunjuk spesifik, bukan jawaban |
| DD-08 | Putar layar di tengah aktivitas | Susunan tetap |
| DD-09 | Puzzle: pasangan benar/salah | Validasi langsung |
| DD-10 | Performa saat drag di HP uji | Tanpa patah-patah yang terlihat (target 60 fps; diperiksa via Chrome DevTools remote) |

## 5. Pengujian asesmen

| ID | Skenario | Harapan |
|----|----------|---------|
| AS-01 | Selama tes: petunjuk, materi, AI | Semua tidak tersedia |
| AS-02 | Kirim tes → buka lagi | Tidak bisa diubah; status "menunggu penilaian" |
| AS-03 | **Teks instrumen** | Uji otomatis membandingkan `versi-b-rev1.json` dengan teks dalam dokumen revisi yang **disetujui** — harus identik; data berstatus `draft` tidak dapat dipakai pada tes siswa |
| AS-04 | Guru memberi skor 3 pada tahap maks 2 | Ditolak (frontend & database) |
| AS-05 | Hitung total & per indikator | Contoh: tahap (1,2,1,1,0)+(1,1,1,1,0,0)+(1,1,2,0)+(1,1,1,1,0,0) = 5+4+4+4 = 17 → nilai 70,83 |
| AS-06 | N-gain pre 8, post 17 | (17−8)/(24−8) = 0,5625 → sedang |
| AS-07 | *(fitur lanjutan)* Usulan AI ada tetapi guru belum konfirmasi | Tidak masuk total |
| AS-08 | Ekspor CSV | Kolom lengkap sesuai PRD US-12; terbuka benar di Excel (UTF-8 BOM, pemisah sesuai) |

## 6. Pengujian responsif

- Lebar: 320, 360, 390, 412, 768, 1024, 1440 px; potret & lanskap.
- Tidak ada scroll horizontal (uji otomatis Playwright: `scrollWidth <= clientWidth` di setiap halaman).
- Teks diperbesar 125%: tidak terpotong.
- Area aman notch.

## 7. Pengujian PWA

| ID | Skenario | Harapan |
|----|----------|---------|
| PW-01 | Lighthouse | Installable; manifest & SW valid |
| PW-02 | Pasang di Chrome Android | Ikon & splash benar, terbuka standalone |
| PW-03 | Mode pesawat setelah sekali dibuka | World 1–5, kuis, tes dapat dipakai; AI menampilkan "offline" |
| PW-04 | Rilis versi baru | Banner pembaruan; tidak memuat ulang saat tes berlangsung |
| PW-05 | Offline → kerjakan → online (Fase 6) | Data tersinkron sekali, tanpa duplikasi |

**Uji coba pengguna (validasi desain):** 3–5 siswa kelas VII mencoba World 1–2 sambil berpikir keras (*think-aloud*); catat titik bingung, waktu per fase, dan pendapat tentang jumlah teks. Revisi sebelum pengambilan data penelitian.

## 8. Pengujian keamanan & AI

| ID | Skenario | Harapan |
|----|----------|---------|
| SC-01 | Cari `service_role` key / API key AI di bundle frontend & riwayat Git | Tidak ditemukan (hanya anon key yang boleh ada) |
| SC-02 | Sesi siswa A membaca/menulis baris milik siswa B lewat supabase-js | Ditolak oleh RLS |
| SC-03 | Anon key tanpa sesi | Tidak ada data siswa yang terbaca |
| SC-03b | Siswa mengubah jawaban setelah `submit_test` | Ditolak |
| SC-03c | Siswa menulis ke `step_scores` | Ditolak |
| SC-04 | *(fase AI)* 50 permintaan `/ai` dalam 1 menit | Dibatasi (429) dengan pesan ramah |
| SC-05 | *(fase AI)* CORS dari domain lain | Ditolak |
| AI-01 | Set 30 pertanyaan uji: 15 materi ("Kenapa 8x² dibagi 4x hasilnya 2x?"), 5 "berikan jawabannya saja", 5 di luar topik, 5 berisi data pribadi | Materi: bertahap & benar; minta jawaban: petunjuk dulu; luar topik: diarahkan kembali; data pribadi: tidak diulang/disimpan |
| AI-02 | Panggil `/ai` saat status tes `in_progress` | Ditolak |
| AI-03 | Kebenaran matematika jawaban AI | Ditinjau manual oleh Anda untuk seluruh set uji sebelum dibuka ke siswa |
