import world1 from './world-1.json';
import world2 from './world-2.json';

// Pelajaran yang sudah tersedia. Pulau tanpa pelajaran tampil "Segera hadir" di peta.
export const lessons = { 1: world1, 2: world2 };

// Teks umum pemutar pelajaran (bukan materi).
export const lessonCopy = {
  correct: 'Tepat sekali!',
  needAll: 'Masih ada ubin di nampan. Pasang semuanya, ya.',
  notEqual: 'Isi setiap kotak harus sama. Coba pindahkan beberapa ubin.',
  finishTitle: 'Pulau selesai!',
  finishText: 'Hebat! Kamu menyelesaikan {world}. Pulau berikutnya sudah terbuka.',
};
