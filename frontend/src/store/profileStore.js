import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { scopedStorage } from './scopedStorage.js';

/** Nilai minimal kuis dunia untuk membuka pulau berikutnya (docs/LEARNING_DESIGN.md §3). */
export const PASS_PERCENT = 60;
const HISTORY_LIMIT = 30;
const ACTIVITY_LIMIT = 100;

/** Catatan aktivitas belajar (dipakai misi harian, lencana, riwayat). Terbaru di depan. */
const logActivity = (list, entry) => [{ date: new Date().toISOString(), ...entry }, ...(list ?? [])].slice(0, ACTIVITY_LIMIT);

/** Bintang dari nilai kuis: ≥ 60% = 1, ≥ 80% = 2, 100% = 3 (LEARNING_DESIGN §7). */
export function quizStars(percent) {
  if (percent >= 100) return 3;
  if (percent >= 80) return 2;
  if (percent >= PASS_PERCENT) return 1;
  return 0;
}

/** Progres awal siswa baru (tanpa data tiruan). */
export const INITIAL_PROGRESS = { nickname: '', onboardingDone: false, tourDone: false, xp: 0, worlds: {}, quizHistory: [], activity: [], games: {}, lessonSaves: {} };

// Progres SATU siswa (siswa yang sedang aktif, lihat studentStore.js). Disimpan per siswa lewat scopedStorage:
// kunci IndexedDB "aa-profile:<idSiswa>". XP dan bintang dimulai dari 0.
// worlds[id] = { lessonDone, completed (lulus kuis), stars (terbaik), bestPercent }
// Catatan: data lama (sebelum ada kuis) berbentuk { completed, stars } dan tetap dianggap lulus.
export const useProfile = create(
  persist(
    (setState, getState) => ({
      nickname: '',
      onboardingDone: false,
      tourDone: false, // tur singkat Beranda sudah dilihat/dilewati (bisa diulang dari Beranda & Pengaturan)
      xp: 0,
      worlds: {},
      quizHistory: [], // [{ worldId, date (ISO), correct, total, percent }] — terbaru di depan
      activity: [], // [{ type: 'lesson'|'quiz'|'game', date, xp, worldId?, gameId?, percent? }]
      games: {}, // { [gameId]: { best, total, plays, lastDate } }
      lessonSaves: {}, // { [worldId]: { index, results } } — posisi pelajaran yang belum selesai (lanjutkan nanti)
      setNickname: (nickname) => setState({ nickname: nickname.trim().slice(0, 20) }),
      completeOnboarding: () => setState({ onboardingDone: true }),
      setTourDone: (tourDone) => setState({ tourDone }),
      // Pelajaran selesai: kuis dunia terbuka. Belum membuka pulau berikutnya.
      saveLessonPos: (worldId, index, results) => setState((s) => ({ lessonSaves: { ...s.lessonSaves, [worldId]: { index, results } } })),
      clearLessonPos: (worldId) =>
        setState((s) => {
          const { [worldId]: _drop, ...rest } = s.lessonSaves ?? {};
          return { lessonSaves: rest };
        }),
      completeLesson: (worldId, xpGain) =>
        setState((s) => ({
          xp: s.xp + xpGain,
          lessonSaves: Object.fromEntries(Object.entries(s.lessonSaves ?? {}).filter(([k]) => k !== String(worldId))),
          worlds: { ...s.worlds, [worldId]: { ...s.worlds[worldId], lessonDone: true } },
          activity: logActivity(s.activity, { type: 'lesson', worldId, xp: xpGain }),
        })),
      // Hasil kuis: simpan riwayat, bintang & nilai terbaik; lulus (≥ 60%) membuka pulau berikutnya.
      recordQuiz: (worldId, correct, total, xpGain) => {
        const percent = Math.round((correct / total) * 100);
        const stars = quizStars(percent);
        setState((s) => {
          const prev = s.worlds[worldId] ?? {};
          return {
            xp: s.xp + xpGain,
            quizHistory: [{ worldId, date: new Date().toISOString(), correct, total, percent }, ...s.quizHistory].slice(0, HISTORY_LIMIT),
            activity: logActivity(s.activity, { type: 'quiz', worldId, xp: xpGain, percent }),
            worlds: {
              ...s.worlds,
              [worldId]: {
                ...prev,
                lessonDone: true,
                completed: Boolean(prev.completed) || percent >= PASS_PERCENT,
                stars: Math.max(stars, prev.stars ?? 0),
                bestPercent: Math.max(percent, prev.bestPercent ?? 0),
              },
            },
          };
        });
        return { percent, stars, passed: percent >= PASS_PERCENT };
      },
      // Hasil game belajar: rekor terbaik, jumlah main, XP kecil (petunjuk & kecepatan tidak dihukum).
      recordGame: (gameId, score, total, xpGain) =>
        setState((s) => {
          const prev = s.games?.[gameId] ?? { best: 0, plays: 0 };
          return {
            xp: s.xp + xpGain,
            games: { ...s.games, [gameId]: { best: Math.max(prev.best, score), total, plays: prev.plays + 1, lastDate: new Date().toISOString() } },
            activity: logActivity(s.activity, { type: 'game', gameId, xp: xpGain, score, total }),
          };
        }),
      isUnlocked: (worldId) => worldId === 1 || Boolean(getState().worlds[worldId - 1]?.completed),
      canTakeQuiz: (worldId) => Boolean(getState().worlds[worldId]?.lessonDone || getState().worlds[worldId]?.completed),
      totalStars: () => Object.values(getState().worlds).reduce((s, w) => s + (w.stars || 0), 0),
    }),
    {
      name: 'aa-profile',
      version: 1,
      storage: createJSONStorage(() => scopedStorage),
      partialize: ({ nickname, onboardingDone, tourDone, xp, worlds, quizHistory, activity, games, lessonSaves }) => ({ nickname, onboardingDone, tourDone, xp, worlds, quizHistory, activity, games, lessonSaves }),
      // Data lama (tanpa activity/games) diisi nilai kosong — mencegah data siswa sebelumnya terbawa saat berganti siswa.
      merge: (persisted, current) => ({ ...current, ...INITIAL_PROGRESS, ...(persisted ?? {}) }),
    },
  ),
);
