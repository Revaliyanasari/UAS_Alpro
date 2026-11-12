import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './storage.js';

// Pengaturan tampilan siswa. Pengaturan audio akan ditambahkan bersama fitur audio,
// agar tidak ada sakelar yang belum berfungsi.
export const useSettings = create(
  persist(
    (setState) => ({
      motion: 'system', // 'system' | 'reduced' | 'full'
      textSize: 'normal', // 'normal' | 'large'
      setMotion: (motion) => setState({ motion }),
      setTextSize: (textSize) => setState({ textSize }),
    }),
    {
      name: 'aa-settings',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ motion: s.motion, textSize: s.textSize }),
    },
  ),
);

/** Menghitung apakah animasi harus dikurangi (pengaturan atau preferensi sistem). */
export function shouldReduceMotion(motion, systemPrefersReduced) {
  if (motion === 'reduced') return true;
  if (motion === 'full') return false;
  return systemPrefersReduced;
}
