import { useState } from 'react';

/**
 * Status satu soal: petunjuk bertahap + aturan kapan pembahasan boleh dibuka
 * (setelah petunjuk ke-3 DAN satu percobaan lagi — docs/LEARNING_DESIGN.md §5.1).
 */
export function useTask(hintCount, onDone) {
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongAfterHints, setWrongAfterHints] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', tone: 'neutral' });

  return {
    hintLevel,
    solved,
    feedback,
    canShowSolution: !solved && hintLevel >= hintCount && wrongAfterHints >= 1,
    nextHint: () => setHintLevel((h) => Math.min(h + 1, hintCount)),
    correct: (text) => {
      setSolved(true);
      setFeedback({ text, tone: 'happy' });
      onDone({ firstTry: attempts === 0 && hintLevel === 0 });
    },
    wrong: (text) => {
      setAttempts((a) => a + 1);
      if (hintLevel >= hintCount) setWrongAfterHints((w) => w + 1);
      setFeedback({ text, tone: 'confused' });
    },
    revealSolution: () => {
      setSolved(true);
      setFeedback({ text: 'Ini pembahasannya. Pelajari langkahnya, ya.', tone: 'neutral' });
      onDone({ firstTry: false });
    },
  };
}
