import { pretty } from '../../components/ui/prettyMath.js';

/**
 * Merapikan TAMPILAN jawaban AI (isi tidak diubah):
 *  - membuang penanda rumus LaTeX ($…$, $$…$$, \( \), \[ \]) yang kadang dipakai model AI;
 *  - **teks** → huruf tebal; *teks* (miring Markdown) → teks biasa; * / - di awal baris → poin "•";
 *  - ^2 → ², " - " → " − " (sama seperti teks lain di aplikasi).
 */
export function cleanReply(text) {
  return pretty(
    String(text ?? '')
      .replace(/\$\$?([^$]+?)\$\$?/g, '$1')
      .replace(/\\\(|\\\)|\\\[|\\\]/g, '')
      .replace(/^\s*[*-]\s+/gm, '• '),
  );
}

export default function FormattedReply({ text }) {
  const parts = cleanReply(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i}>{p.slice(2, -2)}</strong> : p.replace(/\*\*/g, '').replace(/\*([^*\n]+)\*/g, '$1')));
}
