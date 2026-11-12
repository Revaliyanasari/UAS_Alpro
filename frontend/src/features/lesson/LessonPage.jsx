import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ProgressPath from '../../components/ui/ProgressPath.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import Tata from '../../components/tata/Tata.jsx';
import InfoScreen from './InfoScreen.jsx';
import ChoiceScreen from './ChoiceScreen.jsx';
import InputScreen from './InputScreen.jsx';
import DividerScreen from './DividerScreen.jsx';
import TilesScreen from './TilesScreen.jsx';
import BoardScreen from './BoardScreen.jsx';
import NotFoundPage from '../home/NotFoundPage.jsx';
import { lessons, lessonCopy } from '../../content/lessons/index.js';
import worldsContent from '../../content/worlds.json';
import { useProfile } from '../../store/profileStore.js';
import { useHydrated } from '../../hooks/useHydrated.js';
import styles from './lesson.module.css';

const SCREENS = { info: InfoScreen, example: InfoScreen, choice: ChoiceScreen, input: InputScreen, divider: DividerScreen, tiles: TilesScreen, board: BoardScreen };
const XP_PER_TASK = 10;

/** Bintang dari proporsi soal yang benar pada percobaan pertama tanpa petunjuk (petunjuk tidak mengurangi XP). */
export function starsFor(results) {
  const tasks = Object.values(results).filter((r) => r.graded);
  if (tasks.length === 0) return 3;
  const ratio = tasks.filter((r) => r.firstTry).length / tasks.length;
  return ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
}

export default function LessonPage() {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const lesson = lessons[worldId];
  const world = worldsContent.worlds.find((w) => String(w.id) === worldId);
  const { isUnlocked, completeWorld } = useProfile();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});
  const [finished, setFinished] = useState(null);
  const hydrated = useHydrated(useProfile);

  if (!hydrated) return null; // tunggu progres dibaca dari perangkat
  if (!lesson || !world || !isUnlocked(world.id)) return <NotFoundPage />;

  const screens = lesson.screens;
  const screen = screens[index];
  const passive = screen.type === 'info';
  const canNext = passive || Boolean(results[index]);
  const Screen = SCREENS[screen.type];

  const handleDone = (r) => setResults((prev) => (prev[index] ? prev : { ...prev, [index]: { ...r, graded: screen.type !== 'example' } }));

  const next = () => {
    if (index < screens.length - 1) return setIndex(index + 1);
    const stars = starsFor(results);
    const xp = Object.values(results).filter((r) => r.graded).length * XP_PER_TASK;
    completeWorld(world.id, stars, xp);
    setFinished({ stars, xp });
  };

  if (finished) {
    return (
      <main className={styles.finish}>
        <Tata state="celebrating" size="md" />
        <h1>{lessonCopy.finishTitle}</h1>
        <p className={styles.stars} aria-label={`${finished.stars} bintang`}>
          {'⭐'.repeat(finished.stars)}
          <span className={styles.dim}>{'⭐'.repeat(3 - finished.stars)}</span>
        </p>
        <SpeechBubble tone="happy">{lessonCopy.finishText.replace('{world}', world.name)}</SpeechBubble>
        <p>+{finished.xp} XP</p>
        <Button block onClick={() => navigate('/peta')}>
          Kembali ke peta
        </Button>
      </main>
    );
  }

  return (
    <div className={styles.lesson}>
      <header className={styles.top}>
        <button type="button" className={styles.close} onClick={() => navigate('/peta')} aria-label="Keluar ke peta">
          ✕
        </button>
        <ProgressPath value={index + 1} max={screens.length} label={`Langkah pelajaran ${world.name}`} />
      </header>
      <main className={styles.main}>
        <h1 className={styles.title}>{screen.title}</h1>
        {screen.type === 'info' && screen.tata && (
          <div className={styles.introTata}>
            <Tata state={screen.tata} size="md" />
          </div>
        )}
        <Screen key={index} screen={screen} onDone={handleDone} />
      </main>
      <footer className={styles.bottom}>
        <Button variant="secondary" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          Kembali
        </Button>
        <Button onClick={next} disabled={!canNext}>
          {index === screens.length - 1 ? 'Selesai' : 'Lanjut'}
        </Button>
      </footer>
    </div>
  );
}
