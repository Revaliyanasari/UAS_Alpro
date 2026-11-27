import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import { useProfile } from '../../store/profileStore.js';
import { worldStatuses, overallPercent, activeDays } from '../home/progress.js';
import { describeActivity as describe, formatWhen as fmt } from './activity.js';
import styles from './Progress.module.css';

const dayLabel = (d) => d.toLocaleDateString('id-ID', { weekday: 'short' });

/** XP per hari selama 7 hari terakhir (dari catatan aktivitas). */
export function xpLast7Days(activity = [], now = new Date()) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('sv-SE');
    days.push({ key, label: dayLabel(d), xp: activity.filter((a) => new Date(a.date).toLocaleDateString('sv-SE') === key).reduce((s, a) => s + (a.xp || 0), 0) });
  }
  return days;
}

/** Riwayat aktivitas + statistik perkembangan (XP 7 hari, nilai kuis, progres pulau). */
export default function ProgressPage() {
  const profile = useProfile();
  const { hash } = useLocation();
  const days = xpLast7Days(profile.activity);
  const maxXp = Math.max(10, ...days.map((d) => d.xp));
  const quizzes = [...(profile.quizHistory ?? [])].reverse().slice(-10);

  useEffect(() => {
    if (hash === '#statistik') document.getElementById('statistik')?.scrollIntoView?.({ block: 'start' });
  }, [hash]);

  return (
    <AppLayout title="Riwayat & Progres" icon="history" wide>
      <ul className={styles.summary}>
        <li>
          <strong>{overallPercent(profile)}%</strong> progres materi
        </li>
        <li>
          <strong>{profile.xp}</strong> XP
        </li>
        <li>
          <strong>{activeDays(profile.activity)}</strong> hari belajar
        </li>
        <li>
          <strong>{(profile.activity ?? []).length}</strong> aktivitas
        </li>
      </ul>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="riwayat">
          <h2 id="riwayat">Riwayat aktivitas</h2>
          {(profile.activity ?? []).length === 0 ? (
            <p className={styles.muted}>Belum ada aktivitas. Mulai dari pelajaran World 1 atau mainkan sebuah game.</p>
          ) : (
            <ol className={styles.timeline}>
              {profile.activity.slice(0, 20).map((a, i) => {
                const d = describe(a);
                return (
                  <li key={`${a.date}-${i}`}>
                    <span className={styles.tlIcon} aria-hidden="true">
                      {d.icon}
                    </span>
                    <span>
                      {d.text}
                      <small>
                        {fmt(a.date)} · +{a.xp} XP
                      </small>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className={styles.card} id="statistik" aria-labelledby="stat-title">
          <h2 id="stat-title">Statistik belajar</h2>
          <h3>XP 7 hari terakhir</h3>
          <div className={styles.chart} role="img" aria-label={`XP per hari: ${days.map((d) => `${d.label} ${d.xp}`).join(', ')}`}>
            {days.map((d) => (
              <span key={d.key} className={styles.col}>
                <span className={styles.colVal}>{d.xp || ''}</span>
                <span className={styles.colBar} style={{ height: `${(d.xp / maxXp) * 100}%` }} />
                <span className={styles.colLabel}>{d.label}</span>
              </span>
            ))}
          </div>
          <h3>Nilai kuis</h3>
          {quizzes.length === 0 ? (
            <p className={styles.muted}>Belum ada kuis yang dikerjakan.</p>
          ) : (
            <ul className={styles.bars}>
              {quizzes.map((q, i) => (
                <li key={`${q.date}-${i}`}>
                  <span>
                    W{q.worldId} · {new Date(q.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={styles.hbar}>
                    <span style={{ width: `${q.percent}%` }} className={q.percent >= 60 ? styles.pass : styles.fail} />
                  </span>
                  <strong>{q.percent}%</strong>
                </li>
              ))}
            </ul>
          )}
          <h3>Progres pulau</h3>
          <ul className={styles.bars}>
            {worldStatuses(profile)
              .filter((w) => w.available)
              .map((w) => (
                <li key={w.id}>
                  <span>World {w.id}</span>
                  <span className={styles.hbar}>
                    <span style={{ width: `${w.percent}%` }} className={styles.pass} />
                  </span>
                  <strong>{w.percent}%</strong>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
