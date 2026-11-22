import { resolveExpression } from './tataExpressions.js';
import styles from './Tata2D.module.css';

/**
 * TATA versi 2D (SVG). Proporsi mengikuti tataDesign.js (lebar badan 120 px pada viewBox 200 × 240),
 * warna memakai token CSS sehingga identik dengan versi 3D.
 * Ekspresi dirakit dari bagian-bagian (mata, alis, mulut, pose lengan, aksesori) — lihat tataExpressions.js.
 */
const INK = 'var(--ink-900)';
const EYE_L = 82;
const EYE_R = 118;
const EYE_Y = 118;

const line = { fill: 'none', stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' };

function star(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(1)},${(cy + rr * Math.sin(rad)).toFixed(1)}`);
  }
  return pts.join(' ');
}
const heart = (cx, cy, s) =>
  `M${cx} ${cy + 6 * s} C${cx - 9 * s} ${cy - 1 * s} ${cx - 5 * s} ${cy - 8 * s} ${cx} ${cy - 3 * s} C${cx + 5 * s} ${cy - 8 * s} ${cx + 9 * s} ${cy - 1 * s} ${cx} ${cy + 6 * s}Z`;

function Eye({ kind, cx, side }) {
  const y = EYE_Y;
  switch (kind) {
    case 'happy':
      return <path d={`M${cx - 6} ${y + 2} q6 -8 12 0`} {...line} />;
    case 'closed':
      return <path d={`M${cx - 6} ${y - 1} q6 6 12 0`} {...line} />;
    case 'tight':
      return side === 'L' ? <path d={`M${cx - 6} ${y - 5} l10 5 l-10 5`} {...line} /> : <path d={`M${cx + 6} ${y - 5} l-10 5 l10 5`} {...line} />;
    case 'wink': // hanya mata kanan; mata kiri digambar OpenEye
      return <path d={`M${cx - 6} ${y + 1} q6 -7 12 0`} {...line} />;
    case 'wide':
      return (
        <g>
          <circle cx={cx} cy={y} r="9" fill={INK} />
          <circle cx={cx + 3} cy={y - 3} r="3.2" fill="var(--white)" />
        </g>
      );
    case 'star':
      return <polygon points={star(cx, y, 9)} fill="var(--butter-300)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />;
    case 'heart':
      return <path d={heart(cx, y - 1, 1.1)} fill="var(--terra-500)" />;
    case 'sleepy':
      return (
        <g>
          <path d={`M${cx - 7} ${y} a7 7 0 0 0 14 0 Z`} fill={INK} />
          <path d={`M${cx - 8} ${y} h16`} {...line} strokeWidth="3" />
        </g>
      );
    case 'narrow':
      return <ellipse cx={cx} cy={y} rx="7" ry="3.5" fill={INK} />;
    case 'lookUp':
      return (
        <g>
          <circle cx={cx} cy={y - 2} r="7" fill={INK} />
          <circle cx={cx + 1} cy={y - 6} r="2.4" fill="var(--white)" />
        </g>
      );
    case 'sad':
      return (
        <g>
          <circle cx={cx} cy={y + 2} r="6.5" fill={INK} />
          <circle cx={cx + 2} cy={y} r="2" fill="var(--white)" />
        </g>
      );
    case 'down':
      return (
        <g>
          <circle cx={cx} cy={y + 3} r="5.5" fill={INK} />
          <path d={`M${cx - 8} ${y - 3} h16`} {...line} strokeWidth="3" />
        </g>
      );
    default:
      return null;
  }
}

// 'open' terpisah agar bisa diberi jari-jari berbeda (mata 'uneven').
function OpenEye({ cx, r = 7 }) {
  return (
    <g className={styles.eyes}>
      <circle cx={cx} cy={EYE_Y} r={r} fill={INK} />
      <circle cx={cx + 2.5} cy={EYE_Y - 2.5} r={r * 0.31} fill="var(--white)" />
    </g>
  );
}

function Eyes({ kind }) {
  if (kind === 'open') return [<OpenEye key="l" cx={EYE_L} />, <OpenEye key="r" cx={EYE_R} />];
  if (kind === 'uneven') return [<OpenEye key="l" cx={EYE_L} r={7.5} />, <OpenEye key="r" cx={EYE_R} r={5} />];
  if (kind === 'wink') return [<OpenEye key="l" cx={EYE_L} />, <Eye key="r" kind="wink" cx={EYE_R} side="R" />];
  return [<Eye key="l" kind={kind} cx={EYE_L} side="L" />, <Eye key="r" kind={kind} cx={EYE_R} side="R" />];
}

function Brows({ kind }) {
  const p = { ...line, strokeWidth: 3 };
  if (kind === 'raised') return <g><path d="M73 103 q9 -6 18 0" {...p} /><path d="M109 103 q9 -6 18 0" {...p} /></g>;
  if (kind === 'worried') return <g><path d="M74 105 L90 100" {...p} /><path d="M110 100 L126 105" {...p} /></g>;
  if (kind === 'focused') return <g><path d="M74 100 L90 105" {...p} /><path d="M110 105 L126 100" {...p} /></g>;
  if (kind === 'flat') return <g><path d="M75 104 h14" {...p} /><path d="M111 104 h14" {...p} /></g>;
  return null;
}

function Mouth({ kind }) {
  switch (kind) {
    case 'grin':
      return <path d="M88 133 Q100 147 112 133 Z" fill={INK} {...{ stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' }} />;
    case 'laugh':
      return (
        <g>
          <path d="M86 131 Q100 153 114 131 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="100" cy="143" rx="6" ry="3.5" fill="var(--peach-300)" />
        </g>
      );
    case 'small':
      return <path d="M94 136 Q100 141 106 136" {...line} strokeWidth="3.5" />;
    case 'o':
      return <ellipse cx="100" cy="139" rx="4.5" ry="5.5" fill={INK} />;
    case 'bigO':
      return <ellipse cx="100" cy="140" rx="7" ry="9" fill={INK} />;
    case 'flat':
      return <path d="M91 139 h18" {...line} strokeWidth="3.5" />;
    case 'wavy':
      return <path d="M89 139 q5.5 -5 11 0 t11 0" {...line} strokeWidth="3.5" />;
    case 'frown':
      return <path d="M89 142 Q100 132 111 142" {...line} strokeWidth="3.5" />;
    case 'smirk':
      return <path d="M90 137 Q103 143 111 133" {...line} strokeWidth="3.5" />;
    case 'side':
      return <path d="M94 139 q6 -2 13 1" {...line} strokeWidth="3.5" />;
    case 'talk':
      return <ellipse cx="100" cy="138" rx="7" ry="5" fill={INK} className={styles.mouthTalk} />;
    default:
      return <path d="M89 134 Q100 144 111 134" {...line} strokeWidth="3.5" />;
  }
}

/** Tangan di depan badan (untuk pose yang tidak bisa dibuat dengan memutar lengan samping). */
function FrontHands({ arms }) {
  const hand = { fill: 'var(--teal-400)', stroke: 'var(--teal-500)', strokeWidth: 2 };
  if (arms === 'chin') return <circle cx="128" cy="156" r="10" {...hand} />;
  if (arms === 'hug')
    return (
      <g>
        <rect x="52" y="160" width="52" height="15" rx="7.5" transform="rotate(-12 78 167)" {...hand} />
        <rect x="96" y="160" width="52" height="15" rx="7.5" transform="rotate(12 122 167)" {...hand} />
      </g>
    );
  if (arms === 'cover')
    return (
      <g>
        <circle cx="64" cy="140" r="10" {...hand} />
        <circle cx="136" cy="140" r="10" {...hand} />
      </g>
    );
  return null;
}

function Extras({ list }) {
  return list.map((x) => {
    switch (x) {
      case 'sparks':
        return (
          <g key={x} className={styles.sparks} fill="var(--butter-300)">
            <path d="M28 52 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4z" />
            <path d="M170 38 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
            <path d="M176 92 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5z" />
          </g>
        );
      case 'question':
        return <text key={x} x="166" y="72" className={styles.question}>?</text>;
      case 'exclaim':
        return <text key={x} x="168" y="70" className={styles.question}>!</text>;
      case 'bulb':
        return (
          <g key={x} className={styles.pulseItem}>
            <circle cx="160" cy="44" r="14" fill="var(--butter-300)" stroke={INK} strokeWidth="2" />
            <rect x="154" y="57" width="12" height="8" rx="2" fill="var(--beige-500)" />
            <path d="M160 24 v-6 M178 32 l5 -4 M142 32 l-5 -4" {...line} strokeWidth="3" stroke="var(--terra-500)" />
          </g>
        );
      case 'zzz':
        return (
          <g key={x} className={styles.floatItem} fill="var(--teal-700)">
            <text x="150" y="66" className={styles.zzz}>z</text>
            <text x="164" y="48" className={styles.zzzBig}>Z</text>
          </g>
        );
      case 'hearts':
        return (
          <g key={x} className={styles.floatItem} fill="var(--terra-500)">
            <path d={heart(34, 70, 1.2)} />
            <path d={heart(168, 56, 0.9)} />
          </g>
        );
      case 'sweat':
        return <path key={x} d="M156 78 q8 12 0 16 q-8 -4 0 -16z" fill="var(--teal-300)" stroke="var(--teal-500)" strokeWidth="1.5" />;
      case 'tear':
        return <path key={x} d="M76 126 q6 9 0 12 q-6 -3 0 -12z" fill="var(--teal-300)" />;
      case 'dots':
        return (
          <g key={x} fill="var(--beige-500)">
            <circle cx="150" cy="70" r="4" />
            <circle cx="162" cy="56" r="6" />
            <circle cx="176" cy="38" r="9" />
          </g>
        );
      case 'star':
        return <polygon key={x} points={star(36, 64, 9)} fill="var(--butter-300)" className={styles.sparks} />;
      case 'blush':
        return (
          <g key={x} stroke="var(--terra-500)" strokeWidth="2" strokeLinecap="round">
            <path d="M62 131 l4 -4 M68 133 l4 -4" />
            <path d="M128 131 l4 -4 M134 133 l4 -4" />
          </g>
        );
      default:
        return null;
    }
  });
}

export default function Tata2D({ state = 'idle', label = 'TATA' }) {
  const e = resolveExpression(state);
  const hideSideArms = e.arms === 'hug' || e.arms === 'cover';
  const blush = e.extra.includes('blush');
  return (
    <svg
      viewBox="0 0 200 240"
      className={[styles.tata, styles[`anim-${e.anim}`], styles[`arms-${e.arms}`]].join(' ')}
      role="img"
      aria-label={label}
      data-expression={state}
    >
      <ellipse cx="100" cy="226" rx="56" ry="7" className={styles.shadow} />
      <g className={styles.figure}>
        {/* kaki */}
        <ellipse cx="73" cy="206" rx="18" ry="9" fill="var(--beige-300)" />
        <ellipse cx="127" cy="206" rx="18" ry="9" fill="var(--beige-300)" />
        {!hideSideArms && (
          <>
            {/* lengan kiri (memegang ubin x) */}
            <g className={styles.armLeft}>
              <rect x="18" y="128" width="26" height="14" rx="7" fill="var(--teal-400)" />
              <rect x="10" y="112" width="10" height="34" rx="2" fill="var(--butter-300)" stroke={INK} strokeOpacity="0.15" />
            </g>
            {/* lengan kanan */}
            {e.arms !== 'chin' && (
              <g className={styles.armRight}>
                <rect x="156" y="128" width="26" height="14" rx="7" fill="var(--teal-400)" />
              </g>
            )}
          </>
        )}
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
          <Brows kind={e.brows} />
          <Eyes kind={e.eyes} />
          {/* pipi */}
          <ellipse cx="69" cy="133" rx={blush ? 10 : 8} ry={blush ? 6.5 : 5} fill="var(--peach-300)" />
          <ellipse cx="131" cy="133" rx={blush ? 10 : 8} ry={blush ? 6.5 : 5} fill="var(--peach-300)" />
          <Mouth kind={e.mouth} />
        </g>
        <FrontHands arms={e.arms} />
        <Extras list={e.extra} />
      </g>
    </svg>
  );
}
