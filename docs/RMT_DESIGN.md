# Desain Pembelajaran RMT — Algebra Adventure

> Dibuat 22 Nov 2026. Model pembelajaran: **Rigorous Mathematical Thinking (RMT)**.
> **Sumber satu-satunya yang dipakai:** ringkasan buku *Rigorous Mathematical Thinking: Conceptual Formation in the Mathematics Classroom* (James T. Kinard, Sr. & Alex Kozulin), Bab 1–6 dan Simpulan, dari dosen (`Rigorous Mathematical Thinking.docx.pdf`, 15 halaman).
> Buku lengkap **belum tersedia** di laptop. Setiap istilah di dokumen ini merujuk ke bab ringkasan tersebut. Bagian yang ditandai **⚠ perlu verifikasi** sebaiknya dicek ke buku lengkap atau ke dosen.

## 1. Inti RMT menurut sumber

| Konsep | Isi menurut ringkasan | Rujukan |
|--------|-----------------------|---------|
| Definisi RMT | Proses mental ketika siswa aktif menginternalisasi alat psikologis matematika dan menggunakannya untuk mengorganisasi, meregulasi, dan mentransformasikan pemikiran dalam memecahkan masalah | Bab 5 §1 |
| Tiga pilar | (1) fungsi kognitif spesifik matematika, (2) alat psikologis spesifik matematika, (3) pengalaman belajar ter-mediasi (MLE) | Bab 5 §2 |
| Fungsi kognitif | Fase **Input** (persepsi jelas, akurat mengumpulkan data), **Elaborasi** (hubungan sebab-akibat, bagian-keseluruhan, penalaran induktif/deduktif), **Output** (komunikasi jelas, hindari coba-coba, tepat bahasa & simbol) | Bab 4 §3 |
| Alat psikologis | Tanda & simbol, organizer grafis/simbolik (tabel, garis bilangan, bidang koordinat), rumus & persamaan, bahasa matematika | Bab 1 §5 |
| MLE | **Intensionalitas & resiprositas**, **transendensi**, **makna** | Bab 4 §2 |
| Learning Activity | **Analisis tugas**, **perencanaan tindakan**, **refleksi** → siswa mandiri & mampu meregulasi diri | Bab 3 §4 |
| Pembentukan konsep | Dari konsep sehari-hari ke konsep ilmiah; representasi visual-simbolik menjembatani konteks nyata dan abstraksi aljabar | Bab 3 §3, Bab 5 §3 |
| Siklus penyelidikan | **Representasi → Manipulasi → Validasi** | Bab 6 §3 |
| Diagnosis | Mengenali fase kognitif yang bermasalah (Input/Elaborasi/Output) agar intervensi tepat sasaran | Bab 5 §4 |
| Asesmen dinamis | Format *sandwich* (pretest–intervensi–posttest) dan *cake* (petunjuk bertahap saat tes); LPAD: uji–mediasi–uji ulang | Bab 3 §3, Bab 4 §5 |
| Peta kognitif | 7 dimensi tugas: konten, modalitas, operasi mental, fungsi kognitif prasyarat, kompleksitas, abstraksi, efisiensi | Bab 4 §4 |
| Kriteria aktivitas | Perubahan struktural pemahaman; konsep ilmiah (teoretis, sistematis, generatif); bahasa & aturan budaya matematika | Bab 1 §3 |

## 2. Hubungan dengan aljabar kelas VII

- **Alat psikologis aljabar:** simbol variabel/koefisien, Algebra Tiles (organizer visual luas = panjang × lebar), papan distributif (organizer tabel), rumus `ab + ac = a(b + c)`.
- **Bagian–keseluruhan (Elaborasi):** bentuk aljabar = keseluruhan, suku = bagian; pemfaktoran = membagi *setiap* bagian dengan FPB. Kesalahan M1 ("lupa membagi suku kedua") adalah gangguan fase Elaborasi.
- **Konsep sehari-hari → ilmiah:** pengalaman membagi barang sama rata atau mengukur luas lantai → FPB dan pemfaktoran sebagai struktur umum.
- **Representasi berganda:** konkret (ubin), visual (persegi panjang), simbolik (4x(2x + 3)).

## 3. Pemetaan prinsip RMT → fitur aplikasi

| Prinsip RMT (sumber) | Fitur aplikasi | Aktivitas siswa | Tujuan pembelajaran | Indikator berpikir matematis |
|---|---|---|---|---|
| Fase **Input** (Bab 4 §3) | Penanda fase 🔎 di layar; layar **Analisis soal cerita** (`identify`); kartu cerita + panel "Diketahui/Ditanya" | Memilah kalimat cerita ke *Diketahui / Ditanya / Tidak diperlukan* | Mengidentifikasi informasi relevan dari masalah kontekstual | Menyebut besaran yang diketahui & ditanya dengan lengkap dan akurat |
| Fase **Elaborasi**: bagian-keseluruhan, perbandingan (Bab 4 §3) | Sortir suku sejenis & koefisien, Faktor bersama → FPB, Algebra Tiles, Papan Matematika, "Siapa yang benar?" | Mengelompokkan, membandingkan, menyusun ubin menjadi persegi panjang, membandingkan dua jawaban | Menemukan hubungan antarsuku dan FPB; memahami pemfaktoran sebagai kebalikan perkalian | Mengklasifikasi suku sejenis; menentukan FPB; menjelaskan letak kesalahan |
| Fase **Output**: tepat simbol, hindari coba-coba (Bab 4 §3) | Isian dengan papan ketik matematika; pemeriksa `checkSimplified` (NOT_SIMPLE), NOT_FACTORED, M11 | Menulis jawaban dalam bentuk paling sederhana / bentuk faktor lengkap | Menyatakan hasil dengan simbol aljabar yang tepat | Jawaban ditulis lengkap, sederhana, dan dalam bentuk yang diminta |
| **Alat psikologis** (Bab 1 §5) | Algebra Tiles, Bangun persegi panjang 12 ubin, Mesin Pembagi, Papan Matematika (tabel distributif) | Memanipulasi ubin, mengisi tabel perkalian tiap suku | Menginternalisasi model luas sebagai alat berpikir aljabar | Beralih dari representasi konkret → visual → simbolik |
| **Siklus Representasi–Manipulasi–Validasi** (Bab 6 §3) | Tiles (representasi & manipulasi) → "Cek dengan mengalikan" (validasi) di Papan Matematika, Mesin Pembagi, pembahasan | Menyusun model, mengubahnya, lalu memeriksa dengan mengalikan kembali | Memvalidasi hasil pemfaktoran secara mandiri | Memeriksa jawaban dengan mengalikan kembali |
| **Learning Activity**: analisis tugas (Bab 3 §4) | Layar `identify` sebelum setiap soal cerita | Mengurai struktur masalah sebelum menghitung | Membangun model matematika dari situasi | Menyusun model (mis. panjang = luas : lebar) |
| **Learning Activity**: perencanaan tindakan (Bab 3 §4) | "Jelaskan ke TATA" (`order`): menyusun Langkah Jitu | Mengurutkan langkah pembagian & pemfaktoran | Merencanakan prosedur secara sistematis | Menyusun langkah penyelesaian dengan urutan logis |
| **Learning Activity**: refleksi & metakognisi (Bab 3 §4, Bab 5 §4) | Layar **Refleksi** (`reflect`) di akhir setiap pelajaran | Memilih pernyataan tentang strategi sendiri; TATA menanggapi pilihan | Mengevaluasi strategi dan cara memeriksa jawaban | Menjelaskan strategi dan alasan yakin jawabannya benar |
| **MLE: intensionalitas & resiprositas** (Bab 4 §2) | Layar **Misi** (tujuan pulau); TATA meminta respons setiap layar (tidak ada auto-advance) | Membaca tujuan, lalu aktif merespons | Siswa tahu tujuan belajarnya | Respons aktif pada setiap langkah |
| **MLE: makna** (Bab 4 §2) | Kalimat "kenapa ini berguna" di misi pulau & kartu pulau; soal cerita kontekstual | Menghubungkan materi dengan kebun, mading, pensil | Memahami nilai dan alasan materi | Menafsirkan hasil dalam konteks (mis. lebar mading 11 dm) |
| **MLE: transendensi** (Bab 4 §2) | Layar **Jembatan: aturan umum** | Melihat aturan umum yang berlaku untuk bilangan, suku, luas, dan World berikutnya | Menggeneralisasi prinsip melampaui satu soal | Menerapkan aturan yang sama pada konteks baru |
| **Mediasi oleh manusia → TATA & AI** (Bab 3 §1, Bab 5 §4) | Petunjuk 3 tingkat, umpan balik diagnostik, ekspresi TATA, AI Assistant dengan *mediated questioning* | Menerima pertanyaan terpimpin, bukan jawaban langsung | Membangun cara berpikir di balik prosedur | Menjawab pertanyaan pemantik dan memperbaiki sendiri |
| **Diagnosis fase kognitif** (Bab 5 §4) | Setiap kode kesalahan (M1–M11, NOT_SIMPLE, dll.) dipetakan ke Input/Elaborasi/Output (`src/content/rmt.json`); ditampilkan di umpan balik | Membaca "🧠 Elaborasi: setiap suku harus dibagi FPB" | Memperbaiki bagian proses berpikir yang tepat | Kesalahan yang sama tidak terulang |
| **Asesmen dinamis *cake*** (Bab 3 §3) | Kuis dengan petunjuk tingkat 1–2 | Boleh meminta petunjuk saat kuis | Mengukur potensi belajar dengan mediasi | Ketuntasan kuis ≥ 60% |
| **Asesmen dinamis *sandwich*** (Bab 3 §3, Bab 4 §5) | Modul Guru: penilaian pretest & posttest, perbandingan (instrumen menunggu persetujuan) | Mengerjakan pretest → belajar → posttest | Mengukur perubahan setelah mediasi | Selisih skor pretest–posttest per indikator |
| **Mengurangi coba-coba** (Bab 4 §3) | Kuis menilai jawaban pertama; refleksi menanggapi pilihan "menebak"; pembahasan baru terbuka setelah petunjuk ke-3 + satu percobaan | Berpikir sebelum menjawab | Memilih strategi, bukan menebak | Jawaban pertama benar meningkat |

## 4. Alur satu World (pola tetap) dalam bahasa RMT

| Fase aplikasi (LEARNING_DESIGN §3) | Elemen RMT |
|---|---|
| 🎯 Misi | MLE intensionalitas + makna |
| 📖 Jelajah, 👀 Contoh TATA | Fase Input; alat psikologis (simbol, ubin) diperkenalkan |
| ✋ Coba bersama (contoh rumpang) | Mediasi bertahap (ZPD, Bab 3 §3) |
| 🧩 Aktivitas (tiles, sortir, papan) | Fase Elaborasi; siklus Representasi–Manipulasi–Validasi |
| ⭐ Latihan + Analisis soal cerita | Learning Activity: analisis tugas → perencanaan; fase Output |
| Jelaskan ke TATA, Jembatan | Perencanaan tindakan; MLE transendensi |
| Refleksi | Learning Activity: refleksi; metakognisi |
| 🏁 Kuis + 📝 Pembahasan | Asesmen dinamis (*cake*); validasi |

## 5. Contoh peta kognitif (Bab 4 §4) untuk tugas "Faktorkan 8x² + 12x dengan Algebra Tiles"

| Dimensi | Isi |
|---|---|
| Konten | Pemfaktoran dengan FPB |
| Modalitas | Konkret-visual (ubin) → simbolik (4x(2x + 3)) |
| Operasi mental | Klasifikasi (x² vs x), analisis bagian-keseluruhan, sintesis persegi panjang |
| Fungsi kognitif prasyarat | Persepsi jelas jenis ubin (Input), membandingkan banyak ubin tiap baris (Elaborasi) |
| Kompleksitas | 20 ubin, 2 jenis, 4 baris |
| Abstraksi | Rendah ke sedang: luas persegi panjang → bentuk aljabar |
| Efisiensi | Diamati dari percobaan pertama dan pemakaian petunjuk |

## 6. AI Learning Assistant sebagai mediator

Aturan perilaku AI (prompt sistem di `backend/src/ai/prompt.js`) diturunkan dari MLE dan Learning Activity:
- **Intensionalitas:** mulai dari tujuan soal; tanya apa yang diketahui dan ditanya (Input).
- **Mediated questioning:** satu pertanyaan pemantik per giliran, bukan jawaban akhir.
- **Elaborasi:** arahkan ke hubungan bagian-keseluruhan, perbandingan, dan model.
- **Output & validasi:** minta siswa menulis bentuk akhir dengan tepat dan mengecek dengan mengalikan.
- **Transendensi & makna:** kaitkan dengan aturan umum dan konteks sehari-hari.
- **Refleksi:** minta siswa menjelaskan kembali makna hasilnya.

## 7. Keterbatasan & hal yang perlu diverifikasi

- ⚠ Hanya ringkasan yang tersedia. Rincian buku asli seperti daftar lengkap fungsi kognitif, format rencana pelajaran RMT, dan jurnal RMT belum dibaca. Penerapan di atas memakai konsep yang ada di ringkasan saja.
- ⚠ Pemetaan kode kesalahan ke fase kognitif (`rmt.json → errorPhase`) adalah **penafsiran pengembang** berdasarkan definisi fase di Bab 4 §3. Perlu ditinjau dosen.
- ⚠ Jurnal RMT siswa (Bab 6 §2) belum diterapkan. Usulan: kolom refleksi tertulis singkat yang hanya dibaca guru.
- Asesmen dinamis *sandwich* lengkap menunggu persetujuan instrumen pretest/posttest (CLAUDE.md aturan 1).
