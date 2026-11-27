// Langkah tur Beranda. target = selector CSS; elemen pertama yang terlihat yang disorot
// (mis. tombol ⋮ di HP atau sidebar di laptop). Tanpa target → kartu tampil di bawah layar.
export const DASHBOARD_TOUR = [
  {
    title: 'Halo, aku TATA!',
    text: 'Aku akan menemanimu belajar faktorisasi aljabar. Tur ini singkat, dan kamu bisa melewatinya kapan saja.',
    mood: 'wave',
  },
  {
    target: '[aria-label="Navigasi samping"], [aria-label="Buka menu"]',
    title: 'Menu',
    text: 'Semua halaman ada di sini: Beranda, Peta, Materi, Permainan, Tanya TATA, Prestasi, Profil, dan lainnya.',
  },
  {
    target: '[data-tour="next"]',
    title: 'Lanjutkan belajar',
    text: 'Tombol ini selalu membawamu ke langkah berikutnya: pelajaran, kuis, atau game.',
    mood: 'cheer',
  },
  {
    target: '[data-tour="stats"]',
    title: 'XP, bintang, dan lencana',
    text: 'Kumpulkan XP dari pelajaran dan game. Bintang didapat dari kuis tiap pulau.',
  },
  {
    target: '[aria-label^="Pengaturan suara"]',
    title: 'Suara',
    text: 'Atur musik, efek suara, dan suaraku di sini. Kamu bisa mematikannya kapan saja.',
  },
  {
    target: 'a[aria-label="Pengaturan"]',
    title: 'Pengaturan',
    text: 'Ukuran teks, animasi, dan tur ini bisa diatur ulang di Pengaturan. Selamat berpetualang!',
    mood: 'cheer',
  },
];
