# Deployment — Algebra Adventure

> Diperbarui 22 Nov 2026.

## Ringkasan

| Alamat | Platform | Biaya | Status | AI (Tanya TATA) |
|---|---|---|---|---|
| **https://revaliyanasari.github.io/UAS_Alpro/** | GitHub Pages | Gratis | ✅ **Online & teruji** | Tidak ada (Pages hanya file statis → tombol otomatis tersembunyi) |
| `https://<nama-situs>.netlify.app` | Netlify (frontend + fungsi AI) | Gratis (paket Starter) | ⏳ Konfigurasi siap, **perlu akun Anda** | Ya, bila `AI_API_KEY` diisi di Netlify |

Semua fitur lain (identitas, World 1–3, kuis, Galeri TATA, Modul Guru, suara, PWA/offline) berjalan di kedua alamat. Data siswa tersimpan di perangkat masing-masing pengguna (IndexedDB), bukan di server.

## A. GitHub Pages (sudah aktif)

- Sumber: branch `gh-pages` (hanya hasil build, branch `main` tidak diubah).
- Memperbarui setelah ada perubahan kode:
  ```bash
  cd UAS_Projek/frontend
  npm run deploy:pages     # build untuk /UAS_Alpro/ lalu unggah ke branch gh-pages
  npm run test:live        # uji asap terhadap situs online (Edge, ponsel & laptop)
  ```
- Tautan langsung (mis. `/UAS_Alpro/peta`) tetap terbuka saat dimuat ulang berkat `404.html`.
- Pengguna yang sudah pernah membuka akan melihat "Versi baru tersedia" (PWA) dan bisa memuatnya.

## B. Netlify (untuk mengaktifkan AI) — langkah yang perlu Anda lakukan

Netlify dipilih karena menjalankan aplikasi **dan** proxy AI di satu alamat (tanpa CORS), fungsi serverless gratis, dan API key disimpan sebagai environment variable rahasia.

1. Pastikan file berikut sudah ada di GitHub (`main`): `netlify.toml`, `netlify/functions/ai.mjs`, `backend/src/webHandler.js`, `backend/src/ai/messages.js` (lihat bagian D).
2. Buka https://app.netlify.com → **Sign up** (pilih *Sign up with GitHub*, gratis).
3. **Add new site → Import an existing project → GitHub** → izinkan akses → pilih repo **UAS_Alpro**.
4. Pengaturan build terbaca otomatis dari `netlify.toml` (biarkan apa adanya) → **Deploy**.
5. Setelah situs dibuat: **Site configuration → Environment variables → Add a variable**
   - Key: `AI_API_KEY` · Value: *API key DeepSeek Anda* · centang **Contains secret values** (bila tersedia).
   - (Opsional) `RATE_LIMIT_MAX`, `AI_MAX_TOKENS` — lihat `backend/.env.example`.
6. **Deploys → Trigger deploy → Deploy site** (agar variabel terbaca).
7. Buka `https://<nama-situs>.netlify.app/api/ai/status` → harus tampil `{"enabled":true,...}` (kunci TIDAK ikut tampil).
8. Uji: `LIVE_URL=https://<nama-situs>.netlify.app/ npm run test:live` (dari folder `frontend`), lalu coba Tanya TATA di satu layar pelajaran.
9. (Opsional) Ganti nama situs: **Site configuration → Change site name** → mis. `algebra-adventure-uas`.

⚠ **Jangan** menempel API key di chat, di kode, atau di GitHub. Isi hanya di dasbor Netlify.
⚠ DeepSeek berbayar per token. Batas bawaan: 20 pertanyaan / 10 menit per perangkat (per instans fungsi) dan 15 per sesi pelajaran.

## C. Keamanan

- API key hanya di environment variable hosting (Netlify) atau `backend/.env` (lokal, diabaikan Git).
- Build frontend diperiksa: tidak memuat kunci/alamat DeepSeek. Browser hanya memanggil `/api/ai/*`.
- Identitas siswa tidak pernah dikirim ke server/AI.

## D. Perubahan kode untuk deployment (22 Nov 2026)

- `vite.config.js`: `base` dapat diatur (`VITE_BASE`, bawaan `/`), manifest PWA mengikuti `base`.
- `main.jsx`: `BrowserRouter basename` dari `BASE_URL`.
- `aiClient.js`: alamat proxy dapat diatur (`VITE_AI_BASE_URL`, bawaan: server yang sama).
- `scripts/deploy-pages.mjs`, `playwright.live.config.js`, `e2e-live/` (uji situs online).
- `netlify.toml`, `netlify/functions/ai.mjs`, `backend/src/webHandler.js` (+ 5 uji), `backend/src/ai/messages.js`.
- Perilaku lokal (`npm run dev`) tidak berubah.

## E. Batasan

- Data siswa per perangkat/browser: siswa yang pindah HP mulai dari awal (belum ada sinkronisasi server).
- Pembatas laju di Netlify bersifat per instans fungsi (perlindungan dasar).
- TATA 3D di halaman pembuka butuh beberapa detik untuk muncul pada koneksi lambat saat kunjungan pertama.

## F. Pembaruan aplikasi setelah deploy (service worker) — diperbaiki 27 Nov 2026

**Masalah:** setelah deploy `ffaa1b3`, situs GitHub Pages sudah menyajikan file baru, tetapi perangkat yang pernah membuka aplikasi tetap menampilkan versi lama.

**Penyebab (dibuktikan dengan reproduksi di Edge memakai file `gh-pages` lama persis):**
1. `registerType: 'prompt'`: service worker baru hanya *menunggu* (waiting); versi lama terus disajikan dari Cache Storage walau halaman dimuat ulang atau tab baru dibuka, sampai tombol "Muat ulang" ditekan atau SEMUA tab/PWA ditutup.
2. Spanduk "Versi baru tersedia" berada di aliran halaman dan tertutup latar halaman pembuka → tombolnya tidak pernah terlihat.

**Perbaikan:**
- `vite.config.js`: `registerType: 'autoUpdate'` + `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`. Service worker baru langsung aktif — termasuk di perangkat yang masih memakai service worker lama (browser mengunduh `sw.js` baru saat situs dibuka).
- `src/pwa/UpdatePrompt.jsx`: di halaman biasa langsung memuat ulang ke versi baru; saat pelajaran/kuis/game pembaruan ditunda (pemberitahuan "Perbarui sekarang"/"Nanti") dan dipasang begitu siswa keluar; pembaruan juga diperiksa saat aplikasi dibuka lagi dari latar belakang dan tiap 30 menit.
- Pemberitahuan melayang di lapisan teratas (`--z-toast`).
- Hanya cache file aplikasi yang dibersihkan; **localStorage & IndexedDB (data dan progres siswa) tidak disentuh** (diverifikasi).

**Yang dialami pengguna:**
- Perangkat yang masih memakai versi lama: buka situs/aplikasi sekali (service worker baru terpasang di latar belakang), lalu buka/muat ulang sekali lagi → versi terbaru. Tidak perlu menghapus data browser.
- Deploy berikutnya: versi baru tampil pada pembukaan pertama setelah deploy.
