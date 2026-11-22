import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './storage.js';

// Pengaturan tampilan & suara di perangkat ini (tersimpan di IndexedDB).
export const useSettings = create(
  persist(
    (setState) => ({
      motion: 'system', // 'system' | 'reduced' | 'full'
      textSize: 'normal', // 'normal' | 'large'
      aiEnabled: true, // siswa/guru boleh mematikan Asisten AI; tetap tersembunyi bila server belum siap
      setAiEnabled: (aiEnabled) => setState({ aiEnabled }),
      // Suara (src/audio): musik & efek bisa dimatikan terpisah; volume 0–1.
      musicOn: true,
      sfxOn: true,
      musicVolume: 0.5,
      sfxVolume: 0.7,
      focusMusic: true, // musik lembut saat pelajaran & kuis (false = hening saat belajar)
      setAudio: (patch) => setState(patch),
      setMotion: (motion) => setState({ motion }),
      setTextSize: (textSize) => setState({ textSize }),
    }),
    {
      name: 'aa-settings',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        motion: s.motion,
        textSize: s.textSize,
        aiEnabled: s.aiEnabled,
        musicOn: s.musicOn,
        sfxOn: s.sfxOn,
        musicVolume: s.musicVolume,
        sfxVolume: s.sfxVolume,
        focusMusic: s.focusMusic,
      }),
    },
  ),
);

/** Menghitung apakah animasi harus dikurangi (pengaturan atau preferensi sistem). */
export function shouldReduceMotion(motion, systemPrefersReduced) {
  if (motion === 'reduced') return true;
  if (motion === 'full') return false;
  return systemPrefersReduced;
}
