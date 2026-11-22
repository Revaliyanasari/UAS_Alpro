import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ProgressPath from '../../components/ui/ProgressPath.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import MathText from '../../components/ui/MathText.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import NotFoundPage from '../home/NotFoundPage.jsx';
import QuizQuestion from './QuizQuestion.jsx';
import { pickQuestions, keyOf, summarize, XP_PER_CORRECT } from './quizLogic.js';
import { quizzes, quizCopy } from '../../content/quizzes/index.js';
import worldsContent from '../../content/worlds.json';
import { useProfile, PASS_PERCENT } from '../../store/profileStore.js';
import { useHydrated } from '../../hooks/useHydrated.js';
import lessonStyles from '../lesson/lesson.module.css';
import styles from './QuizPage.module.css';

/**
 * Kuis Dunia (fase 8) + Pembahasan (fase 9) — docs/LEARNING_DESIGN.md §3.
 * 5 soal (varian acak), nilai ≥ 60% membuka pulau berikutnya, bintang dari nilai.
 */
export default function QuizPage() {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const quiz = quizzes[worldId];
  const world = worldsContent.worlds.find((w) => String(w.id) === worldId);
  const { isUnlocked, canTakeQuiz, recordQuiz } = useProfile();
  const hydrated = useHydrated(useProfile);

  const [questions, setQuestions] = useState(() => (quiz ? pickQuestions(quiz) : []));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  if (!hydrated) return null;
  if (!quiz || !world || !isUnlocked(world.id)) return <NotFoundPage />;

  if (!canTakeQuiz(world.id)) {
    return (
      <main className={lessonStyles.finish}>
        <Tata state="talking" size="md" />
        <SpeechBubble>{quizCopy.lockedText}</SpeechBubble>
        <Button block to={`/belajar/${world.id}`}>
          Masuk ke {world.name}
        </Button>
        <Button variant="secondary" block onClick={() => navigate('/peta')}>
          Kembali ke peta
        </Button>
      </main>
    );
  }

  const restart = () => {
    setQuestions(pickQuestions(quiz));
    setIndex(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    const next = worldsContent.worlds.find((w) => w.id === world.id + 1);
    return (
      <main className={styles.result}>
        <div className={styles.resultHead}>
          <Tata state={result.passed ? 'celebrating' : 'talking'} size="md" />
          <h1>{quiz.title}</h1>
          <p className={styles.score} aria-label={`Nilai ${result.percent}`}>
            {result.percent}
          </p>
          <p className={lessonStyles.stars} aria-label={`${result.stars} bintang`}>
            {'⭐'.repeat(result.stars)}
            <span className={lessonStyles.dim}>{'⭐'.repeat(3 - result.stars)}</span>
          </p>
          <p>
            Benar {result.correct} dari {result.total} soal · +{result.correct * XP_PER_CORRECT} XP
          </p>
          <SpeechBubble tone={result.passed ? 'happy' : 'neutral'}>
            {result.passed
              ? next
                ? quizCopy.passText.replace('{next}', next.name)
                : quizCopy.passLast
              : quizCopy.failText.replace('{pass}', PASS_PERCENT)}
          </SpeechBubble>
        </div>

        <section aria-labelledby="review-title" className={styles.review}>
          <h2 id="review-title">📝 Pembahasan</h2>
          <ol className={styles.reviewList}>
            {questions.map((q, i) => {
              const a = answers[i];
              const key = keyOf(q);
              return (
                <li key={i} className={a.correct ? styles.right : styles.wrong}>
                  <p className={styles.reviewPrompt}>
                    <strong>
                      {i + 1}. {a.correct ? '✔ Benar' : '✘ Belum tepat'}
                    </strong>
                    <br />
                    {q.story && <span className={styles.reviewStory}>{pretty(q.story)} </span>}
                    {pretty(q.prompt)}
                  </p>
                  <p className={styles.reviewLine}>
                    Jawabanmu: {q.type === 'input' ? <MathText>{a.given}</MathText> : pretty(a.given)}
                  </p>
                  {key && (
                    <p className={styles.reviewLine}>
                      Jawaban benar: {/^[A-Z]/.test(key) ? key : <MathText>{key}</MathText>}
                    </p>
                  )}
                  <ol className={lessonStyles.steps} aria-label={`Pembahasan soal ${i + 1}`}>
                    {q.solution.map((s) => (
                      <li key={s}>{pretty(s)}</li>
                    ))}
                  </ol>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.summary} aria-labelledby="summary-title">
          <h2 id="summary-title">💡 {quiz.summary.title}</h2>
          <ol>
            {quiz.summary.steps.map((s) => (
              <li key={s}>{pretty(s)}</li>
            ))}
          </ol>
        </section>

        <div className={styles.actions}>
          <Button block onClick={restart}>
            Ulangi kuis (soal varian)
          </Button>
          {!result.passed && (
            <Button variant="secondary" block to={`/belajar/${world.id}`}>
              Pelajari lagi {world.name}
            </Button>
          )}
          <Button variant="secondary" block onClick={() => navigate('/peta')}>
            Kembali ke peta
          </Button>
        </div>
      </main>
    );
  }

  const question = questions[index];
  const answered = answers.length > index;
  const last = index === questions.length - 1;

  const goNext = () => {
    if (!last) return setIndex(index + 1);
    const { correct, total } = summarize(answers);
    const r = recordQuiz(world.id, correct, total, correct * XP_PER_CORRECT);
    setResult({ ...r, correct, total });
  };

  return (
    <div className={lessonStyles.lesson}>
      <header className={lessonStyles.top}>
        <button type="button" className={lessonStyles.close} onClick={() => navigate('/peta')} aria-label="Keluar ke peta">
          ✕
        </button>
        <ProgressPath value={index + 1} max={questions.length} label={`Soal kuis ${world.name}`} />
      </header>
      <main className={lessonStyles.main}>
        <h1 className={lessonStyles.title}>
          🏁 Soal {index + 1} dari {questions.length}
        </h1>
        <QuizQuestion key={index} question={question} onAnswer={(a) => setAnswers((prev) => (prev.length > index ? prev : [...prev, a]))} />
      </main>
      <footer className={styles.footer}>
        <Button block onClick={goNext} disabled={!answered}>
          {last ? 'Lihat hasil' : 'Soal berikutnya'}
        </Button>
      </footer>
    </div>
  );
}
