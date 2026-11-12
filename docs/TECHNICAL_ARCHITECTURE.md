# Arsitektur Teknis — Algebra Adventure

> Revisi 12 Nov 2026 mengikuti keputusan F-6: backend **sederhana & gratis**. Fitur inti memakai **Supabase langsung dari frontend** (dilindungi Row Level Security). Backend Python (FastAPI) baru dibangun saat fitur AI dikerjakan.

## 1. Gambaran umum

```
┌────────────────────────── Perangkat siswa / guru (browser atau PWA) ──────────────────────────┐
│ React + Vite (JavaScript)                                                                       │
│  ├─ UI & halaman (react-router)            ├─ Mesin polinomial (pemeriksa jawaban, teruji unit) │
│  ├─ Mesin pelajaran (konten JSON)          ├─ TATA: 2D SVG ⇄ 3D three.js (lazy)                 │
│  ├─ Algebra Tiles, Papan, Puzzle (dnd-kit) ├─ Audio: musik, efek, narasi                        │
│  ├─ IndexedDB: progres, jawaban, antrean   └─ Service Worker: offline                           │
│  └─ supabase-js (anon key publik + sesi pengguna)                                               │
└───────────────┬──────────────────────────────────────────────────────┬─────────────────────────┘
                │ HTTPS                                                 │ (fase AI, nanti)
        ┌───────▼─────────────────────────┐                    ┌───────▼────────────────────┐
        │ Supabase (free tier)             │                    │ Backend Python (FastAPI)    │
        │  Auth: guru = email+password     │                    │  /ai/chat  → penyedia AI    │
        │        siswa = anonymous sign-in │                    │  API key di variabel env    │
        │  Postgres + RLS                  │                    └────────────────────────────┘
        │  Fungsi SQL: join_class, submit  │
        └─────────────────────────────────┘
```

**Prinsip:** *offline-first*. Seluruh pembelajaran, kuis, dan pengerjaan tes berjalan tanpa internet. Internet hanya diperlukan untuk mengirim hasil ke guru (otomatis saat online) dan untuk halaman guru.

### Mengapa tanpa server Python untuk fitur inti?
| | Supabase langsung | FastAPI + Supabase |
|---|---|---|
| Server yang harus di-hosting | Tidak ada | 1 (bisa "tidur" di free tier) |
| Keamanan data | RLS di database | Kode backend + RLS |
| Kerumitan untuk pemula | Rendah | Sedang |
| Cocok untuk | Simpan progres, tes, penilaian, ekspor | Logika rahasia (API key AI) |

Kunci `anon` Supabase memang dirancang untuk dipasang di frontend; yang **tidak boleh** ada di frontend adalah kunci `service_role` dan API key AI.

## 2. Teknologi

| Lapisan | Pilihan | Alasan | Biaya |
|---------|---------|--------|-------|
| Build | Vite | Cepat, sederhana | Gratis |
| UI | React (JavaScript) | Sesuai permintaan | Gratis |
| Routing | react-router | Standar | Gratis |
| State | Zustand | Kecil, sederhana | Gratis |
| Gaya | CSS Modules + CSS variables | Design token terpusat | Gratis |
| Drag & drop | @dnd-kit/core | Sentuh, mouse, keyboard | Gratis |
| Simpan lokal | idb-keyval (IndexedDB) | Tahan lama, offline | Gratis |
| Database & auth | Supabase + supabase-js | Free tier, RLS, auth anonim | Gratis* |
| PWA | vite-plugin-pwa (Workbox) | Manifest + service worker | Gratis |
| 3D | three + @react-three/fiber, dimuat malas | Sesuai brief, tidak membebani halaman lain | Gratis |
| Font | @fontsource/fredoka, @fontsource/nunito | Offline | Gratis (OFL) |
| Ikon | lucide-react | Ringan | Gratis (ISC) |
| Uji | Vitest + Testing Library; Playwright (emulasi ponsel) | | Gratis |
| Hosting frontend | Netlify / Vercel / Cloudflare Pages | HTTPS (wajib untuk PWA) | Gratis |
| Backend AI (nanti) | Python 3.12+, FastAPI, di Render free tier | Sesuai brief | Gratis* + biaya API AI |

\* **Batasan free tier:** proyek Supabase gratis dijeda setelah ±1 minggu tanpa aktivitas (aktifkan lagi dari dasbor sebelum uji coba); layanan gratis Render tidur saat idle (±30–60 detik untuk bangun). Batas kuota dapat berubah — periksa sebelum uji coba.

**Prasyarat di laptop:** Node.js LTS (**belum terpasang**), Git. Python 3.12+ baru diperlukan pada fase AI.

## 3. Struktur folder

```
UAS_Projek/
├─ CLAUDE.md  README.md
├─ docs/
├─ supabase/
│  └─ migrations/              # file SQL skema + RLS + fungsi (dijalankan di SQL editor Supabase)
├─ frontend/
│  ├─ index.html  vite.config.js  .env.example   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│  ├─ public/                  # ikon PWA
│  └─ src/
│     ├─ main.jsx, App.jsx, routes.jsx
│     ├─ styles/               # tokens.css, global.css
│     ├─ components/ui/        # Button, Card, SpeechBubble, ProgressPath, MathText, MathKeypad, Toast
│     ├─ components/tata/      # Tata.jsx (pemilih 2D/3D), Tata2D.jsx, Tata3D.jsx, tataStates.js
│     ├─ features/
│     │  ├─ welcome/ onboarding/ join/ map/ lesson/ quiz/ assessment/
│     │  ├─ tiles/  board/  puzzle/  squares/  divider/   # manipulatif
│     │  ├─ hints/  progress/  audio/  settings/
│     │  └─ teacher/           # login guru, penilaian rubrik, ekspor
│     ├─ math/                 # parser.js, polynomial.js, factor.js, diagnose.js (+ *.test.js)
│     ├─ content/              # world1.json … world5.json, instrument/
│     ├─ store/                # zustand + persist IndexedDB
│     └─ services/             # supabase.js, sync.js (antrean offline), export.js
└─ backend/                    # DIBUAT NANTI (fase AI)
```

## 4. Konten sebagai data

Materi, soal, petunjuk, dan instrumen disimpan sebagai JSON, bukan ditulis langsung di komponen:

```json
{
  "id": "w2-latihan-04",
  "type": "factor-input",
  "prompt": "Faktorkan:",
  "expression": "10y^2 - 15y",
  "accept": { "equivalentTo": "10y^2 - 15y", "requireFullyFactored": true },
  "hints": [
    "Cari dulu FPB dari kedua suku.",
    "FPB dari 10 dan 15 berapa? Pangkat y terkecil berapa?",
    "FPB-nya 5y. Sekarang bagi: 10y² : 5y = … dan 15y : 5y = …"
  ],
  "solution": ["FPB = 5y", "10y² : 5y = 2y", "15y : 5y = 3", "10y² − 15y = 5y(2y − 3)"]
}
```

Anda dapat merevisi konten tanpa menyentuh logika, dan seluruh kunci diuji otomatis oleh mesin polinomial.

## 5. Mesin polinomial (pemeriksa jawaban)

Modul JavaScript kecil buatan sendiri di `src/math/`:

1. **Parser:** membaca `5y(2y-3)`, `4x(2x+3)`, `(x+5)(x-5)`, `8x^2+12x`, `8x²`, `−`, `×`, `·`, `:`, perkalian implisit.
2. **Representasi:** polinomial = peta `monomial → koefisien` (bilangan rasional), variabel x, y, a, b, k, p.
3. **Operasi:** tambah, kurang, kali, ekspansi, pembagian suku tunggal.
4. **Ekuivalensi:** ekspansi jawaban = ekspansi kunci.
5. **Faktor penuh:** faktor monomial luar = FPB semua suku; binomial di dalam tidak punya FPB > 1; selisih dua kuadrat sudah dipecah.
6. **Diagnosis kesalahan:** pola M1–M9 (LEARNING_DESIGN §5.2).

Target cakupan uji ≥ 95% — inilah penjamin kebenaran matematis aplikasi.

## 6. Algebra Tiles — model data & validasi

- Ubin: `{id, kind: 'x2'|'x'|'1', orientation: 'h'|'v', cell: {row, col} | null}`.
- Papan memakai **grid bertipe**: tiap kolom bertipe lebar `x` atau `1`, tiap baris bertipe tinggi `x` atau `1`; tipe ditentukan oleh ubin pertama di kolom/baris itu.
- Validasi persegi panjang: semua sel dalam batas terisi tepat sekali, setiap ubin cocok dengan tipe baris & kolomnya, semua ubin terpakai.
- Pembacaan sisi: tinggi = (banyak baris tipe x)·x + (banyak baris tipe 1); lebar sama → diteruskan ke mesin polinomial (ekuivalensi & cek FPB).
- Interaksi: dnd-kit `PointerSensor` (mouse & sentuh, dengan `touch-action: none` pada ubin agar layar tidak ikut bergulir), `KeyboardSensor`, plus mode **ketuk-pilih-ketuk-taruh**. Ubin dirender sebagai elemen DOM/SVG (bukan canvas) agar ringan & aksesibel.
- "Mesin Pembagi" (World 1.6) memakai komponen papan yang sama dengan satu sisi dikunci.

## 7. Penyimpanan & sinkronisasi data

1. **Siswa bergabung:** memasukkan kode kelas + kode siswa → `supabase.auth.signInAnonymously()` → memanggil fungsi SQL `join_class(join_code, student_code, nickname)` yang membuat baris `students` terhubung ke `auth.uid()`.
2. **Mode demo** ("Coba tanpa kelas"): tidak login; data hanya di IndexedDB.
3. **Selama belajar:** semua ditulis ke IndexedDB dulu, lalu dikirim berkala (antrean `syncQueue`, setiap item punya `client_id` unik → `upsert` idempoten).
4. **Kirim tes:** fungsi SQL `submit_test(attempt_id)` mengunci jawaban (tidak bisa diubah lagi).
5. **Guru:** login email → membaca data kelasnya (RLS), mengisi skor tahap, mengekspor CSV.

**Keterbatasan jujur auth anonim:** jika siswa menghapus data browser atau berganti HP, sesi anonim hilang. Data yang sudah terkirim tetap aman di database dan terlihat oleh guru; guru dapat **menautkan ulang** kode siswa ke sesi baru dari halaman Guru. Untuk uji coba terbatas, sarankan siswa memakai satu perangkat/browser yang sama.

## 8. PWA

- **Manifest:** "Algebra Adventure" / "AlgebraAdv", `display: standalone`, `theme_color` toska, `background_color` cream, ikon 192/512 + maskable.
- **Service worker (Workbox):** precache shell, font, konten JSON, instrumen, ilustrasi; runtime cache (CacheFirst) untuk 3D & musik; network-only untuk Supabase & AI.
- **Pembaruan:** banner "Versi baru tersedia" — tidak memuat ulang paksa saat tes berlangsung.
- **Instalasi:** prompt Chrome Android + tombol "Pasang di HP" (`beforeinstallprompt`) + petunjuk manual untuk browser lain.
- PWA dasar (manifest + SW) dipasang sejak Fase 1 agar setiap fase dapat diuji di HP; penyempurnaan di fase PWA.

## 9. TATA (2D & 3D)

- Satu antarmuka: `<Tata state="idle|waving|talking|happy|confused|celebrating" size="lg|md|sm" message="..." />`.
- **Tata2D (SVG):** dipakai di halaman materi/soal (ukuran kecil), dan sebagai fallback otomatis jika WebGL tidak ada, perangkat lemah, atau "Kurangi animasi" aktif.
- **Tata3D (three.js / React Three Fiber, lazy):** di welcome, onboarding, peta, perayaan.
  - Model awal **prosedural** dari primitif three.js (kubus membulat toska, layar wajah krem, mata, pipi peach, antena tunas daun sage, lengan & kaki) — benar-benar 3D, hampir tanpa ukuran file, animasi lewat kode.
  - Dapat diganti file **GLB** final dengan klip animasi bernama sama tanpa mengubah komponen lain.
  - Anggaran performa: satu canvas WebGL aktif, `dpr` ≤ 1.5, frameloop `demand` saat idle, < 5.000 segitiga, berhenti saat tab tersembunyi.
- Petunjuk bertahap tampil melalui speech bubble TATA dengan ekspresi sesuai situasi.

## 10. Audio

- `AudioManager` tunggal: kanal musik, efek, narasi; volume per kanal; pengaturan tersimpan.
- Tidak ada suara sebelum interaksi pertama; musik mengecil saat narasi; berhenti saat tab tersembunyi.
- **Narasi:** Web Speech API (`id-ID`). Ketersediaan suara Indonesia bergantung perangkat — jika tidak ada, tombol 🔊 disembunyikan. Narasi rekaman menyusul (fitur lanjutan).

## 11. AI Learning Assistant (fitur lanjutan)

Dikerjakan **setelah fitur inti selesai** (F-9). Rancangan tetap:
- Backend FastAPI `/ai/chat`; frontend tidak pernah memegang API key.
- Antarmuka penyedia yang dapat diganti:
  ```python
  class AIProvider(Protocol):
      name: str
      async def chat(self, system: str, messages: list[dict], max_tokens: int) -> str: ...
  ```
  dipilih lewat variabel `AI_PROVIDER`; implementasi Anthropic memakai SDK resmi `anthropic`.
- Aturan tutor: bahasa sederhana, Socratic (petunjuk dulu), hanya cakupan materi, tanpa data pribadi, **nonaktif selama tes**.
- Biaya (perkiraan 600 pertanyaan): Claude Haiku 5.5 ± $0,25–0,50; Claude Opus 5.5 ± $8–15 (tarif saat ini, periksa ulang). Tidak diaktifkan tanpa persetujuan.

## 12. Keamanan & privasi

- `.env` di `.gitignore`; hanya `.env.example` (nama variabel) yang di-commit. Kunci `service_role` tidak pernah dipakai di frontend.
- RLS aktif di semua tabel; siswa hanya bisa membaca/menulis datanya sendiri; guru hanya kelasnya.
- Siswa tanpa email & tanpa nama lengkap; guru dengan email.
- Aktifkan proteksi penyalahgunaan auth anonim di Supabase (batas laju; CAPTCHA opsional).
- Persetujuan wali sebelum uji coba; data dapat dihapus atas permintaan.
