import MathText from '../../components/ui/MathText.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import TataCoach from './TataCoach.jsx';
import StoryCard from './StoryCard.jsx';
import { useTask } from './useTask.js';
import { lessonCopy } from '../../content/lessons/index.js';
import styles from './lesson.module.css';

/** Soal pilihan. Jawaban salah → arahan + petunjuk; jawaban benar tidak pernah ditampilkan lebih dulu. */
export default function ChoiceScreen({ screen, onDone }) {
  const task = useTask(screen.hints.length, onDone);
  const choose = (opt) => {
    if (task.solved) return;
    if (opt === screen.answer) task.correct(screen.explain ?? lessonCopy.correct);
    else task.wrong('Belum tepat. Coba pikirkan lagi, atau minta petunjuk.');
  };

  return (
    <div className={styles.screenBody}>
      <StoryCard story={screen.story} known={screen.known} asked={screen.asked} />
      <p className={styles.prompt}>{pretty(screen.prompt)}</p>
      <div className={styles.options}>
        {screen.options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={[styles.option, task.solved && opt === screen.answer ? styles.optionRight : ''].join(' ')}
            onClick={() => choose(opt)}
            disabled={task.solved}
          >
            {/^[A-Z]/.test(opt) ? opt : <MathText size="large">{opt}</MathText>}
          </button>
        ))}
      </div>
      <TataCoach
        message={task.feedback.text}
        tone={task.feedback.tone}
        hints={task.solved ? [] : screen.hints}
        hintLevel={task.hintLevel}
        onHint={task.nextHint}
      />
      {task.canShowSolution && (
        <button type="button" className={styles.solutionBtn} onClick={task.revealSolution}>
          Lihat pembahasan
        </button>
      )}
    </div>
  );
}
