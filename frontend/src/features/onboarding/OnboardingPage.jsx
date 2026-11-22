import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ProgressPath from '../../components/ui/ProgressPath.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { moodFor } from '../../components/tata/tataMood.js';
import { sfx } from '../../audio/index.js';
import TileMatchActivity from './TileMatchActivity.jsx';
import { useProfile } from '../../store/profileStore.js';
import copy from '../../content/onboarding.json';
import styles from './OnboardingPage.module.css';

// Onboarding 3 langkah: kenalan TATA → cara belajar → aktivitas ubin.
// Nama panggilan sudah diisi di halaman identitas (features/student), jadi tidak ditanyakan lagi.
// Tidak ada perpindahan otomatis; siswa bisa kembali atau melewati.
export default function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useProfile((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);
  const [tilesDone, setTilesDone] = useState(false);
  const steps = copy.steps;
  const step = steps[index];
  const last = index === steps.length - 1;

  const finish = () => {
    completeOnboarding();
    navigate('/peta');
  };

  // TATA menyapa saat perkenalan dibuka (siswa baru saja menekan tombol, jadi browser mengizinkan suara)
  useEffect(() => {
    if (step.id === 'intro') sfx('tataHello');
  }, [step.id]);

  const tataState = step.id === 'tiles' && tilesDone ? moodFor('correct', { firstTry: true }) : step.tata;

  return (
    <div className={styles.screen}>
      <header className={styles.top}>
        <ProgressPath value={index + 1} max={steps.length} label="Langkah perkenalan" />
        <button type="button" className={styles.skip} onClick={finish}>
          Lewati
        </button>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>{step.title}</h1>

        <div className={styles.guide}>
          <Tata state={tataState} size={step.id === 'tiles' ? 'sm' : 'md'} />
          {step.text && step.id !== 'tiles' && <SpeechBubble tail="left">{step.text}</SpeechBubble>}
        </div>

        {step.points && (
          <ul className={styles.points}>
            {step.points.map((p) => (
              <li key={p.text}>
                <span className={styles.icon} aria-hidden="true">
                  {p.icon}
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        )}

        {step.id === 'tiles' && <TileMatchActivity copy={step} onComplete={() => setTilesDone(true)} />}

      </main>

      <footer className={styles.bottom}>
        <Button variant="secondary" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
          Kembali
        </Button>
        {last ? (
          <Button onClick={finish}>Ke Peta Petualangan</Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)}>{step.id === 'tiles' && !tilesDone ? 'Lewati aktivitas' : 'Lanjut'}</Button>
        )}
      </footer>
    </div>
  );
}
