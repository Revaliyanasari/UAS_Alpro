import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import TataCoach from './TataCoach.jsx';
import { useTask } from './useTask.js';
import { pretty } from '../../components/ui/prettyMath.js';
import styles from './Activities.module.css';

/**
 * Urutan acak yang tetap (tanpa Math.random, agar mudah diuji) dan pasti berbeda dari urutan benar.
 * Ambil indeks ganjil lalu genap, kemudian dibalik: 0..5 → 4, 2, 0, 5, 3, 1.
 */
export function scramble(list) {
  const idx = list.map((_, i) => i);
  if (idx.length < 2) return idx;
  return [...idx.filter((i) => i % 2 === 1), ...idx.filter((i) => i % 2 === 0)].reverse();
}

/**
 * "Jelaskan ke TATA" (LEARNING_DESIGN §4.3): susun kartu langkah yang diacak menjadi urutan benar.
 * Ketuk kartu untuk menaruhnya di urutan berikutnya; ketuk kartu di urutan untuk melepasnya.
 */
export default function OrderScreen({ screen, onDone }) {
  const order = useMemo(() => scramble(screen.steps), [screen.steps]);
  const [chosen, setChosen] = useState([]);
  const task = useTask(screen.hints.length, onDone);

  const check = () => {
    const firstWrong = chosen.findIndex((stepIndex, pos) => stepIndex !== pos);
    if (firstWrong === -1) return task.correct(screen.done);
    setChosen(chosen.slice(0, firstWrong));
    task.wrong(
      firstWrong === 0
        ? 'Langkah pertama belum tepat. Apa yang dikerjakan paling awal?'
        : `${firstWrong} langkah awal sudah tepat. Langkah ke-${firstWrong + 1} belum tepat, jadi kartu sesudahnya dikembalikan.`,
    );
  };

  return (
    <div className={styles.activity}>
      <p className={styles.promptText}>{screen.prompt}</p>
      <ol className={styles.orderList} aria-label="Urutanmu">
        {screen.steps.map((_, pos) => {
          const stepIndex = chosen[pos];
          return (
            <li key={pos}>
              {stepIndex === undefined ? (
                <span className={styles.orderEmpty}>Langkah {pos + 1}</span>
              ) : (
                <button
                  type="button"
                  className={styles.orderCard}
                  onClick={() => setChosen(chosen.filter((_, p) => p !== pos))}
                  disabled={task.solved}
                  aria-label={`Lepas langkah ${pos + 1}: ${screen.steps[stepIndex]}`}
                >
                  {pretty(screen.steps[stepIndex])}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {!task.solved && chosen.length < screen.steps.length && (
        <div className={styles.orderPool} aria-label="Kartu langkah">
          {order
            .filter((i) => !chosen.includes(i))
            .map((i) => (
              <button key={i} type="button" className={styles.orderCard} onClick={() => setChosen([...chosen, i])}>
                {pretty(screen.steps[i])}
              </button>
            ))}
        </div>
      )}
      {!task.solved && (
        <Button onClick={check} disabled={chosen.length < screen.steps.length}>
          Periksa urutan
        </Button>
      )}
      <TataCoach
        message={task.feedback.text}
        tone={task.feedback.tone}
        hints={task.solved ? [] : screen.hints}
        hintLevel={task.hintLevel}
        onHint={task.nextHint}
      />
      {task.canShowSolution && (
        <button
          type="button"
          className={styles.solutionBtn}
          onClick={() => {
            setChosen(screen.steps.map((_, i) => i));
            task.revealSolution();
          }}
        >
          Lihat pembahasan
        </button>
      )}
    </div>
  );
}
