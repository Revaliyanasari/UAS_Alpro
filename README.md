# Algebra Adventure

*Exploring the World of Algebra* — aplikasi pembelajaran interaktif pemfaktoran bentuk aljabar untuk siswa SMP kelas VII.

**Status:** versi awal (MVP) berjalan secara lokal — lihat [docs/PROGRESS.md](docs/PROGRESS.md) untuk cara menjalankan, fitur, dan roadmap.

## Cara menjalankan (lengkap dengan Tanya TATA/AI)

1. Klik dua kali **`Jalankan Algebra Adventure.bat`** di folder proyek (atau: `cd frontend` lalu `npm run mulai`).
2. Browser terbuka otomatis di http://localhost:5173. Dari HP di Wi-Fi yang sama, buka alamat "HP (Wi-Fi sama)" yang tampil di jendela.
3. Biarkan jendela itu terbuka selama aplikasi dipakai; tutup jendela untuk berhenti.

Syarat: Node.js terpasang dan `backend/.env` berisi `AI_PROVIDER` + `AI_API_KEY` (lihat `backend/.env.example` dan `docs/AI_SETUP.md`). Tanpa kunci, aplikasi tetap berjalan dan Tanya TATA disembunyikan.

**Versi online:** https://revaliyanasari.github.io/UAS_Alpro/ (semua fitur kecuali Tanya TATA, karena GitHub Pages tidak menjalankan server AI). Agar AI juga online: `docs/DEPLOYMENT.md` bagian B (Netlify).

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [docs/00_ANALISIS_DOKUMEN.md](docs/00_ANALISIS_DOKUMEN.md) | Analisis wawancara & instrumen, temuan, keputusan terbuka |
| [docs/PRD.md](docs/PRD.md) | Kebutuhan produk, user stories, kriteria penerimaan |
| [docs/LEARNING_DESIGN.md](docs/LEARNING_DESIGN.md) | Tujuan, alur, Cognitive Load Theory, scaffolding, literasi |
| [docs/CONTENT_PLAN.md](docs/CONTENT_PLAN.md) | Materi, contoh, aktivitas, kuis per World |
| [docs/ASSESSMENT_PLAN.md](docs/ASSESSMENT_PLAN.md) | Pretest, posttest, rubrik, penilaian |
| [docs/INSTRUMEN_REVISI_VERSI_B.md](docs/INSTRUMEN_REVISI_VERSI_B.md) | Revisi instrumen: kisi-kisi, soal, kunci, rubrik (draf) |
| [docs/UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md) | Design system, wireframe, user flow |
| [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) | Arsitektur, PWA, AI, 3D, audio |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Tabel, relasi, keamanan data |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Fase kerja, prioritas, risiko |
| [docs/TESTING_PLAN.md](docs/TESTING_PLAN.md) | Kasus uji |
| [docs/ASSET_GUIDE.md](docs/ASSET_GUIDE.md) | Ilustrasi, 3D, musik, suara, video, lisensi |
| [CLAUDE.md](CLAUDE.md) | Instruksi untuk Claude Code |

Pengembang: Reva Liyanasari — S1 Pendidikan Matematika.
