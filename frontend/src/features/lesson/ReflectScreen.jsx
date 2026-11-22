import { useState } from 'react';
import TataCoach from './TataCoach.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import { moodFor } from '../../components/tata/tataMood.js';
import styles from './lesson.module.css';
import act from './Activities.module.css';

/**
 * Refleksi (RMT — elemen ketiga Learning Activity, Bab 3 §4; metakognisi, Bab 5 §4).
 * Siswa memilih pernyataan tentang strateginya sendiri; TATA menanggapi setiap pilihan (mediasi),
 * tanpa nilai benar/salah. Pilihan yang kurang tepat dijawab dengan ajakan, lalu siswa boleh memilih lagi.
 * Selesai bila setiap pertanyaan dijawab dengan pilihan yang mencerminkan strategi yang baik.
 */
export default function ReflectScreen({ screen, onDone }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const q = screen.questions[step];

  const choose = (opt) => {
    setPicked(opt);
    if (!opt.good) return;
    if (step === screen.questions.length - 1) {
      setDone(true);
      onDone({ firstTry: true });
    }
  };

  const message = picked ? picked.feedback : 'Tidak ada jawaban salah di sini. Pilih yang paling sesuai dengan caramu berpikir.';
  const mood = picked ? (picked.good ? moodFor('correct', { firstTry: false }) : moodFor('wrong', { attempt: 2 })) : moodFor('explain');

  return (
    <div className={styles.screenBody}>
      <p className={act.promptText}>
        {step + 1}/{screen.questions.length} · {pretty(q.prompt)}
      </p>
      <div className={styles.options} role="group" aria-label="Pilihan refleksi">
        {q.options.map((opt) => (
          <button
            key={opt.text}
            type="button"
            className={[styles.option, styles.optionText, picked === opt ? styles.optionPicked : ''].join(' ')}
            onClick={() => choose(opt)}
            disabled={done || (picked?.good && picked !== opt)}
            aria-pressed={picked === opt}
          >
            {pretty(opt.text)}
          </button>
        ))}
      </div>
      <TataCoach message={message} tone={picked ? (picked.good ? 'happy' : 'confused') : 'neutral'} mood={mood} />
      {picked?.good && !done && (
        <button
          type="button"
          className={styles.solutionBtn}
          onClick={() => {
            setStep(step + 1);
            setPicked(null);
          }}
        >
          Pertanyaan berikutnya
        </button>
      )}
    </div>
  );
}
