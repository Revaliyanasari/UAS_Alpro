// Pintu masuk audio untuk komponen React.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { audio } from './engine.js';
import { useSettings } from '../store/settingsStore.js';

/** Efek suara singkat. Diam bila efek dimatikan, audio belum aktif, atau tidak didukung. */
export const sfx = (name) => audio.play(name);

/**
 * Lagu untuk sebuah halaman. undefined = pertahankan lagu sekarang (mis. Pengaturan, Galeri TATA).
 * Pelajaran & kuis memakai lagu "fokus" yang lembut, atau hening bila focusMusic dimatikan.
 */
export function trackForPath(path, focusMusic = true) {
  if (path === '/' || path.startsWith('/identitas') || path.startsWith('/siswa') || path.startsWith('/mulai')) return 'welcome';
  if (path.startsWith('/peta') || path.startsWith('/profil')) return 'map';
  if (path.startsWith('/belajar/')) return focusMusic ? 'lesson' : null;
  if (path.startsWith('/kuis/')) return focusMusic ? 'quiz' : null;
  if (path.startsWith('/pengaturan') || path.startsWith('/tata')) return undefined;
  return null; // Modul Guru, Lab, Katalog, halaman tidak ditemukan: tanpa musik
}

/** Dipanggil sekali di App: sinkronkan pengaturan, lagu per halaman, unlock & visibilitas tab. */
export function useAudioSync() {
  const { pathname } = useLocation();
  const { musicOn, sfxOn, musicVolume, sfxVolume, focusMusic } = useSettings();

  useEffect(() => {
    audio.setPrefs({ musicOn, sfxOn, musicVolume, sfxVolume });
  }, [musicOn, sfxOn, musicVolume, sfxVolume]);

  useEffect(() => {
    const track = trackForPath(pathname, focusMusic);
    if (track !== undefined) audio.setTrack(track);
  }, [pathname, focusMusic]);

  useEffect(() => {
    // Browser melarang suara sebelum interaksi pertama → aktifkan audio pada ketukan/tombol pertama.
    const unlock = () => {
      if (audio.unlock()) events.forEach((e) => window.removeEventListener(e, unlock, true));
    };
    const events = ['pointerdown', 'keydown', 'touchend'];
    events.forEach((e) => window.addEventListener(e, unlock, true));
    const onVis = () => audio.setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVis);
    if (typeof window !== 'undefined') window.__algebraAudio = audio.debug; // diagnosis (tanpa data siswa)
    return () => {
      events.forEach((e) => window.removeEventListener(e, unlock, true));
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
}
