import styles from './WorldBackground.module.css';

// Ilustrasi latar dunia matematika (orisinal, SVG berlapis, tanpa teks).
// Lapisan: langit → matahari → awan → bukit jauh → pulau melayang berisi ubin → simbol → bukit dekat & jalan.
// Animasi melayang hanya di welcome & peta; otomatis berhenti saat "Kurangi animasi" aktif.

function Island({ x, y, scale = 1, className, children }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={className}>
        <path d="M-60 0 Q0 22 60 0 L22 52 Q0 62 -22 52 Z" fill="var(--beige-300)" />
        <path d="M-40 18 Q0 32 40 18 L14 48 Q0 54 -14 48 Z" fill="var(--beige-500)" opacity="0.45" />
        <ellipse cx="0" cy="0" rx="62" ry="13" fill="var(--sage-500)" />
        <ellipse cx="0" cy="-3" rx="56" ry="9" fill="var(--mint-200)" />
        {children}
      </g>
    </g>
  );
}

const Tile = ({ x, y, w, h, fill }) => (
  <rect x={x} y={y} width={w} height={h} rx="3" fill={fill} stroke="var(--ink-900)" strokeOpacity="0.12" strokeWidth="1.5" />
);

export default function WorldBackground({ variant = 'welcome' }) {
  return (
    <svg className={styles.bg} viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="aa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cream-50)" />
          <stop offset="0.55" stopColor="var(--mint-100)" />
          <stop offset="1" stopColor="var(--mint-200)" />
        </linearGradient>
        <radialGradient id="aa-sun">
          <stop offset="0" stopColor="var(--butter-300)" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="var(--butter-200)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--butter-200)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="860" fill="url(#aa-sky)" />
      <circle cx="320" cy="120" r="120" fill="url(#aa-sun)" />

      <g className={styles.cloudSlow} fill="var(--white)" opacity="0.9">
        <ellipse cx="70" cy="150" rx="44" ry="14" />
        <ellipse cx="88" cy="140" rx="24" ry="14" />
        <ellipse cx="300" cy="300" rx="34" ry="10" />
        <ellipse cx="314" cy="292" rx="18" ry="11" />
      </g>

      {/* bukit jauh */}
      <path d="M0 560 Q90 500 190 540 T400 520 V860 H0 Z" fill="var(--teal-300)" opacity="0.55" />

      {/* pulau melayang & simbol hanya di welcome; di peta tidak dipakai agar tidak tertukar dengan pulau materi */}
      {variant === 'welcome' && (
        <>
      <Island x={88} y={380} scale={0.9} className={styles.floatA}>
        <Tile x={-40} y={-50} w={44} h={44} fill="var(--tile-x2)" />
        <Tile x={10} y={-50} w={11} h={44} fill="var(--tile-x)" />
        <Tile x={27} y={-17} w={11} h={11} fill="var(--tile-1)" />
      </Island>
      <Island x={320} y={430} scale={0.75} className={styles.floatB}>
        <Tile x={-34} y={-46} w={11} h={44} fill="var(--tile-x)" />
        <Tile x={-19} y={-46} w={11} h={44} fill="var(--tile-x)" />
        <Tile x={-4} y={-46} w={44} h={44} fill="var(--tile-x2)" />
      </Island>
      <Island x={205} y={300} scale={0.45} className={styles.floatC}>
        <Tile x={-26} y={-24} w={22} h={22} fill="var(--tile-1)" />
        <Tile x={0} y={-24} w={22} h={22} fill="var(--tile-1)" />
      </Island>

      {/* simbol matematika melayang */}
      <g className={styles.twinkle} strokeLinecap="round" strokeWidth="6" fill="none">
        <path d="M40 470 h22 M51 459 v22" stroke="var(--peach-300)" />
        <path d="M350 250 h24" stroke="var(--teal-400)" />
        <path d="M232 400 l16 16 M248 400 l-16 16" stroke="var(--sage-500)" />
        <path d="M150 240 h20 M150 250 h20" stroke="var(--butter-300)" />
      </g>
        </>
      )}
      <g fill="var(--butter-300)" className={styles.twinkleSlow}>
        <path d="M120 90 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
        <path d="M262 210 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        <path d="M368 540 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
      </g>

      {/* bukit dekat, semak, jalan setapak */}
      <path d="M0 640 Q120 580 230 620 T400 600 V860 H0 Z" fill="var(--sage-500)" opacity="0.75" />
      <path d="M0 700 Q140 660 260 690 T400 680 V860 H0 Z" fill="var(--mint-200)" />
      <g fill="var(--sage-500)">
        <circle cx="30" cy="690" r="22" />
        <circle cx="56" cy="696" r="16" />
        <circle cx="372" cy="672" r="20" />
        <circle cx="350" cy="682" r="14" />
      </g>
      {variant === 'welcome' && (
        <path d="M214 690 C170 730 250 760 200 800 S170 850 196 860 H236 C214 840 262 812 248 790 S206 730 238 690 Z" fill="var(--cream-50)" opacity="0.85" />
      )}
    </svg>
  );
}
