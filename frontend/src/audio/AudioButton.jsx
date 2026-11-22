import { useEffect, useRef, useState } from 'react';
import AudioControls from './AudioControls.jsx';
import { useSettings } from '../store/settingsStore.js';
import styles from './Audio.module.css';

/** Tombol speaker (🔊/🔇) yang membuka panel pengaturan suara. Ikon menunjukkan apakah ada suara aktif. */
export default function AudioButton({ className = '' }) {
  const [open, setOpen] = useState(false);
  const silent = useSettings((s) => !s.musicOn && !s.sfxOn);
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
        className={className}
        onClick={() => setOpen(true)}
        aria-label={silent ? 'Pengaturan suara (suara mati)' : 'Pengaturan suara'}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">{silent ? '🔇' : '🔊'}</span>
      </button>
      {open && (
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
        </div>
      )}
    </>
  );
}
