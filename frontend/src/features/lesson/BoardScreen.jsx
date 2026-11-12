import { useState } from 'react';
import MathText from '../../components/ui/MathText.jsx';
import MathKeypad from '../../components/ui/MathKeypad.jsx';
import TataCoach from './TataCoach.jsx';
import { toPoly, Poly, checkFactorization, MathInputError } from '../../math/index.js';
import { feedbackFor } from '../../content/feedback.js';
import styles from './lesson.module.css';

function tryPoly(s) {
  try {
    return s.trim() ? toPoly(s) : null;
  } catch (e) {
    if (e instanceof MathInputError) return null;
    throw e;
  }
}

/**
 * Papan Matematika: siswa mengisi faktor luar dan isi kurung; papan langsung menampilkan
 * perkalian setiap suku (model distributif) dan membandingkannya dengan bentuk awal.
 */
export default function BoardScreen({ screen, onDone }) {
  const [outer, setOuter] = useState('');
  const [inner, setInner] = useState('');
  const [active, setActive] = useState('outer');
  const [msg, setMsg] = useState({ text: screen.prompt, tone: 'neutral' });
  const [done, setDone] = useState(false);
  const [firstTry, setFirstTry] = useState(true);

  const target = toPoly(screen.target);
  const o = tryPoly(outer);
  const i = tryPoly(inner);
  const rows =
    o && i
      ? i.termList().map((t) => {
          const term = Poly.term(t.coef, t.vars);
          return { key: t.key, term, product: o.mul(term) };
        })
      : [];
  const total = o && i ? o.mul(i) : null;
  const matches = total?.equals(target);

  const submit = () => {
    const r = checkFactorization(`(${outer})(${inner})`, screen.target);
    if (r.status === 'correct') {
      setDone(true);
      setMsg({ text: 'Hasil perkaliannya sama dengan bentuk awal, dan faktornya sudah terbesar!', tone: 'happy' });
      onDone({ firstTry });
    } else {
      setFirstTry(false);
      setMsg({ text: feedbackFor(r).text, tone: 'confused' });
    }
  };

  return (
    <div className={styles.screenBody}>
      <p className={styles.bigMath}>
        <MathText size="large">{screen.target}</MathText> = <span className={styles.slot}>{outer || '?'}</span>(
        <span className={styles.slot}>{inner || '?'}</span>)
      </p>
      <div className={styles.slotPick} role="group" aria-label="Pilih kotak yang diisi">
        <button type="button" aria-pressed={active === 'outer'} onClick={() => setActive('outer')} disabled={done}>
          Faktor luar
        </button>
        <button type="button" aria-pressed={active === 'inner'} onClick={() => setActive('inner')} disabled={done}>
          Isi kurung
        </button>
      </div>
      <MathKeypad
        label={active === 'outer' ? 'Faktor luar' : 'Isi kurung'}
        value={active === 'outer' ? outer : inner}
        onChange={active === 'outer' ? setOuter : setInner}
        onSubmit={submit}
        submitLabel="Periksa"
        disabled={done}
      />
      {rows.length > 0 && (
        <table className={styles.area} aria-label="Hasil perkalian setiap suku">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>
                  <MathText>{`(${o.toString()}) × (${r.term.toString()})`}</MathText>
                </td>
                <td>
                  = <MathText>{r.product.toString()}</MathText>
                </td>
              </tr>
            ))}
            <tr>
              <td>Jumlah</td>
              <td>
                = <MathText>{total.toString()}</MathText> {matches ? '✔ sama' : '✘ belum sama'}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <TataCoach message={msg.text} tone={msg.tone} />
    </div>
  );
}
