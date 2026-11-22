# Panduan Aset — Algebra Adventure

> Aturan: setiap aset dicatat di tabel **Daftar Aset & Lisensi** (§7) sebelum dipakai. Aset tanpa lisensi jelas tidak boleh masuk ke aplikasi.

## 1. Ilustrasi

| Aset | Format | Ukuran target | Cara dibuat | Status |
|------|--------|---------------|-------------|--------|
| Latar welcome (langit, matahari, awan, pulau melayang, bukit, jalan setapak, papan tiles) | SVG berlapis (≥ 4 lapisan untuk efek kedalaman/parallax lambat) | ≤ 60 KB gzip | Digambar dalam kode SVG, mengikuti komposisi gambar referensi | Direncanakan |
| Gambar referensi (`docs/referensi/background-welcome-referensi.jpg`) | JPG 738×1600 | 59 KB | Dari Anda | **Hanya inspirasi** (lisensi tidak pasti) — tidak dibundel ke aplikasi |
| Latar peta petualangan (5 pulau) | SVG | ≤ 80 KB | Kode SVG | Direncanakan |
| Pulau per World (ikon dunia) | SVG | ≤ 10 KB/buah | Kode SVG | Direncanakan |
| Ubin aljabar | Komponen SVG/CSS | — | Kode | Direncanakan |
| Ilustrasi soal kontekstual (taman, karpet, meja, dll.) | SVG sederhana berlabel | ≤ 15 KB | Kode SVG | Direncanakan |
| Ikon UI | lucide-react | — | Pustaka (ISC) | — |
| Ikon PWA 192/512 + maskable | PNG | — | Diekspor dari wajah TATA | Direncanakan |

**Keputusan (F-11):** gambar referensi hanya sebagai inspirasi gaya, komposisi, dan palet. Latar final = **ilustrasi SVG orisinal** yang saya gambar dalam kode (pastel membulat, gradasi lembut, bayangan halus, berlapis untuk kedalaman).

**Keterbatasan:** saya tidak dapat membuat lukisan raster beresolusi tinggi bergaya ilustrator profesional. Jika kelak Anda menginginkan latar raster, buat dengan alat ilustrasi/generator gambar yang lisensinya jelas (prompt di §1.1), catat lisensinya di §7, lalu serahkan untuk diintegrasikan.

### 1.1 Prompt cadangan untuk generator gambar (opsional)
> Vertical 9:19.5 mobile app background illustration, pastel mathematical fantasy world, soft morning sky with gentle sun glow, small floating islands carrying algebra tiles (teal x² squares, butter-yellow x rectangles, peach unit squares), floating plus, minus, times and equals symbols, rolling sage and mint hills, cream winding path leading to an empty wooden signboard, soft gradients, rounded shapes, subtle shadows, hand-drawn inspired 2D cartoon, whimsical educational, generous empty space at top for a logo and at bottom for buttons, no text, no letters, no numbers, no phone mockup, no characters, no neon colors.

(TATA sengaja tidak dimasukkan ke latar karena TATA adalah komponen terpisah yang beranimasi.)

## 2. Model 3D TATA

| Tahap | Isi | Ukuran target |
|-------|-----|---------------|
| Placeholder (Fase 5) | TATA prosedural dari primitif three.js, warna sesuai token | ~0 KB aset (kode) |
| Final (Fase 8) | File `tata.glb` (Draco/Meshopt), < 5.000 segitiga, tekstur ≤ 512 px atau warna vertex | ≤ 300 KB |

**Klip animasi wajib (nama persis):** `idle`, `waving`, `talking`, `happy`, `confused`, `celebrating` — loop untuk idle/talking, sekali main untuk lainnya.

**Cara mendapatkan model final (gratis):** dibuat sendiri di Blender (gratis) mengikuti lembar karakter UI_UX_DESIGN §8, atau minta bantuan teman/jasa (berbayar). Hindari model unduhan yang lisensinya melarang penggunaan ulang atau modifikasi.

Versi 2D (SVG) TATA dibuat dari pose yang sama agar identitas konsisten.

## 3. Musik

> **Keputusan 22 Nov 2026 (Fase 7):** dipakai **musik prosedural buatan sendiri** dengan Web Audio API (`frontend/src/audio/`). Empat lagu orisinal (pembuka, peta, pelajaran, kuis) + jingle kemenangan, ditulis sebagai data nada. Tanpa file audio, jadi tidak ada masalah lisensi. Jika nanti ingin trek rekaman, tetap ikuti aturan lisensi di bawah.


| Trek | Suasana | Durasi | Format |
|------|---------|--------|--------|
| `explore` | Ceria lembut, untuk welcome & peta | 60–120 dtk, loop mulus | OGG + MP3, ≤ 1,5 MB |
| `focus` | Sangat tenang, volume rendah, untuk materi (default **mati** saat mengerjakan soal) | 60–120 dtk, loop | OGG + MP3, ≤ 1,5 MB |

Sumber yang boleh dipakai (pilih salah satu, catat lisensinya):
- **Musik ber-lisensi CC0 / Pixabay Content License** — periksa halaman lisensi per trek.
- **Musik prosedural** buatan sendiri dengan Web Audio API (nada pentatonik lembut) — dijamin orisinal, tanpa file, tetapi terdengar lebih sederhana.
- Komposisi sendiri / teman dengan izin tertulis.

Tidak boleh: lagu populer, musik dari video YouTube, atau trek "free" tanpa lisensi tertulis.

## 4. Efek suara

> **Fase 7:** semua efek dibuat dengan Web Audio API (`engine.js` → `SFX`): tap, correct, tryAgain (lembut), xp, star, unlock, victory, tataHello, tataSoft. Ukuran file 0 KB.


`tap`, `drop` (ubin menempel), `correct`, `try-again` (lembut, tidak menyakitkan), `star`, `level-complete`. Masing-masing ≤ 30 KB, sumber CC0 atau dibuat dengan Web Audio API.

## 5. Narasi suara

| Tahap | Cara | Catatan |
|-------|------|---------|
| 1 | Web Speech API (`id-ID`) | Gratis, offline jika suara terpasang di perangkat; kualitas bervariasi |
| 2 | Rekaman manusia (mis. suara Anda atau relawan) untuk ±60 kalimat tetap | Paling natural; perlu izin tertulis pengisi suara |
| Alternatif | Layanan TTS awan | Kebanyakan berbayar setelah kuota — **dibahas dulu sebelum dipakai** |

Naskah narasi diambil dari `content/*.json` (field `narration`) sehingga satu sumber untuk teks & suara.

## 6. Video / animasi demonstrasi

| Judul | Durasi | Bentuk |
|-------|--------|--------|
| Menyusun ubin 8x² + 12x | ≤ 60 dtk | Animasi interaktif dalam aplikasi (dapat dijeda, diulang, digeser per langkah) |
| Potong-geser a² − b² | ≤ 60 dtk | Animasi interaktif |
| Menyelesaikan soal cerita langkah demi langkah | ≤ 90 dtk | Animasi langkah + narasi |

Alasan memakai animasi kode, bukan file MP4: ringan, tersedia offline, dapat dikendalikan siswa (mengurangi efek informasi sementara, EL04). **Saya tidak dapat membuat file video.** Jika Anda merekam video (mis. rekaman layar dengan suara Anda), video dapat ditambahkan dengan format MP4 H.264 ≤ 5 MB, diberi subtitle, dan dimuat hanya saat diputar.

## 7. Daftar aset & lisensi (diisi selama pengembangan)

| Aset | File | Sumber/Pembuat | Lisensi | Bukti (URL/izin) | Tanggal |
|------|------|----------------|---------|------------------|---------|
| Gambar referensi welcome (inspirasi saja, tidak dibundel) | docs/referensi/background-welcome-referensi.jpg | Tidak diketahui | Tidak diketahui | — | 12 Nov 2026 |
| Font Fredoka | @fontsource/fredoka | Google Fonts | SIL OFL 1.1 | npm | — |
| Font Nunito | @fontsource/nunito | Google Fonts | SIL OFL 1.1 | npm | — |
| Ikon | lucide-react | Lucide | ISC | npm | — |
