import { useState } from 'react';
import MathText from '../../components/ui/MathText.jsx';
import TataCoach from './TataCoach.jsx';
import { toPoly, Poly } from '../../math/index.js';
import { feedback } from '../../content/feedback.js';
import styles from './lesson.module.css';

const VAR_OPTIONS = ['x²', 'x', '1'];
const varLabel = (vars) => Poly.term(1, vars).toString(); // {x:2} → 'x²', {} → '1'

/**
 * Mesin Pembagi (World 1.6): suku tunggal dibagi suku tunggal dalam dua langkah terpisah
 * — bagi angka, lalu bagi variabel — agar beban kognitif kecil (LEARNING_DESIGN §4.1).
 */
export default function DividerScreen({ screen, onDone }) {
  const [a] = toPoly(screen.dividend).termList();
  const [b] = toPoly(screen.divisor).termList();
  const [q] = toPoly(screen.dividend).divideByMonomial(toPoly(screen.divisor)).termList();
  const qVar = varLabel(q.vars);

  const [num, setNum] = useState('');
  const [numOk, setNumOk] = useState(false);
  const [varOk, setVarOk] = useState(false);
  const [msg, setMsg] = useState({ text: 'Langkah 1: bagi angkanya dulu.', tone: 'neutral' });
  const [firstTry, setFirstTry] = useState(true);

  const checkNum = () => {
    if (Number(num) === q.coef) {
      setNumOk(true);
      setMsg({ text: 'Benar! Langkah 2: bagi variabelnya.', tone: 'happy' });
    } else {
      setFirstTry(false);
      setMsg({
        text: Number(num) === a.coef - b.coef ? `Itu pengurangan. Berapa ${a.coef} dibagi ${b.coef}?` : `Coba lagi: ${a.coef} : ${b.coef} = ?`,
        tone: 'confused',
      });
    }
  };

  const chooseVar = (v) => {
    if (v === qVar) {
      setVarOk(true);
      setMsg({ text: 'Tepat! Lihat hasilnya dan cek dengan mengalikan.', tone: 'happy' });
      onDone({ firstTry });
      return;
    }
    setFirstTry(false);
    const code = v === varLabel(a.vars) ? 'M8' : qVar === '1' ? 'M9' : 'M10';
    setMsg({ text: feedback[code].text, tone: 'confused' });
  };

  const result = qVar === '1' ? String(q.coef) : `${q.coef === 1 ? '' : q.coef}${qVar}`;

  return (
    <div className={styles.screenBody}>
      <p className={styles.bigMath}>
        <MathText size="large">{`${screen.dividend} : ${screen.divisor}`}</MathText>
      </p>
      <div className={styles.machine}>
        <div className={styles.machineRow}>
          <span>Angka:</span>
          <span>
            {a.coef} : {b.coef} =
          </span>
          <input
            className={styles.smallInput}
            value={num}
            onChange={(e) => setNum(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && checkNum()}
            inputMode="numeric"
            aria-label="Hasil bagi angka"
            disabled={numOk}
          />
          {!numOk && (
            <button type="button" className={styles.miniBtn} onClick={checkNum} disabled={!num}>
              Cek
            </button>
          )}
        </div>
        {numOk && (
          <div className={styles.machineRow}>
            <span>Variabel:</span>
            <MathText>{`${varLabel(a.vars)} : ${varLabel(b.vars)} =`}</MathText>
            <div className={styles.varChoices} role="group" aria-label="Pilih hasil bagi variabel">
              {VAR_OPTIONS.map((v) => (
                <button key={v} type="button" className={styles.miniBtn} onClick={() => chooseVar(v)} disabled={varOk}>
                  <MathText>{v}</MathText>
                </button>
              ))}
            </div>
          </div>
        )}
        {varOk && (
          <p className={styles.machineResult}>
            <MathText size="large">{`${screen.dividend} : ${screen.divisor} = ${result}`}</MathText>
            <br />
            Cek: <MathText>{`${screen.divisor} × ${result} = ${screen.dividend}`}</MathText> ✔
          </p>
        )}
      </div>
      <TataCoach message={msg.text} tone={msg.tone} />
    </div>
  );
}
