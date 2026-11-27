import AppLayout from '../../components/layout/AppLayout.jsx';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import { useProfile } from '../../store/profileStore.js';
import { computeBadges } from './badges.js';
import styles from './Achievements.module.css';

/** Koleksi lencana & bintang. Status lencana dihitung dari progres asli siswa (badges.js). */
export default function AchievementsPage() {
  const profile = useProfile();
  const badges = computeBadges(profile);
  const earned = badges.filter((b) => b.earned).length;
  const stars = profile.totalStars();

  return (
    <AppLayout title="Pencapaian & Lencana" icon="medal" wide>
      <section className={styles.summary}>
        <span className={styles.summaryTata}>
          <Tata state={earned > 0 ? 'proud' : 'wave'} size="sm" />
        </span>
        <SpeechBubble tail="left">
          Kamu sudah meraih <strong>{earned}</strong> dari {badges.length} lencana dan mengumpulkan <strong>{stars}</strong> bintang. {earned < badges.length ? 'Ayo kumpulkan semuanya!' : 'Semua lencana terkumpul. Hebat!'}
        </SpeechBubble>
      </section>
      <ul className={styles.badges}>
        {badges.map((b) => (
          <li key={b.id} className={[styles.badge, styles[`c-${b.color}`], b.earned ? styles.earned : styles.locked].join(' ')}>
            <span className={styles.icon} aria-hidden="true">
              {b.icon}
            </span>
            <h2>{b.name}</h2>
            <p>{b.desc}</p>
            <span className={styles.status}>{b.earned ? '✔ Diraih' : `${b.value}/${b.target}`}</span>
            {!b.earned && (
              <span className={styles.bar} role="progressbar" aria-label={`Kemajuan ${b.name}`} aria-valuenow={b.value} aria-valuemin={0} aria-valuemax={b.target}>
                <span style={{ width: `${(b.value / b.target) * 100}%` }} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}
