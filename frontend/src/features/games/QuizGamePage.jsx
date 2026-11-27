import { useEffect, useRef, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import MathText from '../../components/ui/MathText.jsx';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import { moodFor } from '../../components/tata/tataMood.js';
import { sfx, sayTata } from '../../audio/index.js';
import RewardBurst from '../../components/reward/RewardBurst.jsx';
import { useProfile } from '../../store/profileStore.js';
import { makeQuestion } from './questionBank.js';
import styles from './Games.module.css';

const MODES = {
  // Cepat Tepat: 60 detik, umpan balik singkat lalu soal berikutnya otomatis (khas game waktu).
  'cepat-tepat': { title: 'Tantangan Cepat Tepat', icon: 'bolt', seconds: 60, count: Infinity, xpPer: 2, xpMax: 20 },
  // Latihan: 10 soal, tanpa waktu, pembahasan setiap soal, siswa menekan "Soal berikutnya" sendiri.
  latihan: { title: 'Latihan Soal Interaktif', icon: 'play', seconds: 0, count: 10, xpPer: 1, xpMax: 10 },
};

function Option({ opt, state, onPick, disabled }) {
  return (
    <button type="button" className={[styles.opt, state ? styles[state] : ''].join(' ')} onClick={() => onPick(opt)} disabled={disabled}>
      <MathText size="large">{opt}</MathText>
    </button>
  );
}

/** Mesin game pilihan ganda untuk mode "cepat-tepat" dan "latihan". */
export default function QuizGamePage({ mode }) {
  const cfg = MODES[mode];
  const recordGame = useProfile((s) => s.recordGame);
  const best = useProfile((s) => s.games?.[mode]?.best ?? 0);
  const [phase, setPhase] = useState('ready'); // ready → play → done
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);
  const [left, setLeft] = useState(cfg.seconds);
  const [mistakes, setMistakes] = useState([]);
  const [result, setResult] = useState(null);
  const timer = useRef(null);
  const advance = useRef(null);

  useEffect(() => () => {
    clearInterval(timer.current);
    clearTimeout(advance.current);
  }, []);

  const finish = (finalScore, total) => {
    clearInterval(timer.current);
    clearTimeout(advance.current);
    const xp = Math.min(cfg.xpMax, finalScore * cfg.xpPer);
    recordGame(mode, finalScore, total, xp);
    setResult({ score: finalScore, total, xp, newBest: finalScore > best });
    setPhase('done');
    sfx(finalScore > 0 ? 'victory' : 'tataSoft');
    // Saat bermain TATA diam (tidak mengganggu waktu); komentar hanya di akhir.
    setTimeout(() => sayTata(finalScore > 0 ? 'reward' : 'tryAgainResult', { force: true }), finalScore > 0 ? 1800 : 700);
  };

  const start = () => {
    setScore(0);
    setAsked(1);
    setMistakes([]);
    setPicked(null);
    setQ(makeQuestion());
    setPhase('play');
    if (cfg.seconds) {
      setLeft(cfg.seconds);
      timer.current = setInterval(() => setLeft((s) => s - 1), 1000);
    }
  };

  // waktu habis → selesai (dengan skor terakhir). Tanpa daftar dependensi: diperiksa setiap render.
  useEffect(() => {
    if (phase === 'play' && cfg.seconds && left <= 0) finish(score, asked - (picked ? 0 : 1));
  });

  const nextQuestion = () => {
    if (asked >= cfg.count) return finish(score, asked);
    setAsked((n) => n + 1);
    setPicked(null);
    setQ(makeQuestion());
  };

  const pickOpt = (opt) => {
    if (picked) return;
    setPicked(opt);
    const ok = opt === q.answer;
    if (ok) setScore((s) => s + 1);
    else setMistakes((m) => [...m, q]);
    sfx(ok ? 'correct' : 'tryAgain');
    if (cfg.seconds) advance.current = setTimeout(nextQuestion, ok ? 550 : 1300);
  };

  if (phase === 'ready') {
    return (
      <AppLayout title={cfg.title} icon={cfg.icon}>
        <section className={styles.ready}>
          <Tata state="idea" size="md" />
          <h2>{cfg.title}</h2>
          <p>{cfg.seconds ? `Jawab soal sebanyak-banyaknya dalam ${cfg.seconds} detik. Soal acak dari materi World 1–3.` : `${cfg.count} soal tanpa batas waktu. Setelah menjawab, baca pembahasannya.`}</p>
          {best > 0 && <p className={styles.record}>Rekor terbaikmu: {best}</p>}
          <Button onClick={start}>▶ Mulai</Button>
        </section>
      </AppLayout>
    );
  }

  if (phase === 'done') {
    return (
      <AppLayout title={cfg.title} icon={cfg.icon}>
        <section className={styles.ready} aria-live="polite">
          <Tata state={result.score >= 8 ? 'proud' : 'love'} size="md" />
          <h2>Skor: {result.score}{cfg.seconds ? '' : ` / ${result.total}`}</h2>
          <RewardBurst xp={result.xp} showStars={false} />
          <SpeechBubble tone="happy">
            {result.newBest ? 'Rekor baru! ' : ''}+{result.xp} XP. {result.score >= 8 ? 'Luar biasa!' : 'Bagus, terus berlatih ya!'}
          </SpeechBubble>
          {mistakes.length > 0 && (
            <details className={styles.review}>
              <summary>Pembahasan soal yang belum tepat ({mistakes.length})</summary>
              <ol>
                {mistakes.slice(0, 10).map((m, i) => (
                  <li key={i}>
                    {pretty(m.prompt)} <strong>Jawaban: <MathText>{m.answer}</MathText></strong>
                    <br />
                    <small>{pretty(m.explain)}</small>
                  </li>
                ))}
              </ol>
            </details>
          )}
          <div className={styles.row}>
            <Button onClick={start}>Main lagi</Button>
            <Button variant="secondary" to="/game">
              Pilih game lain
            </Button>
          </div>
        </section>
      </AppLayout>
    );
  }

  const ok = picked && picked === q.answer;
  return (
    <AppLayout title={cfg.title} icon={cfg.icon}>
      <div className={styles.hud} aria-live="polite">
        <span>
          Skor <strong>{score}</strong>
        </span>
        <span>{cfg.seconds ? <>⏱ <strong>{Math.max(0, left)}</strong> dtk</> : <>Soal <strong>{asked}</strong>/{cfg.count}</>}</span>
      </div>
      {cfg.seconds > 0 && (
        <span className={styles.timeBar} aria-hidden="true">
          <span style={{ width: `${(Math.max(0, left) / cfg.seconds) * 100}%` }} />
        </span>
      )}
      <section className={styles.question}>
        <span className={styles.topic}>{q.topic}</span>
        <p className={styles.prompt}>{pretty(q.prompt)}</p>
        <div className={styles.opts}>
          {q.options.map((o) => (
            <Option key={o} opt={o} onPick={pickOpt} disabled={Boolean(picked)} state={picked ? (o === q.answer ? 'right' : o === picked ? 'wrong' : '') : ''} />
          ))}
        </div>
        {picked && (
          <div className={styles.feedback}>
            <span className={styles.fbTata}>
              <Tata state={moodFor(ok ? 'correct' : 'wrong', { firstTry: true, attempt: 1 })} size="sm" />
            </span>
            <p>
              <strong>{ok ? 'Tepat!' : 'Belum tepat.'}</strong> {!cfg.seconds || !ok ? pretty(q.explain) : ''}
            </p>
          </div>
        )}
        {picked && !cfg.seconds && (
          <Button onClick={nextQuestion}>{asked >= cfg.count ? 'Lihat skor' : 'Soal berikutnya'}</Button>
        )}
      </section>
    </AppLayout>
  );
}
