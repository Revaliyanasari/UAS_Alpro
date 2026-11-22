import { useState } from 'react';
import MathKeypad from '../../components/ui/MathKeypad.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import TataCoach from './TataCoach.jsx';
import { useTask } from './useTask.js';
import StoryCard from './StoryCard.jsx';
import { runCheck } from './runCheck.js';
import { feedbackFor } from '../../content/feedback.js';
import styles from './lesson.module.css';

/** Soal isian dengan papan ketik matematika, diperiksa mesin aljabar (umpan balik M1–M11). */
export default function InputScreen({ screen, onDone }) {
  const [value, setValue] = useState('');
  const task = useTask(screen.hints.length, onDone);
  const [showSolution, setShowSolution] = useState(false);

  const submit = () => {
    const r = runCheck(screen.check, value);
    const fb = feedbackFor(r);
    if (r.status === 'correct') task.correct(fb.text);
    else task.wrong(fb.text);
  };

  return (
    <div className={styles.screenBody}>
      <StoryCard story={screen.story} known={screen.known} asked={screen.asked} />
      <p className={styles.prompt}>{pretty(screen.prompt)}</p>
      <MathKeypad value={value} onChange={setValue} onSubmit={submit} disabled={task.solved} />
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
            setShowSolution(true);
            task.revealSolution();
          }}
        >
          Lihat pembahasan
        </button>
      )}
      {(showSolution || task.solved) && (
        <ol className={styles.steps} aria-label="Pembahasan">
          {screen.solution.map((s) => (
            <li key={s}>{pretty(s)}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
