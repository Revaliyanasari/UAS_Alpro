import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import TataCoach from './TataCoach.jsx';
import { gcd } from '../../math/index.js';
import styles from './Activities.module.css';

export const factorsOf = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

/**
 * FPB bilangan lewat daftar faktor (World 1.5).
 * Langkah 1: ketuk faktor bilangan pertama yang juga ada di daftar bilangan kedua.
 * Langkah 2: pilih faktor bersama yang terbesar → itulah FPB.
 */
export default function CommonFactorsScreen({ screen, onDone }) {
  const { a, b } = screen;
  const fa = factorsOf(a);
  const fb = factorsOf(b);
  const common = fa.filter((d) => fb.includes(d));
  const g = gcd(a, b);

  const [picked, setPicked] = useState([]);
  const [stage, setStage] = useState('common'); // 'common' → 'greatest' → 'done'
  const [firstTry, setFirstTry] = useState(true);
  const [msg, setMsg] = useState({ text: `Ketuk faktor ${a} yang juga ada di daftar faktor ${b}.`, tone: 'neutral' });

  const toggle = (d) => setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const checkCommon = () => {
    const extra = picked.filter((d) => !fb.includes(d));
    const missing = common.filter((d) => !picked.includes(d));
    if (extra.length === 0 && missing.length === 0) {
      setStage('greatest');
      return setMsg({ text: `Benar! Faktor bersamanya ${common.join(', ')}. Sekarang pilih yang terbesar.`, tone: 'happy' });
    }
    setFirstTry(false);
    setMsg({
      text: extra.length > 0 ? `Ada yang tidak ada di daftar faktor ${b}. Cocokkan lagi kedua daftar.` : 'Hampir! Masih ada faktor bersama yang terlewat.',
      tone: 'confused',
    });
  };

  const chooseGreatest = (d) => {
    if (d === g) {
      setStage('done');
      setMsg({ text: `Tepat! FPB dari ${a} dan ${b} adalah ${g}.`, tone: 'happy' });
      return onDone({ firstTry });
    }
    setFirstTry(false);
    setMsg({ text: 'Itu faktor bersama, tapi belum yang paling besar.', tone: 'confused' });
  };

  return (
    <div className={styles.activity}>
      <div className={styles.factorRow}>
        <span className={styles.factorHead}>Faktor {a}:</span>
        {fa.map((d) => (
          <button
            key={d}
            type="button"
            className={[styles.chip, picked.includes(d) ? styles.chipOn : ''].join(' ')}
            onClick={() => toggle(d)}
            disabled={stage !== 'common'}
            aria-pressed={picked.includes(d)}
            aria-label={`Faktor ${d} dari ${a}`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className={styles.factorRow}>
        <span className={styles.factorHead}>Faktor {b}:</span>
        {fb.map((d) => (
          <span key={d} className={styles.chipStatic}>
            {d}
          </span>
        ))}
      </div>
      {stage === 'common' && (
        <Button onClick={checkCommon} disabled={picked.length === 0}>
          Periksa faktor bersama
        </Button>
      )}
      {stage !== 'common' && (
        <div className={styles.factorRow} role="group" aria-label="Pilih faktor bersama terbesar">
          <span className={styles.factorHead}>Terbesar:</span>
          {common.map((d) => (
            <button
              key={d}
              type="button"
              className={[styles.chip, stage === 'done' && d === g ? styles.chipOn : ''].join(' ')}
              onClick={() => chooseGreatest(d)}
              disabled={stage === 'done'}
              aria-label={`FPB ${d}`}
            >
              {d}
            </button>
          ))}
        </div>
      )}
      <TataCoach message={msg.text} tone={msg.tone} />
    </div>
  );
}
