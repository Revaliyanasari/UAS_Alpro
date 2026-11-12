import { useEffect, useRef } from 'react';
import Button from '../../components/ui/Button.jsx';
import styles from './WorldSheet.module.css';

/**
 * Kartu informasi pulau: misi, alasan, daftar materi, indikator literasi, dan status.
 * Tombol "Masuk" baru muncul bila materi pulau sudah tersedia (Fase 3) — tidak ada tombol palsu.
 */
export default function WorldSheet({ world, unlocked, hasLesson, previous, indicatorNames, copy, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="world-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <span className={styles.badge}>World {world.id}</span>
          <h2 id="world-sheet-title">{world.name}</h2>
          <p className={styles.subtitle}>{world.subtitle}</p>
        </header>

        <p className={styles.mission}>
          <span aria-hidden="true">🎯</span> {world.mission}
        </p>
        <p className={styles.why}>{world.why}</p>

        <h3 className={styles.listTitle}>Yang akan kamu pelajari</h3>
        <ul className={styles.topics}>
          {world.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <h3 className={styles.listTitle}>Kemampuan literasi yang dilatih</h3>
        <ul className={styles.chips}>
          {world.indicators.map((i) => (
            <li key={i}>{indicatorNames[i]}</li>
          ))}
        </ul>

        {unlocked && hasLesson ? (
          <Button to={`/belajar/${world.id}`} block className={styles.enter}>
            Masuk ke {world.name}
          </Button>
        ) : (
          <p className={[styles.state, unlocked ? styles.soon : styles.lockedNote].join(' ')}>
            {unlocked ? copy.comingSoon : copy.locked.replace('{world}', previous?.name ?? '')}
          </p>
        )}

        <Button ref={closeRef} variant="secondary" block onClick={onClose}>
          Tutup
        </Button>
      </section>
    </div>
  );
}
