import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ProgressPath from '../../components/ui/ProgressPath.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { moodFor } from '../../components/tata/tataMood.js';
import InfoScreen from './InfoScreen.jsx';
import ChoiceScreen from './ChoiceScreen.jsx';
import InputScreen from './InputScreen.jsx';
import DividerScreen from './DividerScreen.jsx';
import TilesScreen from './TilesScreen.jsx';
import BoardScreen from './BoardScreen.jsx';
import SortScreen from './SortScreen.jsx';
import FactorPairsScreen from './FactorPairsScreen.jsx';
import CommonFactorsScreen from './CommonFactorsScreen.jsx';
import OrderScreen from './OrderScreen.jsx';
import FadedScreen from './FadedScreen.jsx';
import ReflectScreen from './ReflectScreen.jsx';
import CutSlideScreen from './CutSlideScreen.jsx';
import { phaseOf, phaseInfo } from './rmt.js';
import AskTata from '../ai/AskTata.jsx';
import AudioButton from '../../audio/AudioButton.jsx';
import MenuButton from '../../components/layout/MenuButton.jsx';
import { sfx, sayTata, useTataSays } from '../../audio/index.js';
import NotFoundPage from '../home/NotFoundPage.jsx';
import { lessons, lessonCopy } from '../../content/lessons/index.js';
import worldsContent from '../../content/worlds.json';
import { useProfile } from '../../store/profileStore.js';
import { useHydrated } from '../../hooks/useHydrated.js';
import RewardBurst from '../../components/reward/RewardBurst.jsx';
import WorldArt from '../../components/art/WorldArt.jsx';
import styles from './lesson.module.css';

const SCREENS = {
  info: InfoScreen,
  example: InfoScreen,
  choice: ChoiceScreen,
  input: InputScreen,
  divider: DividerScreen,
  tiles: TilesScreen,
  board: BoardScreen,
  sort: SortScreen,
  factorPairs: FactorPairsScreen,
  commonFactors: CommonFactorsScreen,
  order: OrderScreen,
  faded: FadedScreen,
  identify: SortScreen,
  reflect: ReflectScreen,
  cutSlide: CutSlideScreen,
};
// Layar yang tidak dinilai (contoh & refleksi) tetap harus diselesaikan sebelum Lanjut.
const UNGRADED = new Set(['example', 'reflect']);
const XP_PER_TASK = 10;

export default function LessonPage() {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const lesson = lessons[worldId];
  const world = worldsContent.worlds.find((w) => String(w.id) === worldId);
  const { isUnlocked, completeLesson, saveLessonPos, clearLessonPos } = useProfile();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});
  const [finished, setFinished] = useState(null);
  const [resumedAt, setResumedAt] = useState(null); // langkah tempat siswa melanjutkan (untuk pemberitahuan)
  const [restored, setRestored] = useState(false);
  const hydrated = useHydrated(useProfile);

  // Lanjutkan dari langkah terakhir yang tersimpan (per siswa, per pulau) setelah progres dibaca.
  useEffect(() => {
    if (!hydrated || restored || !lesson) return;
    const save = useProfile.getState().lessonSaves?.[worldId];
    if (save && save.index > 0 && save.index < lesson.screens.length) {
      setIndex(save.index);
      setResults(save.results ?? {});
      setResumedAt(save.index + 1);
    }
    setRestored(true);
  }, [hydrated, restored, lesson, worldId]);

  // Simpan posisi setiap kali berpindah langkah / menyelesaikan tugas.
  useEffect(() => {
    if (restored && !finished && lesson && (index > 0 || Object.keys(results).length > 0)) saveLessonPos(worldId, index, results);
  }, [restored, finished, lesson, worldId, index, results, saveLessonPos]);

  const restart = () => {
    clearLessonPos(worldId);
    setIndex(0);
    setResults({});
    setResumedAt(null);
  };
  useTataSays('lessonStart', hydrated && Boolean(lesson) && !finished);

  if (!hydrated) return null; // tunggu progres dibaca dari perangkat
  if (!lesson || !world || !isUnlocked(world.id)) return <NotFoundPage />;

  const screens = lesson.screens;
  const screen = screens[index];
  const passive = screen.type === 'info';
  const canNext = passive || Boolean(results[index]);
  const Screen = SCREENS[screen.type];
  const phase = phaseInfo(phaseOf(screen));

  const handleDone = (r) => setResults((prev) => (prev[index] ? prev : { ...prev, [index]: { ...r, graded: !UNGRADED.has(screen.type) } }));

  const next = () => {
    setResumedAt(null);
    if (index < screens.length - 1) return setIndex(index + 1);
    // XP untuk setiap langkah belajar yang diselesaikan (petunjuk tidak mengurangi XP).
    const xp = Object.values(results).filter((r) => r.graded).length * XP_PER_TASK;
    completeLesson(world.id, xp);
    setFinished({ xp });
    // Misi selesai: lagu kemenangan singkat, lalu bunyi XP
    sfx('victory');
    setTimeout(() => sfx('xp'), 1300);
    setTimeout(() => sayTata('reward', { force: true }), 1900);
  };

  if (finished) {
    return (
      <main className={styles.finish}>
        <Tata state={moodFor('lessonDone')} size="md" />
        <h1>{lessonCopy.finishTitle}</h1>
        <SpeechBubble tone="happy">{lessonCopy.finishText.replace('{world}', world.name)}</SpeechBubble>
        <WorldArt worldId={world.id} className={styles.finishArt} />
        <RewardBurst xp={finished.xp} showStars={false} />
        <p className="visually-hidden">+{finished.xp} XP</p>
        <Button block to={`/kuis/${world.id}`}>
          {lessonCopy.startQuiz}
        </Button>
        <Button variant="secondary" block onClick={() => navigate('/peta')}>
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
        <MenuButton compact className={styles.close} />
        <AudioButton className={styles.close} />
        <ProgressPath value={index + 1} max={screens.length} label={`Langkah pelajaran ${world.name}`} />
      </header>
      <main className={styles.main}>
        <div className={styles.metaRow}>
          {phase && (
            <span className={styles.phaseChip} title="Fase berpikir (RMT)">
              {phase.icon} {phase.label} · {phase.student}
            </span>
          )}
          <AskTata
            context={{
              worldName: world.name,
              topic: screen.title,
              // Hanya teks soal/cerita — kunci jawaban & pembahasan tidak pernah dikirim ke AI.
              task: [screen.story, screen.prompt ?? screen.math].filter(Boolean).join(' '),
              phase: phase?.label,
            }}
          />
        </div>
        {resumedAt && (
          <p className={styles.resume} role="status">
            Melanjutkan dari langkah {resumedAt} dari {screens.length}.{' '}
            <button type="button" onClick={restart}>
              Mulai dari awal
            </button>
          </p>
        )}
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
