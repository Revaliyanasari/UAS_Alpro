import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './storage.js';

// Pengaturan tampilan & suara di perangkat ini (tersimpan di IndexedDB).

/** Nilai bawaan suara (tombol "Kembalikan pengaturan suara bawaan"). */
export const AUDIO_DEFAULTS = { musicOn: true, sfxOn: true, voiceOn: true, musicVolume: 0.7, sfxVolume: 0.85, voiceVolume: 0.9, focusMusic: true };
export const useSettings = create(
  persist(
    (setState) => ({
      motion: 'system', // 'system' | 'reduced' | 'full'
      textSize: 'normal', // 'normal' | 'large'
      aiEnabled: true, // siswa/guru boleh mematikan Asisten AI; tetap tersembunyi bila server belum siap
      setAiEnabled: (aiEnabled) => setState({ aiEnabled }),
      // Suara (src/audio): musik & efek bisa dimatikan terpisah; volume 0–1.
      // Suara TATA (voiceOn/voiceVolume) memakai suara bawaan browser, terpisah dari musik & efek.
      ...AUDIO_DEFAULTS, // focusMusic: musik lembut saat pelajaran & kuis (false = hening saat belajar)
      setAudio: (patch) => setState(patch),
      resetAudio: () => setState({ ...AUDIO_DEFAULTS }),
      sidebarOpen: true, // sidebar menu di laptop (HP selalu memakai drawer)
      setSetting: (patch) => setState(patch),
      setMotion: (motion) => setState({ motion }),
      setTextSize: (textSize) => setState({ textSize }),
    }),
    {
      name: 'aa-settings',
      version: 2,
      // v2: volume bawaan dinaikkan. Hanya nilai bawaan lama yang belum diubah siswa yang ikut naik.
      migrate: (state, version) => {
        if (version < 2 && state) {
          if (state.musicVolume === 0.5) state.musicVolume = 0.7;
          if (state.sfxVolume === 0.7) state.sfxVolume = 0.85;
        }
        return state;
      },
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        motion: s.motion,
        textSize: s.textSize,
        aiEnabled: s.aiEnabled,
        musicOn: s.musicOn,
        sfxOn: s.sfxOn,
        musicVolume: s.musicVolume,
        sfxVolume: s.sfxVolume,
        voiceOn: s.voiceOn,
        voiceVolume: s.voiceVolume,
        focusMusic: s.focusMusic,
        sidebarOpen: s.sidebarOpen,
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
