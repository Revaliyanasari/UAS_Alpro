// Daftar game yang SUDAH berfungsi. Game baru cukup ditambahkan di sini + halamannya.
export const GAMES = [
  {
    id: 'cepat-tepat',
    to: '/game/cepat-tepat',
    emoji: '⚡',
    title: 'Tantangan Cepat Tepat',
    desc: 'Jawab soal aljabar sebanyak-banyaknya dalam 60 detik.',
    skills: ['Koefisien', 'FPB', 'Pembagian suku', 'Pemfaktoran', 'Selisih dua kuadrat'],
  },
  {
    id: 'pasangkan',
    to: '/game/pasangkan',
    emoji: '🧩',
    title: 'Pasangkan Ekspresi',
    desc: 'Cocokkan bentuk penjumlahan dengan bentuk faktornya.',
    skills: ['Pemfaktoran FPB', 'Selisih dua kuadrat'],
  },
  {
    id: 'latihan',
    to: '/game/latihan',
    emoji: '📝',
    title: 'Latihan Soal Interaktif',
    desc: '10 soal tanpa batas waktu, lengkap dengan pembahasan.',
    skills: ['Semua materi World 1–3'],
  },
];

/** Ide game berikutnya (belum ada tombolnya — ditampilkan sebagai rencana, bukan fitur). */
export const PLANNED = ['Tebak Bentuk Aljabar', 'Susun Kartu Aljabar', 'Misi Pemfaktoran Bertingkat'];
