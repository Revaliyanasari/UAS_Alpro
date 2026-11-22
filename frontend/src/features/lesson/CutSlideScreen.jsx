import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import MathText from '../../components/ui/MathText.jsx';
import TataCoach from './TataCoach.jsx';
import { moodFor } from '../../components/tata/tataMood.js';
import styles from './CutSlide.module.css';

/**
 * Potong & Geser (World 3.2–3.3): bukti visual a² − b² = (a + b)(a − b).
 * Persegi a × a → potong pojok b × b → potong sisa L menjadi dua persegi panjang →
 * ketuk potongan bawah untuk memutar & menggesernya → persegi panjang (a + b) × (a − b).
 * Lalu siswa sendiri menentukan panjang & lebar (bukan diberi tahu). Semua langkah dengan ketukan/keyboard.
 */
const A = 150; // sisi a (px pada SVG)
const B = 60; // sisi b
const AB = A - B; // a − b
const PAD = 34;
const OPTIONS = ['a + b', 'a − b', 'a', 'b'];

export default function CutSlideScreen({ screen, onDone }) {
  const [step, setStep] = useState(0); // 0 utuh · 1 pojok dipotong · 2 L dipotong · 3 digeser · 4 panjang benar · 5 selesai
  const [msg, setMsg] = useState({ text: screen.prompt ?? 'Ketuk tombol untuk memotong pojok persegi.', tone: 'neutral' });
  const [firstTry, setFirstTry] = useState(true);

  const advance = (next, text) => {
    setStep(next);
    setMsg({ text, tone: 'happy' });
  };

  const pick = (which, opt) => {
    const right = which === 'long' ? 'a + b' : 'a − b';
    if (opt !== right) {
      setFirstTry(false);
      return setMsg({
        text: which === 'long' ? 'Hitung panjangnya: sisi atas a, ditambah potongan yang digeser selebar b.' : 'Lebarnya adalah sisa sisi kiri setelah dipotong b: a dikurangi b.',
        tone: 'confused',
        mood: moodFor('wrong', { attempt: 2 }),
      });
    }
    if (which === 'long') return advance(4, 'Benar! Sekarang tentukan lebarnya.');
    setStep(5);
    setMsg({ text: screen.done ?? 'Luasnya tetap sama, jadi a² − b² = (a + b)(a − b)!', tone: 'happy', mood: moodFor('discover') });
    onDone({ firstTry });
  };

  const slide = () => advance(3, 'Kedua potongan membentuk persegi panjang! Berapa panjangnya?');

  // posisi potongan B (bawah-kiri) sebelum & sesudah digeser
  const slid = step >= 3;
  const W = A + B + PAD * 2;
  const H = A + PAD * 2;

  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={slid ? 'Persegi panjang dengan panjang a + b dan lebar a − b' : 'Persegi bersisi a'}>
        <g transform={`translate(${PAD} ${PAD})`}>
          {/* potongan A: a × (a − b), tetap di atas */}
          <rect x="0" y="0" width={A} height={AB} className={styles.pieceA} />
          {/* potongan B: (a − b) × b di bawah-kiri; setelah digeser diputar menjadi b × (a − b) di kanan atas */}
          {/* Satu elemen yang sama berpindah lewat transform (transisi), agar posisi akhir selalu tepat:
              sebelum: geser ke (0, a−b); sesudah: putar 90° lalu geser ke (a+b, 0) → menempati x∈[a, a+b], y∈[0, a−b]. */}
          <rect
            x="0"
            y="0"
            width={AB}
            height={B}
            className={[styles.pieceB, styles.movable, step === 2 ? styles.tappable : ''].join(' ')}
            style={{ transform: slid ? `translate(${A + B}px, 0px) rotate(90deg)` : `translate(0px, ${AB}px)` }}
            data-slid={slid}
            {...(step === 2 && {
              role: 'button',
              tabIndex: 0,
              'aria-label': 'Potongan kuning: ketuk untuk memutar dan menggeser',
              onClick: slide,
              onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && slide(),
            })}
          />
          {/* pojok b × b */}
          {step === 0 && <rect x={AB} y={AB} width={B} height={B} className={styles.corner} />}
          {step >= 1 && !slid && <rect x={AB} y={AB} width={B} height={B} className={styles.hole} />}
          {/* garis potong L */}
          {step >= 2 && !slid && <line x1="0" y1={AB} x2={AB} y2={AB} className={styles.cut} />}
          {step === 1 && <line x1="0" y1={AB} x2={AB} y2={AB} className={styles.guide} />}

          {/* label sisi */}
          {!slid ? (
            <>
              <text x={A / 2} y="-8" className={styles.label}>a</text>
              <text x="-14" y={A / 2} className={styles.label}>a</text>
              {step >= 1 && (
                <>
                  <text x={AB + B / 2} y={A + 18} className={styles.labelB}>b</text>
                  <text x={A + 10} y={AB + B / 2 + 5} className={styles.labelB}>b</text>
                </>
              )}
            </>
          ) : (
            <>
              <text x={(A + B) / 2} y="-8" className={styles.label}>{step >= 4 ? 'a + b' : '?'}</text>
              <text x="-26" y={AB / 2 + 5} className={styles.label}>{step >= 5 ? 'a − b' : '?'}</text>
              <text x={A / 2} y={AB + 18} className={styles.labelSmall}>a</text>
              <text x={A + B / 2} y={AB + 18} className={styles.labelSmall}>b</text>
            </>
          )}
        </g>
      </svg>

      <p className={styles.area}>
        Luas:{' '}
        <MathText size="large">{step === 0 ? 'a^2' : step < 5 ? 'a^2 - b^2' : 'a^2 - b^2 = (a + b)(a - b)'}</MathText>
      </p>

      {step === 0 && <Button onClick={() => advance(1, 'Pojok b × b sudah dibuang. Sisanya berbentuk L. Luasnya a² − b².')}>✂️ Potong pojok b × b</Button>}
      {step === 1 && <Button onClick={() => advance(2, 'Sisa L kini jadi dua persegi panjang. Ketuk potongan bawah (kuning) untuk memutar & menggesernya.')}>✂️ Potong sisa L menjadi dua</Button>}
      {step === 2 && (
        <Button onClick={slide} aria-label="Putar dan geser potongan bawah ke kanan">
          ↻ Putar &amp; geser potongan kuning
        </Button>
      )}
      {(step === 3 || step === 4) && (
        <div className={styles.choices} role="group" aria-label={step === 3 ? 'Pilih panjang persegi panjang' : 'Pilih lebar persegi panjang'}>
          <span className={styles.ask}>{step === 3 ? 'Panjang =' : 'Lebar ='}</span>
          {OPTIONS.map((o) => (
            <button key={o} type="button" className={styles.choice} onClick={() => pick(step === 3 ? 'long' : 'wide', o)}>
              <MathText>{o}</MathText>
            </button>
          ))}
        </div>
      )}
      <TataCoach message={msg.text} tone={msg.tone} mood={msg.mood} />
    </div>
  );
}
