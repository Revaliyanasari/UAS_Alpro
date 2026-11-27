import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import AudioControls from './AudioControls.jsx';
import { activateAudio, useAudioNeedsGesture } from './index.js';
import { useSettings } from '../store/settingsStore.js';
import styles from './Audio.module.css';

/**
 * Tombol speaker (🔊/🔇) yang membuka panel pengaturan suara. Ikon menunjukkan apakah ada suara aktif.
 * Bila audio belum aktif / ditahan browser, tombol diberi titik berdenyut + label "Aktifkan suara";
 * menekannya langsung mengaktifkan suara (sekaligus membuka panel).
 */
export default function AudioButton({ className = '' }) {
  const [open, setOpen] = useState(false);
  const silent = useSettings((s) => !s.musicOn && !s.sfxOn && !s.voiceOn);
  const needsGesture = useAudioNeedsGesture() && !silent;
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={[className, styles.speaker, needsGesture ? styles.speakerWake : ''].join(' ')}
        onClick={() => {
          activateAudio();
          setOpen(true);
        }}
        aria-label={silent ? 'Pengaturan suara (suara mati)' : needsGesture ? 'Pengaturan suara: ketuk untuk mengaktifkan suara' : 'Pengaturan suara'}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">{silent ? '🔇' : '🔊'}</span>
        {needsGesture && <span className={styles.wakeDot} aria-hidden="true" />}
      </button>
      {open &&
        createPortal(
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="audio-title" onClick={(e) => e.stopPropagation()}>
            <header className={styles.head}>
              <h2 id="audio-title">Suara</h2>
              <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Tutup pengaturan suara">
                ✕
              </button>
            </header>
            <AudioControls />
          </section>
        </div>,
          document.body,
        )}
    </>
  );
}
