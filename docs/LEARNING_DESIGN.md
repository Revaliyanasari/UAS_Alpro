# Desain Pembelajaran — Algebra Adventure

> Dasar: wawancara S01 (D1), instrumen literasi matematis Versi B (D2), Cognitive Load Theory (Sweller), worked example & faded example, scaffolding, informative feedback, microlearning.
> Cakupan: FPB/distributif, pembagian suku tunggal (prasyarat), selisih dua kuadrat. Trinomial **tidak** termasuk. Kesesuaian dengan CP/ATP kelas VII semester 1 **belum terverifikasi**.

## 1. Tujuan pembelajaran

Setelah menyelesaikan Algebra Adventure, siswa dapat:

| Kode | Tujuan | World | Indikator literasi terkait |
|------|--------|-------|----------------------------|
| TP1 | Mengidentifikasi variabel, koefisien, konstanta, suku, dan suku sejenis | 1 | Formulating |
| TP2 | Menentukan FPB dua bilangan dan FPB dua suku aljabar (mis. 8x² dan 12x) | 1 | Employing |
| TP3 | Membagi suku tunggal dengan suku tunggal (mis. 8x² : 4x = 2x) sebagai kebalikan perkalian | 1 | Employing |
| TP4 | Menjelaskan pemfaktoran sebagai kebalikan perkalian (distributif) | 2 | Reasoning |
| TP5 | Memfaktorkan ax + ay dan ax² + bx dengan mengeluarkan FPB, serta memeriksa dengan mengalikan kembali | 2 | Employing, Reasoning |
| TP6 | Menjelaskan secara geometris mengapa a² − b² = (a + b)(a − b) | 3 | Reasoning |
| TP7 | Memfaktorkan bentuk selisih dua kuadrat | 3 | Employing |
| TP8 | Memodelkan situasi kontekstual menjadi bentuk aljabar lalu memfaktorkannya | 4, 5 | Formulating |
| TP9 | Menilai kewajaran hasil pemfaktoran dalam konteks (mis. ukuran harus positif) | 4, 5 | Interpreting & Evaluating |
| TP10 | Membandingkan alternatif jawaban dan memberi alasan matematis | 4, 5 | Reasoning |

## 2. Pemetaan materi

```
PRASYARAT (World 1)                INTI                                    TERAPAN
─────────────────────              ──────────────────────────              ──────────────────
Variabel, koefisien,  ──┐
konstanta, suku          ├──► Pemfaktoran FPB (World 2) ──┐
Suku sejenis          ──┤         ▲                       ├──► Tantangan bertingkat (World 4)
Perkalian suku × suku ──┤         │ kebalikan              │            │
FPB bilangan & suku   ──┤     Distributif a(b+c)          │            ▼
Pembagian suku tunggal──┘                                  │    Literasi matematis (World 5)
                              Selisih dua kuadrat (World 3)┘     4 indikator instrumen
                              (visual geometris)
```

## 3. Alur pembelajaran

```
Welcome → Onboarding → PRETEST → Peta
   → World 1 → World 2 → World 3 → World 4 → World 5 → POSTTEST → Rapor akhir
```

- World terbuka berurutan; dunia yang sudah selesai bisa diulang kapan saja.
- **Pola tetap setiap World** (mengurangi beban untuk "mempelajari cara memakai aplikasi"):

| Fase | Nama di aplikasi | Isi | Durasi target |
|------|------------------|-----|---------------|
| 1 | 🎯 Misi | Tujuan dalam 1 kalimat + "kenapa ini berguna" | 30 dtk |
| 2 | 💡 Ingat Lagi | 1–2 kartu prasyarat (bisa dilewati jika lulus cek cepat) | 1–2 mnt |
| 3 | 📖 Jelajah | Pelajaran mikro: 3–6 layar, satu ide per layar | 3–5 mnt |
| 4 | 👀 Contoh TATA | Contoh lengkap langkah demi langkah | 2–3 mnt |
| 5 | ✋ Coba Bersama | Contoh rumpang (faded): siswa mengisi 1 langkah, lalu 2, lalu semua | 3–5 mnt |
| 6 | 🧩 Aktivitas | Tiles / papan / puzzle | 3–5 mnt |
| 7 | ⭐ Latihan | 4–6 soal bertingkat dengan petunjuk | 5–8 mnt |
| 8 | 🏁 Kuis Dunia | 5 soal, tanpa petunjuk tingkat 3, nilai ≥ 60% membuka dunia berikut | 5 mnt |
| 9 | 📝 Pembahasan | Pembahasan setiap soal kuis + ringkasan "Langkah Jitu" | 2 mnt |

Satu World ≈ 25–35 menit, bisa dibagi dalam beberapa sesi (progres tersimpan per fase).

## 4. Penerapan Cognitive Load Theory

### 4.1 Mengelola beban intrinsik (IL01–IL05)
- **Segmentasi prosedur pemfaktoran FPB** menjadi langkah terpisah yang diberi nama tetap ("Langkah Jitu"):
  1. **Koefisien:** cari FPB angka (8 dan 12 → 4).
  2. **Variabel:** cari pangkat terkecil yang sama (x² dan x → x).
  3. **Gabung:** FPB suku = 4x.
  4. **Bagi:** bagi *setiap* suku dengan FPB (8x² : 4x = 2x; 12x : 4x = 3).
  5. **Tulis:** 4x(2x + 3).
  6. **Cek:** kalikan kembali → 8x² + 12x ✔.
- Satu layar hanya meminta **satu** keputusan (menjawab IL02).
- **Pre-training:** istilah (koefisien, suku, FPB) diajarkan di World 1 sebelum dipakai di prosedur.
- Kenaikan kompleksitas dikendalikan (World 4: dasar → penerapan → masalah → kontekstual).

### 4.2 Mengurangi beban ekstrinsik (EL01–EL05)
- Instruksi ≤ 15 kata, kata kerja di awal ("Seret ubin ke papan").
- **Integrasi spasial:** label & panah menempel pada objek, tidak di paragraf terpisah (split-attention).
- **Kendali siswa:** tidak ada auto-advance; narasi dapat diulang (transient information).
- **Modalitas:** jika narasi aktif, teks layar dipersingkat menjadi kata kunci — tidak membacakan paragraf yang sama dengan yang tertulis (redundancy effect).
- Animasi dekoratif dihentikan saat siswa sedang mengerjakan soal.
- Soal cerita: konteks ≤ 3 kalimat + ilustrasi; panel lipat "Yang diketahui / Yang ditanya".

### 4.3 Mendorong beban germane (GL01–GL05)
- Worked example → faded example → latihan mandiri.
- **Self-explanation:** setelah contoh, pertanyaan pilihan "Kenapa 12x dibagi 4x?" (bukan esai panjang).
- **Self-monitoring:** tombol "Cek dengan mengalikan" (GL02).
- **Variasi contoh** (konteks berbeda, struktur sama) untuk transfer (GL05).
- "Jelaskan ke TATA": siswa menyusun urutan langkah dari kartu acak (GL04, elaborasi tanpa mengetik panjang).

## 5. Strategi scaffolding

### 5.1 Petunjuk 3 tingkat (setiap soal latihan)

| Tingkat | Sifat | Contoh untuk "Faktorkan 8x² + 12x" |
|---------|-------|------------------------------------|
| 1 — Arah | Mengingatkan strategi | "Cari dulu FPB dari kedua suku." |
| 2 — Fokus | Menunjuk bagian spesifik | "FPB dari 8 dan 12 berapa? Lalu, pangkat x terkecil di 8x² dan 12x berapa?" |
| 3 — Langkah | Mengerjakan sebagian | "FPB-nya 4x. Sekarang bagi: 8x² : 4x = … dan 12x : 4x = …" |
| (Pembahasan) | Penyelesaian lengkap | Muncul setelah tingkat 3 + satu percobaan, atau setelah soal selesai |

### 5.2 Umpan balik informatif berbasis diagnosis kesalahan

Pemeriksa jawaban (mesin polinomial, lihat TECHNICAL_ARCHITECTURE §5) mengenali pola kesalahan berikut:

| Kode | Kesalahan | Contoh | Umpan balik |
|------|-----------|--------|-------------|
| M1 | Lupa membagi suku kedua (kesalahan "Rafa") | 4x(2x + 12) | "Coba kalikan kembali. Apakah hasilnya 8x² + 12x? Periksa suku kedua." |
| M2 | Faktor benar tetapi belum terbesar | 2x(4x + 6) | "Benar! Tapi (4x + 6) masih punya faktor persekutuan. Bisa dikeluarkan lagi?" |
| M3 | Hanya FPB angka, lupa variabel | 4(2x² + 3x) | "Angkanya sudah tepat. Apakah x juga ada di kedua suku?" |
| M4 | Tanda sama pada selisih dua kuadrat | (y − 3)(y − 3) | "Coba kalikan. Suku tengahnya hilang atau tidak?" |
| M5 | Mengira a² + b² bisa difaktorkan seperti a² − b² | y² + 9 = (y+3)(y−3) | "Kalikan (y+3)(y−3). Tandanya cocok?" |
| M6 | Salah pembagian koefisien | 8x² : 4x = 4x | "8 : 4 berapa? Lalu x² : x berapa?" |
| M8 | Variabel tidak dibagi | 8x² : 4x = 2x² | "x² itu x · x. Kalau dibagi x, tinggal berapa x?" |
| M9 | Lupa variabel habis (x : x = 1) | 12x : 4x = 3x | "x dibagi x hasilnya 1. Masih ada x atau tidak?" |
| M10 | Variabel ikut habis | 8x² : 4x = 2 | "Cek variabelnya: x² dibagi x masih menyisakan x." |
| M11 | Isi kurung benar, faktor depan hilang | 2x + 3 untuk 8x² + 12x | "Isi kurungnya sudah benar! Tapi faktor di depan kurung belum ditulis." |
| DOTS_LEFT | Masih ada a² − b² di dalam kurung | 2(x² − 4) | "Bagian dalam kurung masih berbentuk a² − b². Bisa difaktorkan lagi?" |

Teks final setiap kode ada di `frontend/src/content/feedback.js`; kecocokannya dengan pemeriksa diuji otomatis.
| M7 | Jawaban tidak ekuivalen (umum) | — | "Belum tepat. Coba cek dengan mengalikan kembali." + tawaran petunjuk |

Prinsip: umpan balik **tidak** menyebut jawaban benar sebelum pembahasan; nada menyemangati; sebutkan *apa yang sudah benar* dulu.

### 5.3 Pemudaran (fading)
Jika siswa menjawab benar 3 kali berturut-turut tanpa petunjuk pada satu jenis soal, contoh rumpang dilewati dan soal berikutnya langsung mandiri. Jika salah 2 kali berturut-turut, sistem menawarkan "Lihat contoh mirip".

## 6. Penerapan literasi matematis

| Indikator | Di mana dilatih | Bentuk aktivitas |
|-----------|-----------------|------------------|
| Mathematical Reasoning | World 2, 4, 5 | "Siapa yang benar?" — membandingkan dua jawaban tokoh, memilih alasan |
| Formulating | World 3, 4, 5 | Dari gambar/cerita singkat → menyusun bentuk aljabar di Papan Matematika |
| Employing | World 1–4 | Prosedur FPB & selisih dua kuadrat dengan tiles/papan |
| Interpreting & Evaluating | World 4, 5 | Substitusi nilai, menilai kewajaran (ukuran negatif), memilih nilai x yang masuk akal |

**Penting (validitas penelitian):** soal latihan World 5 memakai indikator & struktur yang sama dengan instrumen tetapi **konteks dan angka berbeda**, sehingga siswa tidak menghafal jawaban pretest/posttest. Soal instrumen asli **hanya** muncul pada pretest dan posttest.

## 7. Gamifikasi yang selaras dengan pemahaman

- XP diberikan untuk **menyelesaikan langkah belajar** dan **memeriksa kembali jawaban**, bukan untuk kecepatan.
- Memakai petunjuk **tidak** mengurangi XP (agar siswa tidak menghindari scaffolding).
- Bintang dunia (1–3) dari kuis dunia: ≥ 60% = 1, ≥ 80% = 2, 100% = 3. Kuis bisa diulang dengan soal varian.
- Badge berbasis perilaku belajar: "Pemeriksa Teliti" (cek 10 kali), "Penjelajah Sabar" (menyelesaikan contoh tanpa melewatinya), "Ahli FPB", "Penemu Kuadrat".
- Tidak ada papan peringkat antarsiswa.
