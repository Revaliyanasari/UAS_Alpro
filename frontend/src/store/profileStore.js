import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { scopedStorage } from './scopedStorage.js';

/** Nilai minimal kuis dunia untuk membuka pulau berikutnya (docs/LEARNING_DESIGN.md §3). */
export const PASS_PERCENT = 60;
const HISTORY_LIMIT = 30;

/** Bintang dari nilai kuis: ≥ 60% = 1, ≥ 80% = 2, 100% = 3 (LEARNING_DESIGN §7). */
export function quizStars(percent) {
  if (percent >= 100) return 3;
  if (percent >= 80) return 2;
  if (percent >= PASS_PERCENT) return 1;
  return 0;
}

/** Progres awal siswa baru (tanpa data tiruan). */
export const INITIAL_PROGRESS = { nickname: '', onboardingDone: false, xp: 0, worlds: {}, quizHistory: [] };

// Progres SATU siswa (siswa yang sedang aktif, lihat studentStore.js). Disimpan per siswa lewat scopedStorage:
// kunci IndexedDB "aa-profile:<idSiswa>". XP dan bintang dimulai dari 0.
// worlds[id] = { lessonDone, completed (lulus kuis), stars (terbaik), bestPercent }
// Catatan: data lama (sebelum ada kuis) berbentuk { completed, stars } dan tetap dianggap lulus.
export const useProfile = create(
  persist(
    (setState, getState) => ({
      nickname: '',
      onboardingDone: false,
      xp: 0,
      worlds: {},
      quizHistory: [], // [{ worldId, date (ISO), correct, total, percent }] — terbaru di depan
      setNickname: (nickname) => setState({ nickname: nickname.trim().slice(0, 20) }),
      completeOnboarding: () => setState({ onboardingDone: true }),
      // Pelajaran selesai: kuis dunia terbuka. Belum membuka pulau berikutnya.
      completeLesson: (worldId, xpGain) =>
        setState((s) => ({
          xp: s.xp + xpGain,
          worlds: { ...s.worlds, [worldId]: { ...s.worlds[worldId], lessonDone: true } },
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
      isUnlocked: (worldId) => worldId === 1 || Boolean(getState().worlds[worldId - 1]?.completed),
      canTakeQuiz: (worldId) => Boolean(getState().worlds[worldId]?.lessonDone || getState().worlds[worldId]?.completed),
      totalStars: () => Object.values(getState().worlds).reduce((s, w) => s + (w.stars || 0), 0),
    }),
    {
      name: 'aa-profile',
      version: 1,
      storage: createJSONStorage(() => scopedStorage),
      partialize: ({ nickname, onboardingDone, xp, worlds, quizHistory }) => ({ nickname, onboardingDone, xp, worlds, quizHistory }),
    },
  ),
);
