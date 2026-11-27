import { useEffect, useState } from 'react';
import { useSettings } from '../store/settingsStore.js';
import { audio } from './engine.js';
import { tataVoice } from './voice.js';
import { sfx, activateAudio, useAudioNeedsGesture, useVoiceStatus } from './index.js';
import styles from './Audio.module.css';

const VOICE_NOTE = {
  checking: 'Memeriksa suara bahasa Indonesia di perangkat ini…',
  'no-voice': 'Perangkat ini belum punya suara bahasa Indonesia, jadi TATA tidak berbicara. Tambahkan "Bahasa Indonesia" di pengaturan ucapan (text-to-speech) HP/laptop, lalu muat ulang aplikasi.',
  unsupported: 'Browser ini tidak mendukung suara TATA. Teks TATA tetap tampil seperti biasa.',
};

function Volume({ label, value, onChange, disabled, onRelease }) {
  const pct = Math.round(value * 100);
  return (
    <label className={styles.slider}>
      <span>
        {label}: {pct}%
      </span>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        onPointerUp={onRelease}
        onKeyUp={onRelease}
        disabled={disabled}
        aria-label={label}
      />
    </label>
  );
}

/**
 * Pengaturan suara: Musik, Efek suara, dan Suara TATA — masing-masing bisa dinyalakan/dimatikan,
 * diatur volumenya, dan dites. Perubahan langsung terdengar dan tersimpan di perangkat.
 */
export default function AudioControls() {
  const { musicOn, sfxOn, voiceOn, musicVolume, sfxVolume, voiceVolume, focusMusic, setAudio, resetAudio } = useSettings();
  const needsGesture = useAudioNeedsGesture();
  const voiceStatus = useVoiceStatus();
  const [msg, setMsg] = useState('');
  const supported = audio.debug().available;
  // Tombol 'Aktifkan suara' hanya bila audio TERTAHAN setelah pernah aktif (mis. telepon masuk di HP).
  // Sebelum ketukan pertama tidak ditampilkan: ketukan pertama sudah mengaktifkan suara, dan tombol yang
  // hilang di tengah klik menggeser halaman sehingga klik siswa meleset. Setelah muncul, tempatnya dipertahankan.
  const stalled = needsGesture && audio.debug().unlocked;
  const [enableShown, setEnableShown] = useState(false);
  useEffect(() => {
    if (stalled) setEnableShown(true);
  }, [stalled]);

  const testMusic = () => {
    activateAudio();
    setMsg(audio.previewMusic(4000) ? 'Memutar musik selama 4 detik…' : 'Musik sedang dimatikan. Nyalakan "Musik latar" dulu.');
  };
  const testSfx = () => {
    activateAudio();
    const ok = sfx('correct');
    if (ok) setTimeout(() => sfx('star'), 450);
    setMsg(ok ? 'Efek suara berbunyi.' : 'Efek suara sedang dimatikan. Nyalakan "Efek suara" dulu.');
  };
  const testVoice = () => {
    activateAudio();
    if (!voiceOn) return setMsg('Suara TATA sedang dimatikan. Nyalakan "Suara TATA" dulu.');
    if (voiceStatus !== 'ready') return setMsg(VOICE_NOTE[voiceStatus]);
    setMsg(tataVoice.say('test', { force: true }) ? `TATA berbicara (${tataVoice.voiceName()}).` : 'Suara TATA belum bisa diputar. Coba lagi.');
  };
  const reset = () => {
    resetAudio();
    setMsg('Pengaturan suara dikembalikan ke bawaan.');
  };

  return (
    <div className={styles.controls}>
      {!supported && <p className={styles.note}>Perangkat ini tidak mendukung musik & efek suara. Aplikasi tetap bisa dipakai seperti biasa.</p>}
      {supported && (stalled || enableShown) && (
        <button type="button" className={styles.enable} onClick={() => activateAudio()} disabled={!stalled}>
          {stalled ? '🔊 Aktifkan suara' : '✓ Suara aktif'}
        </button>
      )}

      <fieldset className={styles.group}>
        <legend>🎵 Musik</legend>
        <label className={styles.row}>
          <input type="checkbox" checked={musicOn} onChange={(e) => setAudio({ musicOn: e.target.checked })} />
          <span>Musik latar</span>
        </label>
        <Volume label="Volume musik" value={musicVolume} onChange={(v) => setAudio({ musicVolume: v })} disabled={!musicOn} />
        <label className={styles.row}>
          <input type="checkbox" checked={focusMusic} onChange={(e) => setAudio({ focusMusic: e.target.checked })} disabled={!musicOn} />
          <span>
            Musik lembut saat belajar & kuis
            <small>Matikan jika ingin hening saat mengerjakan soal.</small>
          </span>
        </label>
        <button type="button" className={styles.test} onClick={testMusic} disabled={!supported}>
          ▶ Tes musik
        </button>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>🔔 Efek suara</legend>
        <label className={styles.row}>
          <input type="checkbox" checked={sfxOn} onChange={(e) => setAudio({ sfxOn: e.target.checked })} />
          <span>Efek suara</span>
        </label>
        <Volume label="Volume efek suara" value={sfxVolume} onChange={(v) => setAudio({ sfxVolume: v })} disabled={!sfxOn} onRelease={() => sfx('tap')} />
        <button type="button" className={styles.test} onClick={testSfx} disabled={!supported}>
          ▶ Tes efek
        </button>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>🤖 Suara TATA</legend>
        <label className={styles.row}>
          <input type="checkbox" checked={voiceOn} onChange={(e) => setAudio({ voiceOn: e.target.checked })} />
          <span>
            Suara TATA
            <small>TATA menyapa dan menyemangati dengan suara (teks tetap tampil). Memakai suara bahasa Indonesia bawaan perangkat.</small>
          </span>
        </label>
        <Volume label="Volume suara TATA" value={voiceVolume} onChange={(v) => setAudio({ voiceVolume: v })} disabled={!voiceOn} />
        <button type="button" className={styles.test} onClick={testVoice}>
          ▶ Tes suara TATA
        </button>
      </fieldset>

      <p className={styles.small} role="status" aria-live="polite">
        {msg}
      </p>
      <button type="button" className={styles.reset} onClick={reset}>
        Kembalikan pengaturan suara bawaan
      </button>
    </div>
  );
}
