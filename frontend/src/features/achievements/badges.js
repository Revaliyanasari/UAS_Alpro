// Lencana pencapaian — HANYA diperoleh dari aktivitas & progres siswa yang sebenarnya.
import { activeDays } from '../home/progress.js';

const stars = (p) => Object.values(p.worlds ?? {}).reduce((s, w) => s + (w.stars || 0), 0);
const passed = (p, id) => Boolean(p.worlds?.[id]?.completed);

export const BADGES = [
  { id: 'explorer', name: 'Penjelajah Aljabar', desc: 'Selesaikan pelajaran World 1.', icon: '🧭', color: 'home', value: (p) => (p.worlds?.[1]?.lessonDone || passed(p, 1) ? 1 : 0), target: 1 },
  { id: 'expression', name: 'Ahli Ekspresi', desc: 'Lulus Kuis Lembah Aljabar (World 1).', icon: '🔤', color: 'learn', value: (p) => (passed(p, 1) ? 1 : 0), target: 1 },
  { id: 'factoring', name: 'Pejuang Pemfaktoran', desc: 'Lulus Kuis Gua Rahasia (World 2).', icon: '⚔️', color: 'game', value: (p) => (passed(p, 2) ? 1 : 0), target: 1 },
  { id: 'squares', name: 'Penemu Kuadrat', desc: 'Lulus Kuis Kepulauan Kuadrat (World 3).', icon: '🟦', color: 'community', value: (p) => (passed(p, 3) ? 1 : 0), target: 1 },
  { id: 'tower', name: 'Penakluk Menara', desc: 'Lulus Kuis Menara Tantangan (World 4).', icon: '🏰', color: 'game', value: (p) => (passed(p, 4) ? 1 : 0), target: 1 },
  { id: 'literacy', name: 'Petualang Literasi', desc: 'Lulus Kuis Petualangan Literasi (World 5).', icon: '📖', color: 'learn', value: (p) => (passed(p, 5) ? 1 : 0), target: 1 },
  { id: 'stars', name: 'Bintang Matematika', desc: 'Kumpulkan 6 bintang dari kuis.', icon: '⭐', color: 'other', value: (p) => Math.min(6, stars(p)), target: 6 },
  { id: 'perfect', name: 'Nilai Sempurna', desc: 'Raih nilai 100% di salah satu kuis.', icon: '💯', color: 'home', value: (p) => ((p.quizHistory ?? []).some((q) => q.percent === 100) ? 1 : 0), target: 1 },
  { id: 'consistent', name: 'Pembelajar Konsisten', desc: 'Belajar pada 3 hari yang berbeda.', icon: '📅', color: 'learn', value: (p) => Math.min(3, activeDays(p.activity)), target: 3 },
  { id: 'speed', name: 'Si Cepat Tepat', desc: 'Raih skor 8 atau lebih di Tantangan Cepat Tepat.', icon: '⚡', color: 'game', value: (p) => Math.min(8, p.games?.['cepat-tepat']?.best ?? 0), target: 8 },
  { id: 'matcher', name: 'Pemasang Jitu', desc: 'Selesaikan permainan Pasangkan Ekspresi.', icon: '🧩', color: 'community', value: (p) => ((p.games?.pasangkan?.plays ?? 0) > 0 ? 1 : 0), target: 1 },
  { id: 'xp', name: 'Kolektor XP', desc: 'Kumpulkan 300 XP.', icon: '💎', color: 'other', value: (p) => Math.min(300, p.xp ?? 0), target: 300 },
];

/** Daftar lencana beserta status & kemajuannya untuk profil `p`. */
export function computeBadges(p) {
  return BADGES.map((b) => {
    const value = b.value(p);
    return { ...b, value, earned: value >= b.target };
  });
}

export const earnedCount = (p) => computeBadges(p).filter((b) => b.earned).length;
