// Ringkasan progres untuk dashboard (tanpa React). Semua angka dihitung dari progres siswa yang sebenarnya.
import worldsContent from '../../content/worlds.json';
import { lessons } from '../../content/lessons/index.js';
import { quizzes } from '../../content/quizzes/index.js';

const dayKey = (iso) => new Date(iso).toLocaleDateString('sv-SE'); // YYYY-MM-DD waktu lokal

export function isSameDay(iso, now = new Date()) {
  return dayKey(iso) === now.toLocaleDateString('sv-SE');
}

/** Jumlah hari berbeda siswa belajar (dari catatan aktivitas). */
export function activeDays(activity = []) {
  return new Set(activity.map((a) => dayKey(a.date))).size;
}

/** Status setiap pulau yang materinya tersedia. */
export function worldStatuses(profile) {
  return worldsContent.worlds.map((w) => {
    const p = profile.worlds?.[w.id] ?? {};
    const unlocked = w.id === 1 || Boolean(profile.worlds?.[w.id - 1]?.completed);
    const available = Boolean(lessons[w.id]);
    const step = p.completed ? 2 : p.lessonDone ? 1 : 0; // 0 belum, 1 pelajaran selesai, 2 lulus kuis
    return { ...w, unlocked, available, lessonDone: Boolean(p.lessonDone || p.completed), completed: Boolean(p.completed), stars: p.stars ?? 0, bestPercent: p.bestPercent, percent: available ? Math.round((step / 2) * 100) : 0 };
  });
}

/** Persentase progres keseluruhan dari pulau yang materinya sudah tersedia. */
export function overallPercent(profile) {
  const list = worldStatuses(profile).filter((w) => w.available);
  return list.length ? Math.round(list.reduce((s, w) => s + w.percent, 0) / list.length) : 0;
}

/** Rekomendasi langkah berikutnya: pelajaran → kuis → pulau berikutnya; bila semua selesai → game. */
export function nextStep(profile) {
  for (const w of worldStatuses(profile)) {
    if (!w.available || !w.unlocked) continue;
    if (!w.lessonDone) return { kind: 'lesson', worldId: w.id, worldName: w.name, to: `/belajar/${w.id}`, label: `Pelajari ${w.name}` };
    if (!w.completed && quizzes[w.id]) return { kind: 'quiz', worldId: w.id, worldName: w.name, to: `/kuis/${w.id}`, label: `Kerjakan Kuis ${w.name}` };
  }
  return { kind: 'game', to: '/game', label: 'Asah kemampuan di Game Belajar' };
}

/** Misi harian dari aktivitas hari ini (reset otomatis setiap hari). */
export function missionsToday(profile, now = new Date()) {
  const today = (profile.activity ?? []).filter((a) => isSameDay(a.date, now));
  const xpToday = today.reduce((s, a) => s + (a.xp || 0), 0);
  return [
    { id: 'learn', label: 'Selesaikan 1 pelajaran atau kuis', done: today.some((a) => a.type === 'lesson' || a.type === 'quiz'), value: Math.min(1, today.filter((a) => a.type !== 'game').length), target: 1 },
    { id: 'game', label: 'Mainkan 1 game belajar', done: today.some((a) => a.type === 'game'), value: Math.min(1, today.filter((a) => a.type === 'game').length), target: 1 },
    { id: 'xp', label: 'Kumpulkan 30 XP hari ini', done: xpToday >= 30, value: Math.min(30, xpToday), target: 30 },
  ];
}
