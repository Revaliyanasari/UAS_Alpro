import { useState } from 'react';
import { Link } from 'react-router-dom';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import WorldBackground from '../welcome/WorldBackground.jsx';
import IslandButton from './IslandButton.jsx';
import WorldSheet from './WorldSheet.jsx';
import { useProfile } from '../../store/profileStore.js';
import content from '../../content/worlds.json';
import { lessons } from '../../content/lessons/index.js';
import { quizzes } from '../../content/quizzes/index.js';
import copy from '../../content/onboarding.json';
import styles from './MapPage.module.css';

// Peta petualangan: 5 pulau berurutan dari prasyarat (World 1) sampai literasi matematis (World 5).
// Pulau berikutnya terbuka setelah pulau sebelumnya selesai (profileStore.isUnlocked).
export default function MapPage() {
  const { nickname, xp, isUnlocked, totalStars, worlds: progress, quizHistory } = useProfile();
  const [openId, setOpenId] = useState(null);
  const worlds = content.worlds;
  const current = worlds.find((w) => isUnlocked(w.id) && !progress[w.id]?.completed) ?? worlds[0];
  const openWorld = worlds.find((w) => w.id === openId);

  return (
    <div className={styles.screen}>
      <WorldBackground variant="map" />
      <header className={styles.bar}>
        <div className={styles.hello}>
          <strong>{nickname ? copy.map.hello.replace('{name}', nickname) : copy.map.helloAnon}</strong>
          <span className={styles.stats}>
            <span aria-label={`${totalStars()} bintang`}>⭐ {totalStars()}</span>
            <span aria-label={`${xp} poin pengalaman`}>XP {xp}</span>
          </span>
        </div>
        <Link to="/pengaturan" className={styles.settings} aria-label="Pengaturan">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.4-2.1.9.7-1.8 3.1-1.1-.4a7 7 0 0 1-1.7 1l-.2 1.2h-3.6l-.2-1.2a7 7 0 0 1-1.7-1l-1.1.4-1.8-3.1.9-.7a7 7 0 0 1 0-2l-.9-.7 1.8-3.1 1.1.4a7 7 0 0 1 1.7-1L10.2 3h3.6l.2 1.2a7 7 0 0 1 1.7 1l1.1-.4 1.8 3.1-.9.7a7 7 0 0 1 0 2Z"
            />
          </svg>
        </Link>
      </header>

      <main className={styles.map}>
        <h1 className="visually-hidden">Peta Petualangan</h1>
        <ol className={styles.path}>
          {worlds.map((w, i) => (
            <li key={w.id} className={i % 2 === 0 ? styles.left : styles.right}>
              <IslandButton
                world={w}
                unlocked={isUnlocked(w.id)}
                completed={Boolean(progress[w.id]?.completed)}
                stars={progress[w.id]?.stars ?? 0}
                current={w.id === current.id}
                onOpen={() => setOpenId(w.id)}
              />
            </li>
          ))}
        </ol>
      </main>

      <aside className={styles.guide}>
        <Tata state="idle" size="sm" />
        <SpeechBubble tail="left">{copy.map.tataStart.replace('{world}', current.name)}</SpeechBubble>
      </aside>

      {openWorld && (
        <WorldSheet
          world={openWorld}
          unlocked={isUnlocked(openWorld.id)}
          hasLesson={Boolean(lessons[openWorld.id])}
          hasQuiz={Boolean(quizzes[openWorld.id])}
          progress={progress[openWorld.id]}
          history={quizHistory.filter((h) => h.worldId === openWorld.id)}
          previous={worlds.find((w) => w.id === openWorld.id - 1)}
          indicatorNames={content.indicatorNames}
          copy={copy.map}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
