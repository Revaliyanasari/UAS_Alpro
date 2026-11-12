import styles from './MathText.module.css';

const SUP_DIGITS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

/**
 * Menampilkan bentuk aljabar dengan rapi: variabel miring, pangkat sebagai superskrip,
 * minus dan kali memakai simbol matematika.
 * Menerima "8x^2 + 12x", "8x² + 12x", "(y+3)(y-3)".
 */
export function tokenizeMath(expr) {
  const out = [];
  const s = String(expr).replace(/\*/g, '×').replace(/-/g, '−');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '^') {
      let j = i + 1;
      while (j < s.length && /[0-9]/.test(s[j])) j++;
      out.push({ type: 'sup', value: s.slice(i + 1, j) });
      i = j - 1;
    } else if (SUP_DIGITS[ch]) {
      let v = '';
      let j = i;
      while (j < s.length && SUP_DIGITS[s[j]]) v += SUP_DIGITS[s[j++]];
      out.push({ type: 'sup', value: v });
      i = j - 1;
    } else if (/[a-zA-Z]/.test(ch)) {
      out.push({ type: 'var', value: ch });
    } else {
      out.push({ type: 'text', value: ch });
    }
  }
  return out;
}

export default function MathText({ children, size = 'normal', className = '' }) {
  const tokens = tokenizeMath(children ?? '');
  return (
    <span className={[styles.math, styles[size], className].filter(Boolean).join(' ')} aria-label={String(children)}>
      {tokens.map((t, i) => {
        if (t.type === 'sup') return <sup key={i}>{t.value}</sup>;
        if (t.type === 'var') return <i key={i}>{t.value}</i>;
        return <span key={i}>{t.value}</span>;
      })}
    </span>
  );
}
