import { useSettings } from '../store/settingsStore.js';
import { audio } from './engine.js';
import { sfx } from './index.js';
import styles from './Audio.module.css';

/** Sakelar & volume musik/efek. Perubahan langsung terdengar dan tersimpan di perangkat. */
export default function AudioControls() {
  const { musicOn, sfxOn, musicVolume, sfxVolume, focusMusic, setAudio } = useSettings();
  const pct = (v) => Math.round(v * 100);
  const supported = audio.debug().available;

  return (
    <div className={styles.controls}>
      {!supported && <p className={styles.note}>Perangkat ini tidak mendukung suara. Aplikasi tetap bisa dipakai seperti biasa.</p>}
      <label className={styles.row}>
        <input type="checkbox" checked={musicOn} onChange={(e) => setAudio({ musicOn: e.target.checked })} />
        <span>🎵 Musik latar</span>
      </label>
      <label className={styles.slider}>
        <span>Volume musik: {pct(musicVolume)}%</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={pct(musicVolume)}
          onChange={(e) => setAudio({ musicVolume: Number(e.target.value) / 100 })}
          disabled={!musicOn}
          aria-label="Volume musik"
        />
      </label>
      <label className={styles.row}>
        <input type="checkbox" checked={sfxOn} onChange={(e) => setAudio({ sfxOn: e.target.checked })} />
        <span>🔔 Efek suara</span>
      </label>
      <label className={styles.slider}>
        <span>Volume efek: {pct(sfxVolume)}%</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={pct(sfxVolume)}
          onChange={(e) => setAudio({ sfxVolume: Number(e.target.value) / 100 })}
          onPointerUp={() => sfx('tap')}
          onKeyUp={() => sfx('tap')}
          disabled={!sfxOn}
          aria-label="Volume efek suara"
        />
      </label>
      <label className={styles.row}>
        <input type="checkbox" checked={focusMusic} onChange={(e) => setAudio({ focusMusic: e.target.checked })} disabled={!musicOn} />
        <span>
          🎧 Musik lembut saat belajar & kuis
          <small>Matikan jika ingin hening saat mengerjakan soal.</small>
        </span>
      </label>
    </div>
  );
}
