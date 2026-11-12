import styles from './SpeechBubble.module.css';

/**
 * Balon kata TATA. Maksimal ±2 kalimat (docs/UI_UX_DESIGN.md §5).
 * tone: 'neutral' | 'happy' | 'confused' — memberi warna tepi yang lembut, tidak pernah merah.
 * Tombol "dengarkan" akan ditambahkan bersama fitur narasi (fase audio) — tidak dipasang sekarang
 * agar tidak ada tombol tanpa fungsi.
 */
export default function SpeechBubble({ children, tone = 'neutral', tail = 'left', speaker = 'TATA' }) {
  return (
    <div className={[styles.bubble, styles[tone], styles[`tail-${tail}`]].join(' ')} role="status" aria-live="polite">
      <span className="visually-hidden">{speaker} berkata: </span>
      {children}
    </div>
  );
}
