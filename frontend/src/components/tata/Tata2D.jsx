import styles from './Tata2D.module.css';

/**
 * TATA versi 2D (SVG). Proporsi mengikuti tataDesign.js (lebar badan 120 px pada viewBox 200 × 240),
 * warna memakai token CSS sehingga identik dengan versi 3D.
 */
export default function Tata2D({ state = 'idle', label = 'TATA' }) {
  const happyEyes = state === 'happy' || state === 'celebrating';
  return (
    <svg viewBox="0 0 200 240" className={[styles.tata, styles[state]].join(' ')} role="img" aria-label={label}>
      <ellipse cx="100" cy="226" rx="56" ry="7" className={styles.shadow} />
      <g className={styles.figure}>
        {/* kaki */}
        <ellipse cx="73" cy="206" rx="18" ry="9" fill="var(--beige-300)" />
        <ellipse cx="127" cy="206" rx="18" ry="9" fill="var(--beige-300)" />
        {/* lengan kiri (memegang ubin x) */}
        <g className={styles.armLeft}>
          <rect x="18" y="128" width="26" height="14" rx="7" fill="var(--teal-400)" />
          <rect x="10" y="112" width="10" height="34" rx="2" fill="var(--butter-300)" stroke="var(--ink-900)" strokeOpacity="0.15" />
        </g>
        {/* lengan kanan (melambai) */}
        <g className={styles.armRight}>
          <rect x="156" y="128" width="26" height="14" rx="7" fill="var(--teal-400)" />
        </g>
        <g className={styles.head}>
          {/* antena tunas daun */}
          <rect x="97" y="46" width="6" height="26" rx="3" fill="var(--sage-700)" />
          <ellipse cx="86" cy="44" rx="16" ry="7" transform="rotate(-28 86 44)" fill="var(--sage-500)" />
          <ellipse cx="114" cy="40" rx="16" ry="7" transform="rotate(24 114 40)" fill="var(--sage-500)" />
          {/* badan kubus membulat */}
          <rect x="40" y="76" width="120" height="114" rx="29" fill="var(--teal-500)" />
          <rect x="40" y="70" width="120" height="114" rx="29" fill="var(--teal-400)" />
          {/* layar wajah */}
          <rect x="58" y="90" width="84" height="64" rx="16" fill="var(--cream-50)" />
          {/* mata */}
          {happyEyes ? (
            <g fill="none" stroke="var(--ink-900)" strokeWidth="4" strokeLinecap="round">
              <path d="M76 120 q6 -8 12 0" />
              <path d="M112 120 q6 -8 12 0" />
            </g>
          ) : (
            <g className={styles.eyes}>
              <circle cx="82" cy="118" r="7" fill="var(--ink-900)" />
              <circle cx="118" cy="118" r="7" fill="var(--ink-900)" />
              <circle cx="84.5" cy="115.5" r="2.2" fill="var(--white)" />
              <circle cx="120.5" cy="115.5" r="2.2" fill="var(--white)" />
            </g>
          )}
          {/* pipi */}
          <ellipse cx="69" cy="133" rx="8" ry="5" fill="var(--peach-300)" />
          <ellipse cx="131" cy="133" rx="8" ry="5" fill="var(--peach-300)" />
          {/* mulut */}
          {state === 'talking' ? (
            <ellipse cx="100" cy="138" rx="7" ry="5" fill="var(--ink-900)" className={styles.mouthTalk} />
          ) : state === 'confused' ? (
            <path d="M89 139 q5.5 -5 11 0 t11 0" fill="none" stroke="var(--ink-900)" strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            <path d={happyEyes ? 'M88 133 Q100 147 112 133 Z' : 'M89 134 Q100 144 111 134'} fill={happyEyes ? 'var(--ink-900)' : 'none'} stroke="var(--ink-900)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </g>
        {state === 'confused' && (
          <text x="166" y="72" className={styles.question}>
            ?
          </text>
        )}
        {state === 'celebrating' && (
          <g className={styles.sparks} fill="var(--butter-300)">
            <path d="M28 52 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4z" />
            <path d="M170 38 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
            <path d="M176 92 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5z" />
          </g>
        )}
      </g>
    </svg>
  );
}
