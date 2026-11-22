# Rancangan Integrasi Google Drive (belum diaktifkan)

> Status 22 Nov 2026: **belum terhubung**. Aplikasi tidak meminta akun Google, tidak menyimpan token, dan tidak menampilkan tombol "hubungkan" palsu. Yang sudah berfungsi: unduh cadangan JSON, rekap CSV, dan laporan PDF (cetak), lalu unggah manual ke Drive. Langkahnya tampil di Modul Guru → *Cadangan & Drive*.

## Kebutuhan

Guru menyimpan instrumen, rekap nilai, laporan, dan pindaian lembar kerja siswa ke folder Google Drive miliknya.

## Pilihan teknis

| Opsi | Cara | Kelebihan | Kekurangan |
|---|---|---|---|
| A. Manual (aktif sekarang) | Unduh berkas → unggah lewat drive.google.com | Tanpa kredensial, aman, gratis | Ada langkah manual |
| B. Google Identity Services + Drive API dari browser | OAuth 2.0 *token model*, scope **`drive.file`** (hanya berkas yang dibuat aplikasi) | Tanpa server; token tidak pernah disimpan permanen | Perlu proyek Google Cloud, *OAuth consent screen*, dan domain HTTPS terdaftar |
| C. Lewat backend | OAuth *authorization code* di server, token di server | Bisa unggah terjadwal | Server harus menyimpan token dengan aman; lebih rumit |

**Rekomendasi:** Opsi B setelah aplikasi di-deploy ke HTTPS (Fase 7).

## Langkah Opsi B (saat nanti dikerjakan)

1. Pemilik proyek membuat proyek di Google Cloud Console, mengaktifkan **Google Drive API**, dan membuat **OAuth Client ID (Web)** dengan *Authorized JavaScript origins* = domain HTTPS aplikasi.
2. *Client ID* (bukan rahasia) disimpan di `frontend/.env` sebagai `VITE_GOOGLE_CLIENT_ID`. **Client secret tidak dipakai dan tidak boleh ada di frontend.**
3. Muat skrip resmi `https://accounts.google.com/gsi/client` hanya di Modul Guru (dimuat malas).
4. Saat guru menekan "Simpan ke Drive": minta token dengan scope `https://www.googleapis.com/auth/drive.file`, buat folder "Algebra Adventure – Evaluasi" bila belum ada, lalu unggah berkas lewat `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`.
5. Token akses hanya disimpan di memori (bukan localStorage/IndexedDB), lalu hilang saat halaman ditutup.
6. Tombol "Simpan ke Drive" baru ditampilkan jika `VITE_GOOGLE_CLIENT_ID` ada dan skrip GIS berhasil dimuat (CLAUDE.md aturan 3).

## Privasi

- Berkas memakai **kode siswa** (S01), bukan nama lengkap.
- Scope `drive.file` membuat aplikasi tidak bisa membaca berkas lain di Drive guru.
- Pindaian lembar kerja tetap diunggah guru sendiri. Aplikasi tidak memproses foto siswa.
