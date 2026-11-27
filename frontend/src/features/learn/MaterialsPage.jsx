import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import { useProfile } from '../../store/profileStore.js';
import { worldStatuses } from '../home/progress.js';
import { quizzes } from '../../content/quizzes/index.js';
import WorldArt from '../../components/art/WorldArt.jsx';
import styles from './Materials.module.css';

const COLORS = ['home', 'learn', 'game', 'community', 'other'];

/** Daftar materi per pulau: tujuan, topik, status, dan tombol Pelajari/Kuis yang sesuai kunci progres. */
export default function MaterialsPage() {
  const profile = useProfile();
  const worlds = worldStatuses(profile);

  return (
    <AppLayout title="Materi Pembelajaran" icon="book" wide>
      <ol className={styles.list}>
        {worlds.map((w, i) => (
          <li key={w.id} className={[styles.card, styles[`c-${COLORS[i % 5]}`]].join(' ')}>
            <WorldArt worldId={w.id} className={[styles.art, !w.unlocked ? styles.artLocked : ''].join(' ')} />
            <header>
              <span className={styles.badge}>World {w.id}</span>
              <h2>{w.name}</h2>
              <p className={styles.mission}>🎯 {w.mission}</p>
            </header>
            <ul className={styles.topics}>
              {w.topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className={styles.state}>
              {!w.available
                ? 'Materi sedang disiapkan.'
                : w.completed
                  ? `✔ Lulus kuis · ${'⭐'.repeat(w.stars) || '—'}`
                  : w.lessonDone
                    ? 'Pelajaran selesai · kuis menunggu'
                    : w.unlocked
                      ? 'Siap dipelajari'
                      : `🔒 Lulus kuis World ${w.id - 1} untuk membuka`}
            </p>
            {w.available && w.unlocked && (
              <div className={styles.actions}>
                <Link to={`/belajar/${w.id}`} className={styles.primary}>
                  📖 {w.lessonDone ? 'Ulangi pelajaran' : 'Pelajari'}
                </Link>
                {quizzes[w.id] && (w.lessonDone || w.completed) && (
                  <Link to={`/kuis/${w.id}`} className={styles.secondary}>
                    🏁 Kuis
                  </Link>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </AppLayout>
  );
}
