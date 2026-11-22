import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import TataCoach from './TataCoach.jsx';
import { moodFor } from '../../components/tata/tataMood.js';
import styles from './Activities.module.css';

/** Semua pasangan faktor n, mis. 12 → [[1,12],[2,6],[3,4]]. */
export function factorPairs(n) {
  const out = [];
  for (let r = 1; r * r <= n; r++) if (n % r === 0) out.push([r, n / r]);
  return out;
}

/**
 * Bangun persegi panjang (World 2.1): susun n ubin satuan dengan jumlah baris tertentu.
 * Jika setiap baris penuh, ukurannya (baris × kolom) adalah pasangan faktor n.
 * Siswa menemukan semua ukuran berbeda (2 × 6 dan 6 × 2 dianggap sama, hanya diputar).
 */
export default function FactorPairsScreen({ screen, onDone }) {
  const n = screen.units;
  const pairs = factorPairs(n);
  const [rows, setRows] = useState(1);
  const [found, setFound] = useState([]);
  const [firstTry, setFirstTry] = useState(true);
  const [msg, setMsg] = useState({ text: screen.prompt, tone: 'neutral' });
  const done = found.length === pairs.length;

  const cols = Math.ceil(n / rows);
  const full = n % rows === 0;

  const record = () => {
    if (!full) {
      setFirstTry(false);
      return setMsg({ text: `Baris terakhir belum penuh. ${n} ubin tidak bisa dibagi rata ke ${rows} baris.`, tone: 'confused' });
    }
    const key = Math.min(rows, cols);
    if (found.includes(key)) {
      return setMsg({
        text: `${rows} × ${cols} sudah dicatat (sama dengan ${cols} × ${rows}, hanya diputar). Coba jumlah baris lain.`,
        tone: 'neutral',
      });
    }
    const next = [...found, key].sort((a, b) => a - b);
    setFound(next);
    if (next.length === pairs.length) {
      setMsg({ text: screen.done, tone: 'happy', mood: moodFor('discover') });
      onDone({ firstTry });
    } else {
      setMsg({ text: `Bagus! ${n} = ${rows} × ${cols}. Masih ada ${pairs.length - next.length} ukuran lain.`, tone: 'happy' });
    }
  };

  return (
    <div className={styles.activity}>
      <div className={styles.stepper}>
        <Button variant="secondary" onClick={() => setRows((r) => Math.max(1, r - 1))} disabled={done || rows === 1} aria-label="Kurangi baris">
          −
        </Button>
        <span aria-live="polite">
          <strong>{rows}</strong> baris
        </span>
        <Button variant="secondary" onClick={() => setRows((r) => Math.min(n, r + 1))} disabled={done || rows === n} aria-label="Tambah baris">
          +
        </Button>
      </div>
      <div
        className={styles.unitGrid}
        style={{ gridTemplateColumns: `repeat(${cols}, var(--unit))` }}
        role="img"
        aria-label={full ? `Persegi panjang ${rows} baris kali ${cols} kolom` : `${rows} baris, baris terakhir belum penuh`}
      >
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={styles.unit} />
        ))}
      </div>
      <p className={styles.sizeLabel}>{full ? `${rows} × ${cols} = ${n}` : `${rows} baris: ada baris yang belum penuh`}</p>
      {!done && <Button onClick={record}>Catat ukuran ini</Button>}
      <ul className={styles.foundList} aria-label="Ukuran yang ditemukan">
        {pairs.map(([a, b]) => (
          <li key={a} className={found.includes(a) ? styles.foundYes : ''}>
            {found.includes(a) ? `${a} × ${b}` : '? × ?'}
          </li>
        ))}
      </ul>
      <TataCoach message={msg.text} tone={msg.tone} mood={msg.mood} />
    </div>
  );
}
