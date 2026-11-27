// Pesan ramah untuk siswa saat AI bermasalah (dipakai server lokal & Netlify Function).
export const FRIENDLY = {
  auth: 'TATA AI belum bisa dipakai: konfigurasi server perlu diperiksa guru.',
  quota: 'TATA AI sedang istirahat (kuota habis). Pakai tombol petunjuk 💡 dulu, ya.',
  rate: 'TATA AI sedang ramai. Coba lagi sebentar lagi.',
  timeout: 'TATA AI terlalu lama berpikir. Coba tanyakan lagi dengan kalimat lebih singkat.',
  unavailable: 'TATA AI sedang tidak tersedia. Pakai tombol petunjuk 💡 dulu, ya.',
  bad_response: 'Jawaban TATA AI tidak terbaca. Coba lagi.',
};

/** Status HTTP untuk setiap kode error penyedia. */
export const statusFor = (code) => (code === 'timeout' ? 504 : code === 'rate' ? 429 : 502);
