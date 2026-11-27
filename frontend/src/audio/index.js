// Pintu masuk audio untuk komponen React.
import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { audio } from './engine.js';
import { tataVoice } from './voice.js';
import { useSettings } from '../store/settingsStore.js';

/** Efek suara singkat. Diam bila efek dimatikan, audio belum aktif, atau tidak didukung. */
export const sfx = (name) => audio.play(name);

/**
 * TATA berbicara sesuai situasi (lihat content/tata-voice.json). Diam bila suara TATA dimatikan,
 * belum ada interaksi, atau perangkat tidak punya suara bahasa Indonesia. Mengembalikan teks atau null.
 */
export const sayTata = (situation, opts) => tataVoice.say(situation, opts);

/** Ucapkan kalimat situasi sekali saat komponen tampil (mis. awal pelajaran/kuis). */
export function useTataSays(situation, when = true) {
  useEffect(() => {
    if (!when) return undefined;
    // Sedikit menunggu agar tidak bertabrakan dengan bunyi ketuk/transisi halaman.
    const t = setTimeout(() => tataVoice.say(situation), 500);
    return () => clearTimeout(t);
  }, [situation, when]);
}

/** true = audio perlu diaktifkan dengan ketukan (belum aktif atau ditahan browser/HP). */
export function useAudioNeedsGesture() {
  return useSyncExternalStore(
    (fn) => audio.subscribe(fn),
    () => audio.needsGesture(),
    () => false,
  );
}

/** Keadaan suara TATA: 'checking' | 'ready' | 'no-voice' | 'unsupported'. */
export function useVoiceStatus() {
  return useSyncExternalStore(
    (fn) => tataVoice.subscribe(fn),
    () => tataVoice.status(),
    () => 'unsupported',
  );
}

/** Aktifkan audio dari tombol "Aktifkan suara" (harus dipanggil di dalam ketukan). */
export function activateAudio() {
  tataVoice.activate();
  return audio.unlock();
}

/**
 * Lagu untuk sebuah halaman. undefined = pertahankan lagu sekarang (mis. Pengaturan, Galeri TATA).
 * Pelajaran & kuis memakai lagu "fokus" yang lembut, atau hening bila focusMusic dimatikan.
 */
export function trackForPath(path, focusMusic = true) {
  if (path === '/' || path.startsWith('/identitas') || path.startsWith('/siswa') || path.startsWith('/mulai')) return 'welcome';
  // Halaman petualangan & pusat menu (beranda, materi, prestasi, profil): lagu petualangan
  if (['/peta', '/profil', '/beranda', '/materi', '/progres', '/peringkat', '/pencapaian', '/asisten'].some((p) => path.startsWith(p))) return 'map';
  // Game belajar: lagu ringan yang menyemangati
  if (path.startsWith('/game')) return 'quiz';
  if (path.startsWith('/belajar/')) return focusMusic ? 'lesson' : null;
  if (path.startsWith('/kuis/')) return focusMusic ? 'quiz' : null;
  if (path.startsWith('/pengaturan') || path.startsWith('/tata')) return undefined;
  return null; // Modul Guru, Lab, Katalog, halaman tidak ditemukan: tanpa musik
}

/** Dipanggil sekali di App: sinkronkan pengaturan, lagu per halaman, unlock & visibilitas tab. */
export function useAudioSync() {
  const { pathname } = useLocation();
  const { musicOn, sfxOn, musicVolume, sfxVolume, focusMusic, voiceOn, voiceVolume } = useSettings();

  useEffect(() => {
    audio.setPrefs({ musicOn, sfxOn, musicVolume, sfxVolume });
  }, [musicOn, sfxOn, musicVolume, sfxVolume]);

  useEffect(() => {
    tataVoice.setPrefs({ voiceOn, voiceVolume });
  }, [voiceOn, voiceVolume]);

  // Berganti halaman: hentikan kalimat TATA yang masih berjalan dari halaman sebelumnya.
  useEffect(() => () => tataVoice.stop(), [pathname]);

  useEffect(() => {
    const track = trackForPath(pathname, focusMusic);
    if (track !== undefined) audio.setTrack(track);
  }, [pathname, focusMusic]);

  useEffect(() => {
    // Browser melarang suara sebelum interaksi pertama → aktifkan audio pada ketukan/tombol pertama.
    // Pendengar SENGAJA tetap terpasang: bila HP/browser menahan audio (pindah aplikasi, telepon,
    // layar terkunci), ketukan berikutnya membangunkannya lagi. Ini penyebab "suara kadang hilang".
    let unlocked = false;
    const onGesture = () => {
      tataVoice.activate();
      if (!unlocked) unlocked = audio.unlock();
      else audio.resume();
    };
    const events = ['pointerdown', 'keydown', 'touchend'];
    events.forEach((e) => window.addEventListener(e, onGesture, true));
    const onVis = () => {
      const isHidden = document.visibilityState === 'hidden';
      audio.setHidden(isHidden);
      tataVoice.setHidden(isHidden);
    };
    document.addEventListener('visibilitychange', onVis);
    // Kembali dari cache riwayat (tombol Back di HP): coba bangunkan audio.
    const onShow = () => audio.resume();
    window.addEventListener('pageshow', onShow);
    // Musik diredam selama TATA berbicara.
    const offSpeaking = tataVoice.onSpeaking((on) => audio.setSpeaking(on));
    if (typeof window !== 'undefined') window.__algebraAudio = audio.debug; // diagnosis (tanpa data siswa)
    // Kait uji kejernihan suara: ukur puncak sinyal & bunyikan efek (tanpa akses data apa pun).
    if (typeof window !== 'undefined') window.__algebraAudioTest = { peak: (ms) => audio.measurePeak(ms), play: (name) => audio.play(name) };
    return () => {
      events.forEach((e) => window.removeEventListener(e, onGesture, true));
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onShow);
      offSpeaking();
    };
  }, []);
}
