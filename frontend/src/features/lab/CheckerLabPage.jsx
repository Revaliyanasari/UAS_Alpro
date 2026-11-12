import { useState } from 'react';
import PageShell from '../../components/ui/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import MathText from '../../components/ui/MathText.jsx';
import { checkFactorization, checkDivision, toPoly, MathInputError } from '../../math/index.js';
import { feedbackFor } from '../../content/feedback.js';
import styles from './CheckerLabPage.module.css';

// Halaman uji untuk guru/peneliti: mencoba jawaban siswa dan melihat umpan balik TATA
// yang dihasilkan mesin pemeriksa. Contoh di bawah diambil dari docs/LEARNING_DESIGN.md §5.2.
const MODES = {
  factor: {
    label: 'Faktorkan',
    examples: ['4x(2x+3)', '2x(4x+6)', '4(2x^2+3x)', '4x(2x+12)', '8x^2+12x'],
  },
  divide: {
    label: 'Bagi suku',
    examples: ['2x', '2x^2', '4x', '2'],
  },
};

const STATUS_TEXT = {
  correct: 'Benar',
  partial: 'Hampir benar',
  'not-factored': 'Belum berbentuk faktor',
  wrong: 'Belum tepat',
  invalid: 'Tulisan belum terbaca',
};

function safeFormat(raw) {
  try {
    return toPoly(raw).toString();
  } catch (err) {
    if (err instanceof MathInputError) return null;
    throw err;
  }
}

export default function CheckerLabPage() {
  const [mode, setMode] = useState('factor');
  const [target, setTarget] = useState('8x^2+12x');
  const [dividend, setDividend] = useState('8x^2');
  const [divisor, setDivisor] = useState('4x');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showMultiply, setShowMultiply] = useState(false);
  const [problemError, setProblemError] = useState('');

  const changeMode = (m) => {
    setMode(m);
    setAnswer('');
    setResult(null);
    setShowMultiply(false);
    setProblemError('');
  };

  const check = (value = answer) => {
    setShowMultiply(false);
    setProblemError('');
    try {
      const r = mode === 'factor' ? checkFactorization(value, target) : checkDivision(value, dividend, divisor);
      setResult(r);
    } catch (err) {
      setResult(null);
      setProblemError(err instanceof MathInputError ? `Soalnya belum terbaca: ${err.message}` : `Soal tidak valid: ${err.message}`);
    }
  };

  const tryExample = (ex) => {
    setAnswer(ex);
    check(ex);
  };

  const fb = result ? feedbackFor(result) : null;
  const targetPretty = safeFormat(mode === 'factor' ? target : `${dividend}`);

  return (
    <PageShell title="Lab Pemeriksa Aljabar">
      <p className={styles.intro}>
        Halaman uji untuk guru: coba berbagai jawaban siswa dan lihat umpan balik yang akan diberikan TATA.
      </p>

      <div className={styles.tabs} role="tablist" aria-label="Jenis soal">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            className={[styles.tab, mode === key ? styles.tabActive : ''].join(' ')}
            onClick={() => changeMode(key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Card tone="mint">
        {mode === 'factor' ? (
          <label className={styles.field}>
            <span>Soal: faktorkan</span>
            <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="text" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          </label>
        ) : (
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Dibagi</span>
              <input value={dividend} onChange={(e) => setDividend(e.target.value)} autoCapitalize="off" spellCheck={false} />
            </label>
            <span className={styles.op} aria-hidden="true">:</span>
            <label className={styles.field}>
              <span>Pembagi</span>
              <input value={divisor} onChange={(e) => setDivisor(e.target.value)} autoCapitalize="off" spellCheck={false} />
            </label>
          </div>
        )}
        <p className={styles.preview}>
          {targetPretty ? (
            <MathText size="large">{mode === 'factor' ? targetPretty : `${safeFormat(dividend) ?? dividend} : ${safeFormat(divisor) ?? divisor}`}</MathText>
          ) : (
            <span className={styles.warn}>Soal belum terbaca.</span>
          )}
        </p>
      </Card>

      <form
        className={styles.answerForm}
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <label className={styles.field}>
          <span>Jawaban siswa</span>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={mode === 'factor' ? 'contoh: 4x(2x+3)' : 'contoh: 2x'}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <Button type="submit" block>
          Periksa
        </Button>
      </form>

      <div className={styles.examples}>
        <span>Coba contoh:</span>
        {MODES[mode].examples.map((ex) => (
          <button key={ex} type="button" className={styles.chip} onClick={() => tryExample(ex)}>
            <MathText>{ex}</MathText>
          </button>
        ))}
      </div>

      {problemError && <p className={styles.warn}>{problemError}</p>}

      {result && (
        <section className={styles.result} aria-label="Hasil pemeriksaan">
          <p className={[styles.badge, styles[`badge-${result.status}`]].join(' ')}>
            {result.status === 'correct' ? '✔ ' : '💡 '}
            {STATUS_TEXT[result.status]}
          </p>
          <SpeechBubble tone={fb.tone === 'happy' ? 'happy' : 'confused'}>{fb.text}</SpeechBubble>
          <p className={styles.code}>Kode diagnosis: {result.code}</p>

          {mode === 'factor' && result.expanded && (
            <>
              <Button variant="secondary" block onClick={() => setShowMultiply((v) => !v)} aria-expanded={showMultiply}>
                {showMultiply ? 'Sembunyikan' : 'Cek dengan mengalikan'}
              </Button>
              {showMultiply && (
                <div className={styles.multiply}>
                  <p>
                    <MathText>{answer}</MathText> = <MathText>{result.expanded}</MathText>
                  </p>
                  <p>
                    Soal: <MathText>{targetPretty}</MathText> →{' '}
                    {result.expanded === targetPretty ? <strong>sama ✔</strong> : <strong>belum sama</strong>}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </PageShell>
  );
}
