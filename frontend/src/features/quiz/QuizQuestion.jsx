import { useState } from 'react';
import MathText from '../../components/ui/MathText.jsx';
import MathKeypad from '../../components/ui/MathKeypad.jsx';
import Button from '../../components/ui/Button.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import TataCoach from '../lesson/TataCoach.jsx';
import StoryCard from '../lesson/StoryCard.jsx';
import SortBoard from '../lesson/SortBoard.jsx';
import TilesScreen from '../lesson/TilesScreen.jsx';
import { gradeChoice, gradeInput, gradeSort } from './quizLogic.js';
import lessonStyles from '../lesson/lesson.module.css';

const SUBMIT = 'Kirim jawaban';

/**
 * Satu soal kuis. Aturan kuis (LEARNING_DESIGN §3): hanya petunjuk tingkat 1–2 (tanpa tingkat 3),
 * jawaban pertama yang dikirim yang dinilai, pembahasan lengkap ditampilkan di akhir kuis.
 * onAnswer({ correct, given }) dipanggil sekali.
 */
export default function QuizQuestion({ question, onAnswer }) {
  const [hintLevel, setHintLevel] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [note, setNote] = useState('');
  const [choice, setChoice] = useState(null);
  const [value, setValue] = useState('');
  const [placement, setPlacement] = useState(() => (question.items ? question.items.map(() => null) : []));

  const finish = (result) => {
    if (answered) return;
    setAnswered(result);
    onAnswer({ correct: result.correct, given: result.given });
  };

  const submit = () => {
    let r;
    if (question.type === 'choice') r = gradeChoice(question, choice);
    else if (question.type === 'input') r = gradeInput(question, value);
    else r = gradeSort(question, placement);
    if (r.invalid) return setNote(r.text);
    setNote('');
    finish(r);
  };

  const hints = question.hints ?? [];
  const message = answered
    ? answered.correct
      ? 'Benar! Lanjut ke soal berikutnya.'
      : `${answered.text ?? 'Belum tepat.'} Pembahasannya ada di akhir kuis.`
    : note;
  const tone = answered ? (answered.correct ? 'happy' : 'confused') : note ? 'confused' : 'neutral';

  return (
    <div className={lessonStyles.screenBody}>
      <StoryCard story={question.story} known={question.known} asked={question.asked} />
      <p className={lessonStyles.prompt}>{pretty(question.prompt)}</p>

      {question.type === 'choice' && (
        <div className={lessonStyles.options} role="radiogroup" aria-label="Pilihan jawaban">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={choice === opt}
              className={[lessonStyles.option, choice === opt ? lessonStyles.optionPicked : ''].join(' ')}
              onClick={() => setChoice(opt)}
              disabled={Boolean(answered)}
            >
              {/^[A-Z]/.test(opt) ? opt : <MathText size="large">{opt}</MathText>}
            </button>
          ))}
        </div>
      )}
      {question.type === 'choice' && !answered && (
        <Button onClick={submit} disabled={choice === null}>
          {SUBMIT}
        </Button>
      )}

      {question.type === 'input' && (
        <MathKeypad value={value} onChange={setValue} onSubmit={submit} submitLabel={SUBMIT} disabled={Boolean(answered)} />
      )}

      {question.type === 'sort' && (
        <>
          <SortBoard items={question.items} bins={question.bins} placement={placement} onChange={setPlacement} locked={Boolean(answered)} />
          {!answered && <Button onClick={submit}>{SUBMIT}</Button>}
        </>
      )}

      {question.type === 'tiles' && (
        <TilesScreen
          screen={question}
          onDone={() => {}}
          onCheck={(ok) => finish({ correct: ok, given: ok ? 'Susunan pertama benar' : 'Susunan pertama belum tepat' })}
        />
      )}

      {question.type !== 'tiles' && (
        <TataCoach message={message} tone={tone} hints={answered ? [] : hints} hintLevel={hintLevel} onHint={() => setHintLevel((h) => Math.min(h + 1, hints.length))} />
      )}
      {question.type === 'tiles' && answered && (
        <p className={lessonStyles.text} role="status">
          {answered.correct ? 'Benar! Susunan pertamamu tepat.' : 'Susunan pertama belum tepat. Kamu boleh terus mencoba, tapi nilainya dari percobaan pertama.'}
        </p>
      )}
    </div>
  );
}
