import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/ui/PageShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { useStudents } from '../../store/studentStore.js';
import { useProfile } from '../../store/profileStore.js';
import worldsContent from '../../content/worlds.json';
import copy from '../../content/student.json';
import styles from './StudentPages.module.css';

/** Profil belajar: identitas siswa aktif + progres (XP, bintang, status tiap pulau, riwayat kuis). */
export default function ProfilePage() {
  const navigate = useNavigate();
  const student = useStudents((s) => s.students[s.activeId]);
  const signOut = useStudents((s) => s.signOut);
  const { xp, worlds, quizHistory, totalStars, isUnlocked } = useProfile();
  const c = copy.profile;
  const status = (w) => {
    const p = worlds[w.id];
    if (p?.completed) return `${c.passed} · ${'⭐'.repeat(p.stars || 0) || '—'}${p.bestPercent !== undefined ? ` · ${p.bestPercent}%` : ''}`;
    if (p?.lessonDone) return c.lessonDone;
    return isUnlocked(w.id) ? c.notStarted : c.locked;
  };

  return (
    <PageShell title={c.title} backTo="/peta">
      <section className={styles.idCard} aria-label="Identitas">
        <span className={styles.idTata}>
          <Tata state="proud" size="sm" />
        </span>
        <dl>
          <dt>Nama panggilan</dt>
          <dd>{student.nickname}</dd>
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
      </section>

      <Card title={c.progress}>
        <p className={styles.stats}>
          <span aria-label={`${xp} poin pengalaman`}>XP {xp}</span>
          <span aria-label={`${totalStars()} bintang`}>⭐ {totalStars()}</span>
        </p>
        <ul className={styles.worlds}>
          {worldsContent.worlds.map((w) => (
            <li key={w.id}>
              <strong>
                World {w.id} · {w.name}
              </strong>
              <span>{status(w)}</span>
            </li>
          ))}
        </ul>
        <h3 className={styles.sub}>{c.history}</h3>
        {quizHistory.length === 0 ? (
          <p className={styles.muted}>{c.noHistory}</p>
        ) : (
          <ul className={styles.worlds}>
            {quizHistory.slice(0, 5).map((h) => (
              <li key={h.date}>
                <span>
                  World {h.worldId} · {new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                <strong>{h.percent}%</strong>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className={styles.actions}>
        <Button block to="/identitas?ubah=1">
          {c.edit}
        </Button>
        <Button block variant="secondary" to="/siswa">
          {c.switch}
        </Button>
        <Button
          block
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
      </div>
    </PageShell>
  );
}
