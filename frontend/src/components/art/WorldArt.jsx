import styles from './WorldArt.module.css';

/**
 * Ilustrasi SVG orisinal untuk setiap dunia belajar (tanpa file gambar, ±1 KB per dunia, berjalan offline).
 * Warna hanya dari token desain (styles/tokens.css). Dekoratif → aria-hidden; nama dunia selalu tertulis di sekitarnya.
 *  1 Lembah Aljabar      — lembah berbukit dengan ubin x, y, dan konstanta
 *  2 Gua Rahasia         — mulut gua dengan kurung faktor a(b + c) yang bersinar
 *  3 Kepulauan Kuadrat   — pulau-pulau persegi, satu pojoknya terpotong (a² − b²)
 *  4 Menara Tantangan    — menara 4 lantai dengan bendera di puncak
 *  5 Petualangan Literasi — buku terbuka dengan jalan setapak & pensil
 */
const SCENES = {
  1: (
    <>
      <rect width="160" height="100" fill="var(--sky-100)" />
      <circle cx="132" cy="22" r="11" fill="var(--butter-300)" />
      <path d="M0 72 Q30 44 62 66 T120 58 T160 62 V100 H0 Z" fill="var(--mint-200)" />
      <path d="M0 84 Q40 64 82 80 T160 76 V100 H0 Z" fill="var(--sage-500)" />
      <g className={styles.float}>
        <rect x="26" y="30" width="16" height="16" rx="3" fill="var(--tile-x2)" />
        <text x="34" y="42" className={styles.var}>x</text>
      </g>
      <g className={styles.floatSlow}>
        <rect x="70" y="22" width="16" height="16" rx="3" fill="var(--tile-x)" />
        <text x="78" y="34" className={styles.var}>y</text>
      </g>
      <g className={styles.float}>
        <rect x="100" y="38" width="12" height="12" rx="3" fill="var(--tile-1)" />
        <text x="106" y="47.5" className={styles.num}>1</text>
      </g>
    </>
  ),
  2: (
    <>
      <rect width="160" height="100" fill="var(--lilac-100)" />
      <path d="M0 100 V40 Q40 6 80 14 Q124 4 160 36 V100 Z" fill="var(--beige-500)" />
      <path d="M44 100 V66 Q80 30 116 66 V100 Z" fill="var(--ink-900)" opacity="0.85" />
      <circle cx="80" cy="74" r="22" fill="var(--butter-300)" opacity="0.35" className={styles.glow} />
      <text x="80" y="81" className={styles.formula}>a(b+c)</text>
      <circle cx="30" cy="30" r="3" fill="var(--butter-300)" className={styles.twinkle} />
      <circle cx="134" cy="26" r="2.5" fill="var(--butter-300)" className={styles.twinkleSlow} />
    </>
  ),
  3: (
    <>
      <rect width="160" height="100" fill="var(--sky-300)" />
      <path d="M0 70 Q20 64 40 70 T80 70 T120 70 T160 70 V100 H0 Z" fill="var(--sky-100)" opacity="0.6" className={styles.wave} />
      <rect x="18" y="40" width="44" height="44" rx="4" fill="var(--mint-200)" stroke="var(--sage-500)" strokeWidth="2" />
      <rect x="44" y="66" width="18" height="18" fill="var(--sky-300)" stroke="var(--peach-300)" strokeWidth="2" strokeDasharray="3 2" />
      <text x="34" y="60" className={styles.var}>a²</text>
      <rect x="86" y="50" width="28" height="28" rx="4" fill="var(--mint-200)" stroke="var(--sage-500)" strokeWidth="2" />
      <rect x="124" y="60" width="18" height="18" rx="3" fill="var(--mint-200)" stroke="var(--sage-500)" strokeWidth="2" />
      <path d="M100 50 V34 L112 40 L100 44" fill="var(--peach-300)" />
      <line x1="100" y1="50" x2="100" y2="34" stroke="var(--ink-600)" strokeWidth="1.5" />
    </>
  ),
  4: (
    <>
      <rect width="160" height="100" fill="var(--peach-100)" />
      <path d="M0 88 Q80 76 160 88 V100 H0 Z" fill="var(--sage-500)" />
      <g>
        <rect x="58" y="70" width="44" height="18" fill="var(--beige-300)" stroke="var(--beige-500)" />
        <rect x="61" y="52" width="38" height="18" fill="var(--butter-300)" stroke="var(--beige-500)" />
        <rect x="64" y="34" width="32" height="18" fill="var(--teal-300)" stroke="var(--beige-500)" />
        <rect x="67" y="18" width="26" height="16" fill="var(--lilac-300)" stroke="var(--beige-500)" />
        <text x="80" y="83" className={styles.floor}>1</text>
        <text x="80" y="65" className={styles.floor}>2</text>
        <text x="80" y="47" className={styles.floor}>3</text>
        <text x="80" y="30" className={styles.floor}>4</text>
      </g>
      <line x1="80" y1="18" x2="80" y2="4" stroke="var(--ink-600)" strokeWidth="1.5" />
      <path d="M80 4 L94 8 L80 12 Z" fill="var(--terra-500)" className={styles.flag} />
      <circle cx="28" cy="26" r="8" fill="var(--butter-300)" />
    </>
  ),
  5: (
    <>
      <rect width="160" height="100" fill="var(--butter-100)" />
      <path d="M22 26 Q52 18 80 28 V88 Q52 78 22 86 Z" fill="var(--white)" stroke="var(--beige-500)" strokeWidth="1.5" />
      <path d="M138 26 Q108 18 80 28 V88 Q108 78 138 86 Z" fill="var(--cream-50)" stroke="var(--beige-500)" strokeWidth="1.5" />
      <path d="M32 74 Q44 58 56 66 T72 48" fill="none" stroke="var(--terra-500)" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="72" cy="46" r="3" fill="var(--terra-500)" />
      <line x1="92" y1="42" x2="128" y2="40" stroke="var(--beige-300)" strokeWidth="2" />
      <line x1="92" y1="52" x2="124" y2="51" stroke="var(--beige-300)" strokeWidth="2" />
      <line x1="92" y1="62" x2="128" y2="62" stroke="var(--beige-300)" strokeWidth="2" />
      <g className={styles.pencil}>
        <rect x="112" y="68" width="30" height="7" rx="2" fill="var(--butter-300)" transform="rotate(-30 112 68)" />
        <path d="M137 53 L145 49 L141 57 Z" fill="var(--ink-600)" />
      </g>
    </>
  ),
};

/** banner: isi lebar penuh dengan tinggi tetap (dipotong rapi di atas/bawah), mis. di lembar pulau peta. */
export default function WorldArt({ worldId, className = '', banner = false }) {
  const scene = SCENES[worldId];
  if (!scene) return null;
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio={banner ? "xMidYMid slice" : "xMidYMid meet"} className={[styles.art, className].join(' ')} aria-hidden="true" focusable="false" data-world-art={worldId}>
      {scene}
    </svg>
  );
}
