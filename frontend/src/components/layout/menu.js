// Struktur menu utama (satu sumber untuk sidebar desktop & drawer HP).
// Setiap item menuju halaman yang benar-benar berfungsi — tidak ada tautan ke halaman kosong.
export const MENU = [
  {
    id: 'home',
    label: 'Beranda',
    items: [{ to: '/beranda', label: 'Dashboard', icon: 'home', desc: 'Ringkasan progres & misi hari ini' }],
  },
  {
    id: 'learn',
    label: 'Belajar',
    items: [
      { to: '/asisten', label: 'Asisten Belajar (Tanya TATA)', icon: 'chat', desc: 'Tanya materi aljabar' },
      { to: '/materi', label: 'Materi Pembelajaran', icon: 'book', desc: 'Semua pelajaran & kuis' },
      { to: '/peta', label: 'Peta Petualangan', icon: 'map', desc: 'Jelajahi pulau aljabar' },
      { to: '/progres', label: 'Riwayat & Progres', icon: 'history', desc: 'Apa saja yang sudah kamu kerjakan' },
    ],
  },
  {
    id: 'game',
    label: 'Game & Aktivitas',
    items: [
      { to: '/game', label: 'Game Belajar Seru', icon: 'game', desc: 'Semua permainan' },
      { to: '/game/cepat-tepat', label: 'Tantangan Cepat Tepat', icon: 'bolt', desc: 'Jawab sebanyak-banyaknya dalam 60 detik' },
      { to: '/game/pasangkan', label: 'Pasangkan Ekspresi', icon: 'puzzle', desc: 'Cocokkan bentuk & faktornya' },
      { to: '/game/latihan', label: 'Latihan Soal Interaktif', icon: 'play', desc: 'Latihan santai dengan pembahasan' },
    ],
  },
  {
    id: 'community',
    label: 'Komunitas & Prestasi',
    items: [
      { to: '/peringkat', label: 'Peringkat', icon: 'trophy', desc: 'Peringkat di perangkat ini' },
      { to: '/pencapaian', label: 'Pencapaian & Lencana', icon: 'medal', desc: 'Koleksi bintang & lencana' },
      { to: '/progres#statistik', label: 'Statistik Belajar', icon: 'chart', desc: 'Grafik perkembanganmu' },
    ],
  },
  {
    id: 'other',
    label: 'Lainnya',
    items: [
      { to: '/tata', label: 'Galeri Ekspresi TATA', icon: 'smile', desc: '18 ekspresi TATA' },
      { to: '/profil', label: 'Profil Siswa', icon: 'user', desc: 'Identitas & progresmu' },
      { to: '/guru', label: 'Modul Guru', icon: 'teacher', desc: 'Instrumen, penilaian, laporan' },
      { to: '/pengaturan', label: 'Pengaturan', icon: 'gear', desc: 'Suara, tampilan, info aplikasi' },
    ],
  },
];

/** Kategori sebuah alamat (untuk warna identitas halaman). */
export function categoryOf(pathname) {
  for (const cat of MENU) for (const it of cat.items) if (pathname === it.to.split('#')[0]) return cat.id;
  if (pathname.startsWith('/game')) return 'game';
  return 'home';
}
