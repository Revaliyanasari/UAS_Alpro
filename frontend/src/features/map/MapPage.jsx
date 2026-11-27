import { useEffect, useRef, useState } from 'react';
import { moodFor } from '../../components/tata/tataMood.js';
import AudioButton from '../../audio/AudioButton.jsx';
import MenuButton from '../../components/layout/MenuButton.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { Link } from 'react-router-dom';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import WorldBackground from '../welcome/WorldBackground.jsx';
import IslandButton from './IslandButton.jsx';
import WorldSheet from './WorldSheet.jsx';
import MapTrail from './MapTrail.jsx';
import { useProfile } from '../../store/profileStore.js';
import content from '../../content/worlds.json';
import { lessons } from '../../content/lessons/index.js';
import { quizzes } from '../../content/quizzes/index.js';
import copy from '../../content/onboarding.json';
import styles from './MapPage.module.css';

// Peta petualangan: 5 pulau berurutan dari prasyarat (World 1) sampai literasi matematis (World 5).
// Pulau berikutnya terbuka setelah pulau sebelumnya selesai (profileStore.isUnlocked).
const IDLE_MS = 60_000;

/** true bila tidak ada sentuhan/ketikan selama `ms` (TATA mengantuk di peta). */
export function useIdle(ms) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), ms);
    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), ms);
    };
    const events = ['pointerdown', 'keydown', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [ms]);
  return idle;
}

export default function MapPage() {
  const { nickname, xp, isUnlocked, totalStars, worlds: progress, quizHistory } = useProfile();
  const [openId, setOpenId] = useState(null);
  const listRef = useRef(null);
  const sleepy = useIdle(IDLE_MS);
  const worlds = content.worlds;
  const current = worlds.find((w) => isUnlocked(w.id) && !progress[w.id]?.completed) ?? worlds[0];
  const openWorld = worlds.find((w) => w.id === openId);

  return (
    <div className={styles.screen}>
      <WorldBackground variant="map" />
      <header className={styles.bar}>
        <MenuButton compact className={styles.settings} />
        <div className={styles.hello}>
          <strong>{nickname ? copy.map.hello.replace('{name}', nickname) : copy.map.helloAnon}</strong>
          <span className={styles.stats}>
            <span aria-label={`${totalStars()} bintang`}>⭐ {totalStars()}</span>
            <span aria-label={`${xp} poin pengalaman`}>XP {xp}</span>
          </span>
        </div>
        <AudioButton className={styles.settings} />
        <Link to="/profil" className={[styles.settings, styles.profileLink].join(' ')} aria-label="Profil belajarku">
          <span aria-hidden="true">👤</span>
        </Link>
        <Link to="/pengaturan" className={styles.settings} aria-label="Pengaturan">
          <Icon name="gear" size={22} />
        </Link>
      </header>

      <main className={styles.map}>
        <h1 className="visually-hidden">Peta Petualangan</h1>
        <div className={styles.trailWrap}>
          <ol className={styles.path} ref={listRef}>
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
          {/* Setelah <ol>: ref daftar pulau sudah terpasang saat jalan diukur. Lapisan diatur z-index (jalan di bawah). */}
          <MapTrail listRef={listRef} completed={worlds.filter((w) => progress[w.id]?.completed).length} />
        </div>
      </main>

      <aside className={styles.guide}>
        <Tata state={moodFor(sleepy ? 'idleLong' : 'idle')} size="sm" />
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
