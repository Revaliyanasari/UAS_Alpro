# Desain UI/UX — Algebra Adventure

> Tema: **Pastel Mathematical Fantasy World**. Referensi gaya (inspirasi saja, tidak dipakai sebagai aset): `docs/referensi/background-welcome-referensi.jpg`.
> Prinsip utama: dunia petualangan yang hangat **di luar** soal; area kerja yang tenang dan polos **di dalam** soal.

## 1. Identitas visual

- **Suasana:** pagi cerah di kepulauan matematika yang melayang; lembut, ramah, tidak kekanak-kanakan.
- **Gaya ilustrasi:** 2D kartun, sudut membulat, gradasi lembut, bayangan halus, garis tanpa outline hitam.
- **Motif:** algebra tiles (persegi x², persegi panjang x, persegi kecil 1), simbol + − × =, pulau melayang, jalan setapak krem, bukit sage.
- **Larangan:** warna neon, teks acak di ilustrasi, mockup ponsel, latar ramai di belakang soal.

## 2. Warna (design tokens)

| Token | Nama | Hex | Pemakaian |
|-------|------|-----|-----------|
| `--sage-500` | Sage Green | `#8FB996` | Bukit, panel sekunder |
| `--sage-700` | Sage tua | `#4E7A5A` | Ikon aktif, teks pada latar terang |
| `--mint-200` | Mint Green | `#CFEBDD` | Latar kartu materi |
| `--teal-400` | Soft Turquoise | `#7CC6C4` | **Warna utama**, tombol primer, ubin x² |
| `--teal-700` | Toska tua | `#2F7F7C` | Teks tombol / tautan (kontras) |
| `--cream-50` | Cream | `#FFF8EA` | Latar halaman, papan kerja |
| `--beige-300` | Warm Beige | `#E2C9A6` | Bingkai papan, kartu |
| `--butter-300` | Butter Yellow | `#F5DC8B` | Ubin x, sorotan, bintang |
| `--peach-300` | Soft Peach | `#F2B5A0` | Ubin satuan, aksen hangat |
| `--terra-500` | Terracotta | `#C8694B` | Aksen langka: badge, notifikasi penting |
| `--ink-900` | Tinta | `#2E3A38` | Teks utama (kontras ≥ 7:1 pada cream) |
| `--ink-600` | Tinta sedang | `#55635F` | Teks sekunder |
| `--color-ok` | Benar | `#2F6F48` | Umpan balik benar (+ ikon ✔) — 5,2:1 |
| `--color-hint` | Coba lagi | `#8A5222` | Umpan balik salah (+ ikon 💡) — **bukan merah** agar tidak menghukum; 5,5:1 |

Aturan: teks **tidak** ditulis dengan warna pastel di atas pastel; selalu `--ink-900`/`--ink-600` atau versi "-700". Warna tidak pernah menjadi satu-satunya penanda (selalu ada ikon/teks).

**Warna ubin konsisten di seluruh aplikasi:** x² = toska, x = butter yellow, 1 = peach (sesuai gambar referensi). Ubin negatif (jika diperlukan) = versi bergaris dari warna yang sama.

## 3. Tipografi

| Peran | Font | Ukuran (mobile) | Catatan |
|-------|------|-----------------|---------|
| Judul dunia / logo | **Fredoka** (600) | 28–32 px | Membulat, ramah |
| Judul layar | Fredoka (500) | 22 px | |
| Teks isi | **Nunito** (500) | 17 px, line-height 1.5 | Mudah dibaca di layar kecil |
| Instruksi | Nunito (700) | 17 px | Maks 15 kata |
| Matematika | Nunito tabular + komponen `<Math>` | 20–24 px | Pangkat sebagai superskrip asli, variabel miring |

Font di-*self-host* (paket `@fontsource`) agar berfungsi offline. Lisensi: SIL Open Font License.

## 4. Spacing, bentuk, bayangan

- Skala spasi 4-px: 4, 8, 12, 16, 24, 32, 48. Gutter halaman 16 px di ponsel.
- Radius: tombol 16 px, kartu 20 px, papan kerja 24 px, ubin 6 px.
- Bayangan: `0 4px 0 rgba(78,122,90,.25)` (bayangan "tebal" bergaya mainan) untuk tombol; `0 8px 24px rgba(46,58,56,.08)` untuk kartu.

## 5. Komponen

| Komponen | Spesifikasi |
|----------|-------------|
| **Tombol primer** | Toska, teks **tinta gelap** tebal (teks putih di toska hanya 1,96:1 — gagal kontras), tinggi 52 px, lebar penuh di ponsel; saat ditekan turun 2 px |
| Tombol sekunder | Cream dengan bingkai beige |
| Tombol ikon | 48 × 48 px minimum (musik, petunjuk, kembali) |
| **Kartu materi** | Latar mint/cream, satu ide, maks 40 kata + 1 visual |
| **Kartu dunia** (peta) | Pulau melayang + nama + bintang + status (🔒/▶/✔) |
| **Speech bubble TATA** | Cream, ekor ke arah TATA, maks 2 kalimat, tombol 🔊 ulangi |
| **Papan kerja** | Cream polos, grid tipis, tanpa ilustrasi latar |
| **Ubin aljabar** | x²: persegi s×s; x: persegi panjang s×(s/4); 1: persegi (s/4); sudut 6 px, bayangan saat diangkat |
| **Bilah petunjuk** | Tombol 💡 dengan titik ① ② ③ menunjukkan tingkat yang sudah dibuka |
| **Toast umpan balik** | Muncul dari bawah, tidak menutupi area jawaban, hilang saat siswa menyentuh soal |
| Progress bar | Jalan setapak krem dengan jejak kaki |
| Papan ketik matematika | 4 baris tombol besar, muncul menggantikan keyboard sistem |
| Ikon | Set ikon bulat bergaris 2 px (Lucide, lisensi ISC) + ikon custom ubin |

## 6. Animasi

| Jenis | Durasi | Contoh |
|-------|--------|--------|
| Mikro (umpan balik sentuh) | 120–200 ms | Tombol menekan, ubin terangkat |
| Transisi layar | 250–300 ms | Geser kiri/kanan |
| Perayaan | ≤ 1,2 dtk | Bintang kecil + TATA *happy*; tidak menghalangi tombol Lanjut |
| Latar ambient | Lambat (8–20 dtk) | Awan & pulau melayang naik-turun — **hanya** di welcome & peta |

`prefers-reduced-motion` dan pengaturan "Kurangi animasi" mematikan animasi ambient & perayaan.

## 7. Aturan beban kognitif per layar

1. Satu ide atau satu keputusan per layar.
2. Maks 40 kata teks isi + 1 visual utama.
3. Label menempel pada objek (tidak ada legenda terpisah).
4. Saat mengerjakan soal: latar polos, TATA mengecil di pojok, tanpa animasi ambient.
5. Tombol utama selalu di posisi sama (bawah, jangkauan jempol).
6. Tidak ada auto-advance.

## 8. TATA — identitas karakter

- **Bentuk (disetujui, F-5):** lucu, bersahabat, modern — tidak terlalu kekanak-kanakan (proporsi kepala tidak berlebihan, ekspresi tenang, tanpa efek berkilau berlebihan). Robot kecil berbentuk kubus membulat warna toska (`--teal-400`), layar wajah krem dengan mata hitam bulat & pipi peach, antena berupa **tunas daun** sage, kaki pendek beige, memegang ubin x kuning. Menyatukan "robot" (brief) dan maskot di gambar referensi.
- **Ekspresi/animasi:** idle (bernapas, berkedip), waving, talking (mulut bergerak), happy (melompat kecil), confused (kepala miring, tanda tanya), celebrating (tangan ke atas + bintang).
- **Ukuran tampil:** besar (welcome, 40% tinggi layar), sedang (onboarding/peta), kecil (64 px, pojok halaman materi).
- **Kepribadian:** sabar, ingin tahu, tidak pernah mengejek; memakai "aku/kamu".

## 9. Wireframe (ponsel, 360 × 800)

### 9.1 Welcome
```
┌──────────────────────────┐
│      ☁        ☀          │
│    ALGEBRA ADVENTURE      │  ← logo di langit kosong
│ Exploring the World of…   │
│   🏝️    🏝️       🏝️      │  ← pulau melayang (ambient)
│        ┌──────┐           │
│        │ TATA │ 💬 Halo!  │
│        └──────┘           │
│ ┌──────────────────────┐ │
│ │  Mulai Petualangan ▶ │ │  ← tombol primer
│ └──────────────────────┘ │
│               Masuk Guru  │
└──────────────────────────┘
```

### 9.2 Peta petualangan (dashboard)
```
┌──────────────────────────┐
│ 🎵  ⭐ 7   XP 240     ⚙  │
│ Halo, Dimas! 👋           │
│      🏝 W5 Literasi 🔒    │
│        ┊                  │
│   🏝 W4 Menara 🔒         │
│        ┊                  │
│      🏝 W3 Kuadrat ▶      │  ← dunia aktif membesar
│        ┊                  │
│   🏝 W2 Gua ✔ ⭐⭐⭐        │
│        ┊                  │
│      🏝 W1 Lembah ✔ ⭐⭐   │
│ [📝 Pretest ✔] [🏆 Badge] │
│ TATA(kecil) 💬 Ayo ke W3! │
└──────────────────────────┘
```

### 9.3 Pelajaran mikro
```
┌──────────────────────────┐
│ ←  World 2 · 3/6  ━━━━░░ │
│                           │
│  Pemfaktoran adalah       │
│  kebalikan perkalian.     │
│                           │
│   3(x + 2)  ⇄  3x + 6     │  ← visual + label menempel
│   [ubin persegi panjang]  │
│                           │
│ TATA 💬 Ketuk panahnya!   │
│ [ ↺ Ulangi ]  [ Lanjut ▶ ]│
└──────────────────────────┘
```

### 9.4 Algebra Tiles
```
┌──────────────────────────┐
│ ←  Susun jadi persegi panjang │
│  8x² + 12x          💡①②③ │
│ ┌──────────────────────┐ │
│ │ papan grid (cream)    │ │
│ │                      │ │
│ └──────────────────────┘ │
│ Wadah: [x²]×8  [x]×12     │
│ Sisi: ? × ?               │
│ [↺ Reset]   [✔ Periksa]   │
└──────────────────────────┘
```

### 9.5 Soal latihan / kuis
```
┌──────────────────────────┐
│ ←  Latihan 2/5       💡   │
│ Faktorkan:                │
│      10y² − 15y           │
│ ┌──────────────────────┐ │
│ │ 5y(2y − 3)▌           │ │
│ └──────────────────────┘ │
│ [papan ketik matematika]  │
│ [✔ Cek]                   │
└──────────────────────────┘
```

### 9.6 Pretest / posttest
```
┌──────────────────────────┐
│ Pretest · Soal 1/4  ●○○○  │
│ Pembagian Paket Alat Tulis│
│ (teks soal asli, dapat    │
│  digulir)                 │
│ ── Jawabanmu ──           │
│ [area teks multi-baris]   │
│ [papan ketik matematika]  │
│ [◀ Soal sebelumnya] [▶]   │
│ Tersimpan otomatis ✓      │
└──────────────────────────┘
```

### 9.7 Lainnya
- **Hasil kuis:** bintang, skor, daftar soal dengan tautan pembahasan.
- **Profil & progres:** XP, badge, riwayat kuis, skor pretest/posttest (setelah dinilai).
- **Pengaturan:** musik (on/off, volume), efek suara, narasi, kurangi animasi, ukuran teks (normal/besar).
- **Tanya TATA (AI):** chat sederhana dengan saran pertanyaan; banner "TATA sedang offline" jika backend tidak tersedia.
- **Guru:** daftar siswa → jawaban → form skor per tahap → ekspor CSV.

## 10. User flow

```
Buka app ─► Welcome ─► (pertama kali) Onboarding ─► Gabung kelas / Coba tanpa kelas ─► Pretest ─► Peta
                                                                            │
           ┌────────────────────────────────────────────────────────────────┘
           ▼
     Pilih World ─► Misi ─► Ingat Lagi ─► Jelajah ─► Contoh ─► Coba Bersama ─► Aktivitas
           ▲                                                                       │
           │                                                    Latihan ◄──────────┘
           │                                                       │
           └──── Peta (bintang, XP) ◄── Pembahasan ◄── Kuis Dunia ◄┘
                                                         │ (World 5 selesai)
                                                         ▼
                                                    Posttest ─► Rapor akhir
```

## 11. Responsif

| Lebar | Tata letak |
|-------|------------|
| < 600 px (ponsel) | Satu kolom; papan kerja lebar penuh; TATA di pojok |
| 600–1024 px (tablet) | Papan kerja + panel TATA/petunjuk berdampingan saat landscape |
| > 1024 px (laptop) | Konten maks 1040 px di tengah; latar ilustrasi mengisi sisi |

- Tidak ada scroll horizontal; ubin diskalakan dari lebar papan.
- Area aman (notch) dihormati via `env(safe-area-inset-*)`.
- Teks dapat diperbesar 125% tanpa merusak tata letak.
