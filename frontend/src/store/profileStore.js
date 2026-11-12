import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './storage.js';

// Profil & progres siswa di perangkat ini. XP dan bintang dimulai dari 0 (tanpa data tiruan).
export const useProfile = create(
  persist(
    (setState, getState) => ({
      nickname: '',
      onboardingDone: false,
      xp: 0,
      worlds: {}, // { [worldId]: { stars: 0..3, completed: boolean } }
      setNickname: (nickname) => setState({ nickname: nickname.trim().slice(0, 20) }),
      completeOnboarding: () => setState({ onboardingDone: true }),
      // Menyimpan hasil pulau; bintang terbaik dipertahankan bila pulau diulang.
      completeWorld: (worldId, stars, xpGain) =>
        setState((s) => ({
          xp: s.xp + xpGain,
          worlds: {
            ...s.worlds,
            [worldId]: { completed: true, stars: Math.max(stars, s.worlds[worldId]?.stars ?? 0) },
          },
        })),
      isUnlocked: (worldId) => worldId === 1 || Boolean(getState().worlds[worldId - 1]?.completed),
      totalStars: () => Object.values(getState().worlds).reduce((s, w) => s + (w.stars || 0), 0),
    }),
    {
      name: 'aa-profile',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ nickname, onboardingDone, xp, worlds }) => ({ nickname, onboardingDone, xp, worlds }),
    },
  ),
);
