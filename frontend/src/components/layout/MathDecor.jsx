import styles from './Nav.module.css';

/**
 * Dekorasi latar bertema matematika (simbol, bentuk, bintang, awan) — samar, di belakang isi,
 * tidak bisa diklik, dan disembunyikan dari pembaca layar. Warna dari token desain.
 */
export default function MathDecor() {
  return (
    <svg className={styles.mathDecor} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g opacity="0.55">
        <ellipse cx="160" cy="90" rx="90" ry="26" fill="var(--white)" />
        <ellipse cx="210" cy="72" rx="52" ry="26" fill="var(--white)" />
        <ellipse cx="1040" cy="130" rx="100" ry="28" fill="var(--white)" />
        <ellipse cx="1090" cy="110" rx="56" ry="26" fill="var(--white)" />
      </g>
      <g fontFamily="var(--font-display)" fontWeight="600" opacity="0.32">
        <text x="70" y="300" fontSize="64" fill="var(--teal-400)">x²</text>
        <text x="1080" y="360" fontSize="58" fill="var(--lilac-300)">+</text>
        <text x="980" y="690" fontSize="54" fill="var(--peach-300)">÷</text>
        <text x="120" y="660" fontSize="60" fill="var(--sky-300)">=</text>
        <text x="560" y="760" fontSize="44" fill="var(--butter-300)">a² − b²</text>
        <text x="1110" y="560" fontSize="46" fill="var(--teal-300)">y</text>
      </g>
      <g opacity="0.35">
        <rect x="250" y="420" width="46" height="46" rx="8" fill="var(--tile-x2)" transform="rotate(-12 273 443)" />
        <rect x="900" y="230" width="18" height="52" rx="5" fill="var(--tile-x)" transform="rotate(18 909 256)" />
        <rect x="770" y="600" width="22" height="22" rx="5" fill="var(--tile-1)" />
        <polygon points="40,520 70,470 100,520" fill="var(--lilac-300)" />
        <circle cx="1150" cy="760" r="26" fill="var(--sky-300)" />
      </g>
      <g fill="var(--butter-300)" opacity="0.6">
        <path d="M640 40 l6 13 13 6 -13 6 -6 13 -6 -13 -13 -6 13 -6z" />
        <path d="M360 160 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4z" />
        <path d="M1000 470 l5 11 11 5 -11 5 -5 11 -5 -11 -11 -5 11 -5z" />
      </g>
    </svg>
  );
}
