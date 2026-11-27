import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Tour from '../../components/tour/Tour.jsx';
import { useTataSays } from '../../audio/index.js';
import { DASHBOARD_TOUR } from '../../components/tour/tourSteps.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import { useProfile } from '../../store/profileStore.js';
import { useStudents } from '../../store/studentStore.js';
import { worldStatuses, overallPercent, nextStep, missionsToday, activeDays } from './progress.js';
import { computeBadges } from '../achievements/badges.js';
import { GAMES } from '../games/games.js';
import styles from './Dashboard.module.css';

function Bar({ value, label }) {
  return (
    <span className={styles.bar} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${value}%` }} />
    </span>
  );
}

/** Beranda siswa: sapaan, ringkasan XP/bintang, progres, misi harian, rekomendasi, game, pencapaian. */
export default function DashboardPage() {
  const profile = useProfile();
  const student = useStudents((s) => s.students[s.activeId]);
  const worlds = worldStatuses(profile).filter((w) => w.available);
  const next = nextStep(profile);
  const missions = missionsToday(profile);
  const badges = computeBadges(profile);
  const earned = badges.filter((b) => b.earned);
  const stars = profile.totalStars();
  const missionsDone = missions.filter((m) => m.done).length;
  // Tur: muncul otomatis sekali per siswa; bisa diulang lewat tombol "Lihat tur" atau Pengaturan (?tur=1).
  const [params, setParams] = useSearchParams();
  useTataSays('dashboard');
  const [tourOpen, setTourOpen] = useState(() => !profile.tourDone || params.get('tur') === '1');
  const closeTour = () => {
    setTourOpen(false);
    profile.setTourDone(true);
    if (params.has('tur')) setParams({}, { replace: true });
  };

  return (
    <AppLayout title="Beranda" icon="home" wide>
      <section className={styles.hero} aria-label="Sapaan">
        <div className={styles.heroText}>
          <h2 className={styles.hello}>Halo, {profile.nickname || student?.nickname}!</h2>
          <p className={styles.sub}>
            {student?.className} · Siap melanjutkan petualangan aljabar hari ini?
          </p>
          <Button to={next.to} className={styles.cta} data-tour="next">
            ▶ {next.kind === 'game' ? next.label : `Lanjutkan: ${next.label}`}
          </Button>
          <button type="button" className={styles.tourBtn} onClick={() => setTourOpen(true)}>
            Lihat tur aplikasi
          </button>
        </div>
        <div className={styles.heroTata}>
          <SpeechBubble tail="left">{missionsDone === missions.length ? 'Semua misi hari ini selesai. Keren!' : `Misi hari ini: ${missionsDone}/${missions.length} selesai.`}</SpeechBubble>
          <Tata state={missionsDone === missions.length ? 'cheer' : 'wave'} size="md" />
        </div>
      </section>

      <ul className={styles.stats} aria-label="Ringkasan" data-tour="stats">
        <li className={styles.statXp}>
          <span className={styles.statIcon}>💎</span>
          <strong>{profile.xp}</strong>
          <span>XP</span>
        </li>
        <li className={styles.statStar}>
          <span className={styles.statIcon}>⭐</span>
          <strong>{stars}</strong>
          <span>Bintang</span>
        </li>
        <li className={styles.statBadge}>
          <span className={styles.statIcon}>🏅</span>
          <strong>
            {earned.length}/{badges.length}
          </strong>
          <span>Lencana</span>
        </li>
        <li className={styles.statDays}>
          <span className={styles.statIcon}>📅</span>
          <strong>{activeDays(profile.activity)}</strong>
          <span>Hari belajar</span>
        </li>
      </ul>

      <div className={styles.grid}>
        <section className={[styles.card, styles.cardLearn].join(' ')} aria-labelledby="d-progress">
          <h3 id="d-progress">
            <Icon name="map" size={20} /> Progres belajar
          </h3>
          <p className={styles.big}>{overallPercent(profile)}%</p>
          <Bar value={overallPercent(profile)} label="Progres keseluruhan" />
          <ul className={styles.worldList}>
            {worlds.map((w) => (
              <li key={w.id}>
                <span>
                  World {w.id} · {w.name}
                </span>
                <span className={styles.worldState}>{w.completed ? `✔ ${'⭐'.repeat(w.stars)}` : w.lessonDone ? 'Kuis menunggu' : w.unlocked ? 'Siap dimulai' : '🔒'}</span>
                <Bar value={w.percent} label={`Progres World ${w.id}`} />
              </li>
            ))}
          </ul>
          <Link to="/peta" className={styles.more}>
            Buka peta petualangan →
          </Link>
        </section>

        <section className={[styles.card, styles.cardHome].join(' ')} aria-labelledby="d-mission">
          <h3 id="d-mission">
            <Icon name="star" size={20} /> Misi harian
          </h3>
          <ul className={styles.missions}>
            {missions.map((m) => (
              <li key={m.id} className={m.done ? styles.done : ''}>
                <span className={styles.check} aria-hidden="true">
                  {m.done ? '✔' : ''}
                </span>
                <span>
                  {m.label}
                  <small>
                    {m.value}/{m.target}
                  </small>
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.note}>Misi berganti setiap hari dan dihitung dari aktivitasmu sendiri.</p>
        </section>

        <section className={[styles.card, styles.cardOther].join(' ')} aria-labelledby="d-next">
          <h3 id="d-next">
            <Icon name="book" size={20} /> Rekomendasi untukmu
          </h3>
          <p className={styles.recoTitle}>{next.label}</p>
          <p className={styles.note}>
            {next.kind === 'lesson' && 'Pelajari materinya dulu, lalu kerjakan kuis untuk membuka pulau berikutnya.'}
            {next.kind === 'quiz' && 'Pelajaranmu sudah selesai. Raih nilai minimal 60% untuk membuka pulau berikutnya.'}
            {next.kind === 'game' && 'Semua pulau yang tersedia sudah kamu taklukkan. Asah terus kemampuanmu!'}
          </p>
          <Button to={next.to} variant="secondary">
            Mulai
          </Button>
        </section>

        <section className={[styles.card, styles.cardGame].join(' ')} aria-labelledby="d-games">
          <h3 id="d-games">
            <Icon name="game" size={20} /> Game belajar
          </h3>
          <ul className={styles.gameList}>
            {GAMES.map((g) => (
              <li key={g.id}>
                <span className={styles.gameEmoji} aria-hidden="true">
                  {g.emoji}
                </span>
                <span>
                  <strong>{g.title}</strong>
                  <small>{profile.games?.[g.id] ? `Rekor: ${profile.games[g.id].best}` : 'Belum dimainkan'}</small>
                </span>
                <Link to={g.to} className={styles.play} aria-label={`Main ${g.title}`}>
                  Main
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={[styles.card, styles.cardCommunity, styles.span2].join(' ')} aria-labelledby="d-badges">
          <h3 id="d-badges">
            <Icon name="medal" size={20} /> Pencapaian
          </h3>
          {earned.length === 0 ? (
            <p className={styles.note}>Belum ada lencana. Selesaikan pelajaran World 1 untuk meraih lencana pertamamu: Penjelajah Aljabar!</p>
          ) : (
            <ul className={styles.badgeRow}>
              {earned.slice(0, 6).map((b) => (
                <li key={b.id} title={b.desc}>
                  <span aria-hidden="true">{b.icon}</span>
                  {b.name}
                </li>
              ))}
            </ul>
          )}
          <Link to="/pencapaian" className={styles.more}>
            Lihat semua lencana →
          </Link>
        </section>
      </div>
      {tourOpen && <Tour steps={DASHBOARD_TOUR} onClose={closeTour} />}
    </AppLayout>
  );
}
