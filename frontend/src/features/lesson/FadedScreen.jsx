import { useState } from 'react';
import MathText from '../../components/ui/MathText.jsx';
import MathKeypad from '../../components/ui/MathKeypad.jsx';
import TataCoach from './TataCoach.jsx';
import { runCheck } from './runCheck.js';
import { feedbackFor } from '../../content/feedback.js';
import { pretty } from '../../components/ui/prettyMath.js';
import styles from './Activities.module.css';

/**
 * Contoh rumpang / "Coba Bersama" (LEARNING_DESIGN §3 fase 5): langkah contoh sudah tertulis,
 * tetapi beberapa bagian dikosongkan. Siswa mengisi satu kotak setiap kali, diperiksa mesin aljabar.
 * Setiap kotak punya satu petunjuk; isi kotak tidak pernah ditampilkan sebelum diisi benar.
 */
export default function FadedScreen({ screen, onDone }) {
  const [active, setActive] = useState(0);
  const [value, setValue] = useState('');
  const [firstTry, setFirstTry] = useState(true);
  const [hintLevel, setHintLevel] = useState(0);
  const [msg, setMsg] = useState({ text: 'Isi kotak yang menyala.', tone: 'neutral' });
  const blanks = screen.blanks;
  const done = active >= blanks.length;

  const submit = () => {
    const r = runCheck(blanks[active].check, value);
    if (r.status === 'correct') {
      const next = active + 1;
      setActive(next);
      setValue('');
      setHintLevel(0);
      if (next >= blanks.length) {
        setMsg({ text: screen.done, tone: 'happy' });
        onDone({ firstTry });
      } else {
        setMsg({ text: 'Benar! Lanjut ke kotak berikutnya.', tone: 'happy' });
      }
      return;
    }
    setFirstTry(false);
    setMsg({ text: feedbackFor(r).text, tone: 'confused' });
  };

  return (
    <div className={styles.activity}>
      <p className={styles.bigMathBox}>
        <MathText size="large">{screen.math}</MathText>
      </p>
      <ol className={styles.fadedSteps} aria-label="Langkah contoh">
        {blanks.map((b, i) => (
          <li key={b.label} className={i === active ? styles.fadedActive : ''}>
            {pretty(b.label)}{' '}
            {i < active ? (
              <strong className={styles.filled}>
                <MathText>{b.answer}</MathText>
              </strong>
            ) : (
              <span className={styles.blank}>{i === active && value ? <MathText>{value}</MathText> : '□'}</span>
            )}
          </li>
        ))}
      </ol>
      {!done && <MathKeypad value={value} onChange={setValue} onSubmit={submit} label={`Isi kotak ${active + 1}`} />}
      <TataCoach
        message={msg.text}
        tone={msg.tone}
        hints={done || !blanks[active].hint ? [] : [blanks[active].hint]}
        hintLevel={hintLevel}
        onHint={() => setHintLevel(1)}
      />
    </div>
  );
}
