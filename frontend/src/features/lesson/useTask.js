import { useState } from 'react';
import { moodFor } from '../../components/tata/tataMood.js';

/**
 * Status satu soal: petunjuk bertahap + aturan kapan pembahasan boleh dibuka
 * (setelah petunjuk ke-3 DAN satu percobaan lagi — docs/LEARNING_DESIGN.md §5.1).
 * feedback.mood = ekspresi TATA yang sesuai situasi (components/tata/tataMood.js).
 */
export function useTask(hintCount, onDone) {
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongAfterHints, setWrongAfterHints] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', tone: 'neutral', mood: undefined });

  return {
    hintLevel,
    attempts,
    solved,
    feedback,
    canShowSolution: !solved && hintLevel >= hintCount && wrongAfterHints >= 1,
    nextHint: () => {
      setHintLevel((h) => Math.min(h + 1, hintCount));
      setFeedback((f) => ({ ...f, mood: moodFor('hint') }));
    },
    correct: (text) => {
      const firstTry = attempts === 0 && hintLevel === 0;
      setSolved(true);
      setFeedback({ text, tone: 'happy', mood: moodFor('correct', { firstTry }) });
      onDone({ firstTry });
    },
    /** opts.incomplete: jawaban belum lengkap (mis. kartu belum dipasang) → TATA kaget, bukan "salah". */
    wrong: (text, opts = {}) => {
      const attempt = attempts + 1;
      setAttempts(attempt);
      if (hintLevel >= hintCount) setWrongAfterHints((w) => w + 1);
      setFeedback({ text, tone: 'confused', mood: opts.incomplete ? moodFor('incomplete') : moodFor('wrong', { attempt }) });
    },
    revealSolution: () => {
      setSolved(true);
      setFeedback({ text: 'Ini pembahasannya. Pelajari langkahnya, ya.', tone: 'neutral', mood: moodFor('solution') });
      onDone({ firstTry: false });
    },
  };
}
