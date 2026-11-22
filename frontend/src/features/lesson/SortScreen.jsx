import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import SortBoard from './SortBoard.jsx';
import TataCoach from './TataCoach.jsx';
import { useTask } from './useTask.js';
import styles from './lesson.module.css';

/**
 * Aktivitas sortir/kelompokkan (World 1): mis. kelompokkan suku sejenis, sortir menurut koefisien.
 * Kartu yang salah tempat dikembalikan ke nampan (jawaban benar tidak ditampilkan lebih dulu).
 */
export default function SortScreen({ screen, onDone }) {
  const [placement, setPlacement] = useState(() => screen.items.map(() => null));
  const task = useTask(screen.hints.length, onDone);

  const check = () => {
    if (placement.some((p) => p === null)) return task.wrong('Masih ada kartu di nampan. Pasang semuanya, ya.', { incomplete: true });
    const wrong = screen.items.filter((it, i) => placement[i] !== it.bin).length;
    if (wrong === 0) return task.correct(screen.done);
    setPlacement(placement.map((p, i) => (p === screen.items[i].bin ? p : null)));
    task.wrong(`${screen.items.length - wrong} kartu sudah tepat. ${wrong} kartu kembali ke nampan — coba lagi.`);
  };

  return (
    <div className={styles.screenBody}>
      <p className={styles.prompt}>{screen.prompt}</p>
      <SortBoard items={screen.items} bins={screen.bins} placement={placement} onChange={setPlacement} locked={task.solved} />
      {!task.solved && <Button onClick={check}>Periksa</Button>}
      <TataCoach
        message={task.feedback.text}
        tone={task.feedback.tone}
        mood={task.feedback.mood}
        hints={task.solved ? [] : screen.hints}
        hintLevel={task.hintLevel}
        onHint={task.nextHint}
      />
      {task.canShowSolution && (
        <button
          type="button"
          className={styles.solutionBtn}
          onClick={() => {
            setPlacement(screen.items.map((it) => it.bin));
            task.revealSolution();
          }}
        >
          Lihat pembahasan
        </button>
      )}
    </div>
  );
}
