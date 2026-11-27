import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import { useProfile } from '../../store/profileStore.js';
import { GAMES, PLANNED } from './games.js';
import styles from './Games.module.css';

/** Pusat game belajar: hanya game yang benar-benar bisa dimainkan yang punya tombol. */
export default function GamesHubPage() {
  const games = useProfile((s) => s.games ?? {});
  return (
    <AppLayout title="Game Belajar Seru" icon="game" wide>
      <div className={styles.intro}>
        <span className={styles.introTata}>
          <Tata state="cheer" size="sm" />
        </span>
        <SpeechBubble tail="left">Belajar sambil bermain! Setiap game memakai materi yang kamu pelajari di pulau-pulau aljabar.</SpeechBubble>
      </div>
      <ul className={styles.hub}>
        {GAMES.map((g) => (
          <li key={g.id} className={styles.hubCard}>
            <span className={styles.hubEmoji} aria-hidden="true">
              {g.emoji}
            </span>
            <h2>{g.title}</h2>
            <p>{g.desc}</p>
            <ul className={styles.skills} aria-label="Materi">
              {g.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className={styles.record}>{games[g.id] ? `Rekor: ${games[g.id].best} · dimainkan ${games[g.id].plays}×` : 'Belum pernah dimainkan'}</p>
            <Link to={g.to} className={styles.playBtn}>
              ▶ Main
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.planned}>
        <strong>Sedang disiapkan:</strong> {PLANNED.join(', ')}.
      </p>
    </AppLayout>
  );
}
