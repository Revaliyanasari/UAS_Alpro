import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { useStudents } from '../../store/studentStore.js';
import { useProfile } from '../../store/profileStore.js';
import { idbStorage } from '../../store/storage.js';
import { scopedKey } from '../../store/scopedStorage.js';
import { computeBadges } from '../achievements/badges.js';
import styles from './Leaderboard.module.css';

const starsOf = (p) => Object.values(p.worlds ?? {}).reduce((s, w) => s + (w.stars || 0), 0);

/**
 * Peringkat JUJUR: hanya siswa yang memakai perangkat ini (data asli masing-masing), nama panggilan saja.
 * Peringkat satu kelas butuh server bersama — belum tersedia, dijelaskan di halaman (tanpa data karangan).
 */
export function rankRows(list) {
  return [...list].sort((a, b) => b.xp - a.xp || b.stars - a.stars || a.nickname.localeCompare(b.nickname, 'id')).map((r, i) => ({ ...r, rank: i + 1 }));
}

export default function LeaderboardPage() {
  const students = useStudents((s) => s.students);
  const activeId = useStudents((s) => s.activeId);
  const live = useProfile(); // progres siswa aktif (selalu terbaru)
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = [];
      for (const s of Object.values(students)) {
        let p = s.id === activeId ? live : null;
        if (!p) {
          const raw = await idbStorage.getItem(scopedKey('aa-profile', s.id));
          p = raw ? JSON.parse(raw).state ?? {} : {};
        }
        list.push({ id: s.id, nickname: s.nickname, xp: p.xp ?? 0, stars: starsOf(p), badges: computeBadges({ worlds: {}, quizHistory: [], activity: [], games: {}, ...p }).filter((b) => b.earned).length });
      }
      if (alive) setRows(rankRows(list));
    })();
    return () => {
      alive = false;
    };
  }, [students, activeId, live]);

  return (
    <AppLayout title="Peringkat" icon="trophy">
      <section className={styles.notice}>
        <span className={styles.noticeTata}>
          <Tata state="talking" size="sm" />
        </span>
        <p>
          <strong>Peringkat di perangkat ini.</strong> Daftar ini hanya berisi siswa yang belajar memakai perangkat ini, dengan data asli mereka. Peringkat
          seluruh kelas membutuhkan server bersama yang <strong>belum tersedia</strong>, jadi tidak ada data siswa lain yang ditampilkan. Hanya nama panggilan yang
          ditampilkan.
        </p>
      </section>
      {rows && (
        <ol className={styles.board} aria-label="Peringkat siswa di perangkat ini">
          {rows.map((r) => (
            <li key={r.id} className={[styles.row, r.id === activeId ? styles.me : '', r.rank <= 3 ? styles[`top${r.rank}`] : ''].join(' ')}>
              <span className={styles.rank} aria-label={`Peringkat ${r.rank}`}>
                {r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}
              </span>
              <span className={styles.name}>
                {r.nickname}
                {r.id === activeId && <span className={styles.you}>Kamu</span>}
              </span>
              <span className={styles.metric} aria-label={`${r.xp} XP`}>
                💎 {r.xp}
              </span>
              <span className={styles.metric} aria-label={`${r.stars} bintang`}>
                ⭐ {r.stars}
              </span>
              <span className={styles.metric} aria-label={`${r.badges} lencana`}>
                🏅 {r.badges}
              </span>
            </li>
          ))}
        </ol>
      )}
      {rows?.length === 1 && <p className={styles.hint}>Baru kamu yang belajar di perangkat ini. Teman yang memakai perangkat yang sama bisa mendaftar lewat menu Profil → Ganti siswa.</p>}
    </AppLayout>
  );
}
