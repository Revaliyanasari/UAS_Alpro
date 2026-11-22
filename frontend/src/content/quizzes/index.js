import world1 from './world-1.json';
import world2 from './world-2.json';
import world3 from './world-3.json';

// Kuis dunia yang sudah tersedia. Pulau tanpa kuis tidak menampilkan tombol kuis.
export const quizzes = { 1: world1, 2: world2, 3: world3 };

// Teks umum halaman kuis (bukan soal).
export const quizCopy = {
  lockedText: 'Selesaikan pelajaran di pulau ini dulu, ya. Setelah itu Kuis Dunia terbuka.',
  passText: 'Hebat, kamu lulus! {next} sudah terbuka. Baca pembahasan di bawah untuk memperkuat pemahamanmu.',
  passLast: 'Hebat, kamu lulus! Baca pembahasan di bawah untuk memperkuat pemahamanmu.',
  failText: 'Belum mencapai {pass}. Tidak apa-apa! Baca pembahasannya, lalu coba lagi dengan soal varian.',
};
