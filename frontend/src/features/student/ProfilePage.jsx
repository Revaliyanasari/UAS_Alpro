import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { useStudents } from '../../store/studentStore.js';
import { useProfile } from '../../store/profileStore.js';
import { worldStatuses, activeDays } from '../home/progress.js';
import { computeBadges } from '../achievements/badges.js';
import { describeActivity, formatWhen } from '../progress/activity.js';
import copy from '../../content/student.json';
import styles from './Profile.module.css';

/**
 * Profil belajar: kartu identitas, ringkasan XP/bintang/lencana/hari belajar, progres tiap pulau,
 * riwayat aktivitas, pencapaian, dan kelola identitas. Semua angka dari progres siswa aktif.
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const student = useStudents((s) => s.students[s.activeId]);
  const signOut = useStudents((s) => s.signOut);
  const profile = useProfile();
  const { xp, quizHistory, totalStars } = profile;
  const c = copy.profile;
  const worlds = worldStatuses(profile);
  const badges = computeBadges(profile);
  const earned = badges.filter((b) => b.earned);
  const activity = profile.activity ?? [];

  const status = (w) => {
    if (!w.available) return 'Segera hadir';
    if (w.completed) return `${c.passed} · ${'⭐'.repeat(w.stars) || '—'}${w.bestPercent !== undefined ? ` · ${w.bestPercent}%` : ''}`;
    if (w.lessonDone) return c.lessonDone;
    return w.unlocked ? c.notStarted : c.locked;
  };

  return (
    <AppLayout title={c.title} icon="user" wide>
      <section className={styles.hero} aria-label="Identitas">
        <span className={styles.avatar} aria-hidden="true">
          {student.nickname.slice(0, 1).toUpperCase()}
        </span>
        <div className={styles.heroText}>
          <h2>{student.nickname}</h2>
          <dl className={styles.idList}>
            <dt>Nama lengkap</dt>
            <dd>{student.fullName}</dd>
            <dt>Kelas</dt>
            <dd>{student.className}</dd>
            <dt>Sekolah</dt>
            <dd>{student.school}</dd>
            {student.absen && (
              <>
                <dt>No. absen</dt>
                <dd>{student.absen}</dd>
              </>
            )}
          </dl>
        </div>
        <span className={styles.heroTata}>
          <Tata state={earned.length > 0 ? 'proud' : 'wave'} size="sm" />
        </span>
      </section>

      <ul className={styles.stats} aria-label="Ringkasan belajar">
        <li className={styles.sXp} aria-label={`${xp} poin pengalaman`}>
          <span aria-hidden="true">💎</span>
          <strong>{xp}</strong>
          <small>XP</small>
        </li>
        <li className={styles.sStar} aria-label={`${totalStars()} bintang`}>
          <span aria-hidden="true">⭐</span>
          <strong>{totalStars()}</strong>
          <small>Bintang</small>
        </li>
        <li className={styles.sBadge} aria-label={`${earned.length} lencana`}>
          <span aria-hidden="true">🏅</span>
          <strong>
            {earned.length}/{badges.length}
          </strong>
          <small>Lencana</small>
        </li>
        <li className={styles.sDays} aria-label={`${activeDays(activity)} hari belajar`}>
          <span aria-hidden="true">📅</span>
          <strong>{activeDays(activity)}</strong>
          <small>Hari belajar</small>
        </li>
      </ul>

      <div className={styles.grid}>
        <section className={[styles.card, styles.cLearn].join(' ')} aria-labelledby="p-worlds">
          <h3 id="p-worlds">
            <Icon name="map" size={20} /> {c.progress}
          </h3>
          <ul className={styles.worlds}>
            {worlds.map((w) => (
              <li key={w.id}>
                <span className={styles.wName}>
                  World {w.id} · {w.name}
                </span>
                <span className={styles.wState}>{status(w)}</span>
                <span className={styles.bar} role="progressbar" aria-label={`Progres World ${w.id}`} aria-valuenow={w.percent} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${w.percent}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={[styles.card, styles.cCommunity].join(' ')} aria-labelledby="p-badges">
          <h3 id="p-badges">
            <Icon name="medal" size={20} /> Pencapaian
          </h3>
          {earned.length === 0 ? (
            <p className={styles.muted}>Belum ada lencana. Selesaikan pelajaran World 1 untuk meraih Penjelajah Aljabar!</p>
          ) : (
            <ul className={styles.badges}>
              {earned.map((b) => (
                <li key={b.id} title={b.desc}>
                  <span aria-hidden="true">{b.icon}</span> {b.name}
                </li>
              ))}
            </ul>
          )}
          <Link to="/pencapaian" className={styles.more}>
            Lihat semua lencana →
          </Link>
        </section>

        <section className={[styles.card, styles.cHome].join(' ')} aria-labelledby="p-activity">
          <h3 id="p-activity">
            <Icon name="history" size={20} /> Riwayat aktivitas
          </h3>
          {activity.length === 0 ? (
            <p className={styles.muted}>Belum ada aktivitas. Ayo mulai dari Beranda!</p>
          ) : (
            <ol className={styles.timeline}>
              {activity.slice(0, 5).map((a, i) => {
                const d = describeActivity(a);
                return (
                  <li key={`${a.date}-${i}`}>
                    <span aria-hidden="true">{d.icon}</span>
                    <span>
                      {d.text}
                      <small>
                        {formatWhen(a.date)} · +{a.xp} XP
                      </small>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          <Link to="/progres" className={styles.more}>
            Lihat riwayat & statistik lengkap →
          </Link>
        </section>

        <section className={[styles.card, styles.cGame].join(' ')} aria-labelledby="p-quiz">
          <h3 id="p-quiz">
            <Icon name="trophy" size={20} /> {c.history}
          </h3>
          {quizHistory.length === 0 ? (
            <p className={styles.muted}>{c.noHistory}</p>
          ) : (
            <ul className={styles.quizList}>
              {quizHistory.slice(0, 5).map((h) => (
                <li key={h.date}>
                  <span>
                    World {h.worldId} · {new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                  <strong className={h.percent >= 60 ? styles.pass : styles.retry}>{h.percent}%</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.manage} aria-label="Kelola identitas">
        <Button to="/identitas?ubah=1">{c.edit}</Button>
        <Button variant="secondary" to="/siswa">
          {c.switch}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            // Pindah ke halaman pembuka dulu, baru keluar — agar penjaga halaman profil tidak mengalihkan ke tempat lain.
            navigate('/');
            setTimeout(signOut, 0);
          }}
        >
          {c.signOut}
        </Button>
        <p className={styles.muted}>{c.signOutNote}</p>
      </section>
    </AppLayout>
  );
}
