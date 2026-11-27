# Menyiapkan AI Learning Assistant (DeepSeek)

> Status 22 Nov 2026: struktur integrasi **selesai dan teruji dengan server DeepSeek tiruan** (browser → proxy Vite → backend → API). **Belum diuji dengan API key DeepSeek asli**, karena kunci belum tersedia.

## 1. Cara kerja & keamanan

```
Browser (React) ──/api/ai/*──► Proxy Vite (dev) ──► backend/src/server.js ──HTTPS──► api.deepseek.com
                                                    (API key dari backend/.env)
```

- API key **hanya** ada di `backend/.env`. File ini diabaikan Git (`.gitignore`: `.env`, `.env.*`), jadi tidak pernah ikut ter-upload ke GitHub.
- Frontend hanya mengirim pertanyaan siswa dan teks soal yang sedang dikerjakan. **Nama panggilan, progres, kunci jawaban, dan pembahasan tidak dikirim.** Email dan nomor HP yang terlanjur diketik siswa disamarkan di server sebelum dikirim ke AI.
- Batas penggunaan: 20 pertanyaan per 10 menit per alamat IP (server) dan 15 pertanyaan per sesi pelajaran (aplikasi). Keduanya bisa diatur.
- Batas waktu 20 detik. Pesan error ramah untuk kunci salah, kuota/saldo habis, server sibuk, dan internet putus. Siswa diarahkan memakai tombol petunjuk 💡.
- Tombol **Tanya TATA** hanya muncul jika server AI aktif dan tidak dimatikan di Pengaturan. Tombol ini **tidak tersedia saat kuis**.

## 2. Mengaktifkan

1. Buat akun dan API key di platform DeepSeek (https://platform.deepseek.com). **Jangan tempel kunci di chat, kode, atau GitHub.**
2. Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `AI_API_KEY=` dengan kunci Anda.
3. Jalankan dua terminal:
   ```bash
   # Terminal 1 — proxy AI
   cd UAS_Projek/frontend
   npm run ai            # sama dengan: cd ../backend && npm start
   # Terminal 2 — aplikasi
   cd UAS_Projek/frontend
   npm run dev
   ```
4. Buka **Pengaturan → Asisten AI TATA**. Jika tertulis "Server AI aktif.", tombol **💬 Tanya TATA** akan muncul di setiap layar pelajaran.

Tanpa langkah di atas, aplikasi tetap berjalan normal. Fitur AI hanya disembunyikan, dan Pengaturan menjelaskan alasannya.

## 2a. Kunci ditolak? (pemeriksaan cepat)

1. Buka https://platform.deepseek.com → **API keys** → **Create new API key**. Kunci hanya ditampilkan **sekali**, bentuknya `sk-` lalu ±32 huruf/angka. Salin seluruhnya.
2. Buka `backend/.env` di VS Code dan ganti baris `AI_API_KEY=...` dengan `AI_API_KEY=sk-...` (tanpa spasi atau tanda kutip). Simpan.
3. Jalankan `cd backend && npm run cek-kunci`.
   - ✔ "BERFUNGSI" → selesai.
   - ✘ "auth" → kunci salah/terpotong/dihapus, ulangi langkah 1.
   - ✘ "quota" → kunci benar, saldo habis (Top up di platform DeepSeek).
4. Jalankan proxy (`npm run ai` dari folder `frontend`) bersama `npm run dev`, lalu buka menu ⋮ → **Asisten Belajar**.

Jangan menempel kunci di chat atau file lain selain `backend/.env` (diabaikan Git) dan dasbor hosting.

## 3. Biaya

DeepSeek adalah layanan **berbayar per token**: setiap pertanyaan dan jawaban memakai saldo. Periksa tarif terbaru di halaman harga DeepSeek sebelum dipakai di kelas. Fitur ini disiapkan karena diminta dosen, tetapi **tetap nonaktif sampai Anda sendiri mengisi API key** (CLAUDE.md aturan 6). Pengendali biaya:
- `AI_MAX_TOKENS=400`: jawaban maksimal sekitar 80 kata.
- `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MIN`: batas pertanyaan.
- Alternatif gratis: petunjuk 3 tingkat dan umpan balik diagnostik yang sudah ada tidak memerlukan AI.

## 4. Perilaku tutor (ringkas)

Prompt sistem ada di `backend/src/ai/prompt.js` dan diturunkan dari MLE & Learning Activity RMT (lihat `docs/RMT_DESIGN.md` §6). Isinya: tidak memberi jawaban akhir, mulai dari *diketahui/ditanya*, satu pertanyaan pemantik per jawaban, menjelaskan letak kesalahan, mengajak cek dengan mengalikan kembali, contoh sehari-hari, hanya cakupan materi, dan tanpa data pribadi.

⚠ AI bisa keliru. Aplikasi menampilkan pengingat "Selalu cek dengan mengalikan kembali". Sebelum dipakai siswa, uji jawaban AI untuk soal-soal World 1–2 bersama dosen.

## 5. Pengujian

- `cd backend && npm test`: 10 uji (tanpa internet dan tanpa kunci asli) untuk status nonaktif, prompt RMT, batas laju, batas waktu, validasi, penyamaran data pribadi, format permintaan DeepSeek, pemetaan error 401/402/429/5xx, dan memastikan kunci tidak bocor.
- `cd frontend && npm test`: uji tombol tersembunyi/tampil, tidak ada di kuis, pesan error, dan data siswa yang tidak terkirim.
- Uji rantai lengkap dengan server tiruan: berhasil (22 Nov 2026).
- **Belum:** uji dengan kunci asli. Setelah kunci diisi, coba 5–10 pertanyaan dari layar World 1–2 dan periksa ketepatan jawabannya.

## 6. Catatan teknis

Rancangan awal memakai FastAPI (Python). Di laptop pengembangan, Python hanya tersedia sebagai *stub* Microsoft Store (tidak bisa dijalankan), sehingga proxy dibuat dengan **Node.js bawaan tanpa dependensi**. Dengan begitu proxy bisa diuji dan dijalankan dengan satu perintah. Antarmuka penyedia (`backend/src/ai/provider.js`) tetap bisa diganti dengan penyedia lain lewat `AI_PROVIDER`.

## 2b. Beralih ke Google Gemini (27 Nov 2026)

Kunci baru dari pemilik ternyata **kunci Google Gemini** (AI Studio, berawalan `AQ.`), bukan DeepSeek — DeepSeek menolaknya (401), Gemini menerimanya. Karena saldo DeepSeek kosong, backend kini memakai Gemini:

- `backend/.env`: `AI_PROVIDER=gemini`, `AI_API_KEY=<kunci Gemini>`. Kunci DeepSeek lama disimpan sebagai baris komentar (`# DEEPSEEK_API_KEY_LAMA=…`) — untuk kembali, ubah `AI_PROVIDER=deepseek` dan pindahkan kunci lama ke `AI_API_KEY`.
- Endpoint Gemini yang kompatibel OpenAI (`generativelanguage.googleapis.com/v1beta/openai`), jadi kode backend hanya ditambah pilihan penyedia — tidak dirombak.
- Model: `gemini-flash-lite-latest` (±1 detik saat diuji) dengan cadangan otomatis `gemini-3-flash-preview` bila model utama sibuk/tidak tersedia. `gemini-2.5-flash` tidak tersedia untuk kunci baru; `gemini-3.8-flash` sangat lambat/sibuk saat diuji. Bisa diubah lewat `AI_MODEL` / `AI_FALLBACK_MODELS`.
- Cek kunci: `cd backend && npm run cek-kunci` → "✔ API key Google Gemini BERFUNGSI".
- Tampilan chat membersihkan penanda LaTeX (`$…$`) dan Markdown (`**…**`) yang kadang dipakai Gemini.
- **Catatan:** GitHub Pages hanya menyajikan file statis, jadi Tanya TATA tetap tidak tersedia di situs GitHub Pages. AI berjalan bila backend dijalankan (`npm run ai` + `npm run dev`) atau setelah situs dipasang di Netlify dengan `AI_PROVIDER` & `AI_API_KEY` diisi di Environment variables Netlify (bukan di GitHub).
