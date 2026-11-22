import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import { useTeacher } from '../../store/teacherStore.js';
import {
  INDICATORS,
  comparePrePost,
  indicatorAchievement,
  itemRecapCsv,
  recapPerItem,
  recapPerStudent,
  studentRecapCsv,
  toCsv,
} from './scoring.js';
import { downloadFile, fileSlug } from './download.js';
import styles from './teacher.module.css';

const csv = 'text/csv;charset=utf-8';

function Bar({ value }) {
  return (
    <span className={styles.bar} aria-hidden="true">
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </span>
  );
}

/** Laporan evaluasi: rekap per siswa & per soal, ketercapaian indikator, pretest–posttest, ekspor. */
export default function ReportPanel() {
  const { instruments, results } = useTeacher();
  const [instId, setInstId] = useState(instruments[0]?.id ?? '');
  const pres = instruments.filter((i) => i.kind === 'pretest');
  const posts = instruments.filter((i) => i.kind === 'posttest');
  const [preId, setPreId] = useState(pres[0]?.id ?? '');
  const [postId, setPostId] = useState(posts[0]?.id ?? '');
  const inst = instruments.find((i) => i.id === instId);

  if (instruments.length === 0) return <p className={styles.empty}>Belum ada instrumen.</p>;

  const students = inst ? recapPerStudent(inst, results) : [];
  const items = inst ? recapPerItem(inst, results) : [];
  const indicators = inst ? indicatorAchievement(inst, results) : [];
  const pre = instruments.find((i) => i.id === preId);
  const post = instruments.find((i) => i.id === postId);
  const comparison = pre && post ? comparePrePost(pre, post, results) : null;
  const avg = students.length ? Math.round((students.reduce((s, r) => s + r.percent, 0) / students.length) * 10) / 10 : 0;

  return (
    <section className={styles.panel}>
      <div className={[styles.toolbar, styles.noPrint].join(' ')}>
        <label className={styles.field}>
          Instrumen
          <select value={instId} onChange={(e) => setInstId(e.target.value)}>
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </label>
        <Button variant="secondary" onClick={() => window.print()}>
          Cetak / Simpan PDF
        </Button>
      </div>

      {inst && (
        <>
          <h3 className={styles.printTitle}>Laporan Evaluasi — {inst.title}</h3>
          <p className={styles.meta}>
            {students.length} siswa · rata-rata nilai <strong>{avg}</strong>
          </p>

          <div className={styles.reportHead}>
            <h4>Rekap nilai per siswa</h4>
            <Button
              variant="secondary"
              className={styles.noPrint}
              onClick={() => downloadFile(`rekap-siswa-${fileSlug(inst.title)}.csv`, studentRecapCsv(inst, results), csv)}
              disabled={students.length === 0}
            >
              Unduh CSV
            </Button>
          </div>
          {students.length === 0 ? (
            <p className={styles.empty}>Belum ada hasil.</p>
          ) : (
            <div className={styles.scroll}>
              <table className={styles.table}>
                <caption className="visually-hidden">Rekap nilai per siswa</caption>
                <thead>
                  <tr>
                    <th>Kode</th>
                    {inst.items.map((it) => (
                      <th key={it.id}>S{it.number}</th>
                    ))}
                    <th>Total</th>
                    <th>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((r) => (
                    <tr key={r.studentCode}>
                      <td>{r.studentCode}</td>
                      {r.perItem.map((p) => (
                        <td key={p.itemId}>{p.score}</td>
                      ))}
                      <td>
                        {r.total}/{r.max}
                      </td>
                      <td>{r.percent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.reportHead}>
            <h4>Rekap & analisis per soal</h4>
            <Button
              variant="secondary"
              className={styles.noPrint}
              onClick={() => downloadFile(`rekap-soal-${fileSlug(inst.title)}.csv`, itemRecapCsv(inst, results), csv)}
              disabled={students.length === 0}
            >
              Unduh CSV
            </Button>
          </div>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <caption className="visually-hidden">Rekap per soal</caption>
              <thead>
                <tr>
                  <th>Soal</th>
                  <th>Indikator</th>
                  <th>Rata-rata</th>
                  <th>Skor penuh</th>
                  <th>Sebagian</th>
                  <th>Nol</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.itemId}>
                    <td>{r.number}</td>
                    <td>{INDICATORS[r.indicator] ?? '—'}</td>
                    <td>
                      {r.average}/{r.max} ({r.averagePercent}%)
                    </td>
                    <td>{r.fullPercent}%</td>
                    <td>{r.partialPercent}%</td>
                    <td>{r.zeroPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4>Ketercapaian indikator</h4>
          <ul className={styles.bars}>
            {indicators.map((x) => (
              <li key={x.indicator}>
                <span>{INDICATORS[x.indicator] ?? 'Tanpa indikator'}</span>
                <Bar value={x.percent} />
                <strong>{x.percent}%</strong>
              </li>
            ))}
          </ul>
        </>
      )}

      <h4>Perbandingan pretest & posttest</h4>
      {pres.length === 0 || posts.length === 0 ? (
        <p className={styles.empty}>
          Tandai satu instrumen sebagai <em>Pretest</em> dan satu sebagai <em>Posttest</em> di tab Instrumen. Hasil dicocokkan lewat kode siswa.
        </p>
      ) : (
        <>
          <div className={[styles.formGrid, styles.noPrint].join(' ')}>
            <label className={styles.field}>
              Pretest
              <select value={preId} onChange={(e) => setPreId(e.target.value)}>
                {pres.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              Posttest
              <select value={postId} onChange={(e) => setPostId(e.target.value)}>
                {posts.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {comparison && comparison.rows.length > 0 ? (
            <>
              <p className={styles.meta}>
                Rata-rata pretest <strong>{comparison.averagePre}</strong> → posttest <strong>{comparison.averagePost}</strong> (selisih{' '}
                {comparison.averageGain})
              </p>
              <table className={styles.table}>
                <caption className="visually-hidden">Perbandingan pretest dan posttest</caption>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Pretest</th>
                    <th>Posttest</th>
                    <th>Selisih</th>
                    <th>N-gain</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((r) => (
                    <tr key={r.studentCode}>
                      <td>{r.studentCode}</td>
                      <td>{r.pre}</td>
                      <td>{r.post}</td>
                      <td>{r.gain}</td>
                      <td>{r.nGain ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                variant="secondary"
                className={styles.noPrint}
                onClick={() =>
                  downloadFile(
                    `pretest-posttest-${fileSlug(post.title)}.csv`,
                    toCsv(['Kode siswa', 'Pretest', 'Posttest', 'Selisih', 'N-gain'], comparison.rows.map((r) => [r.studentCode, r.pre, r.post, r.gain, r.nGain ?? ''])),
                    csv,
                  )
                }
              >
                Unduh CSV perbandingan
              </Button>
            </>
          ) : (
            <p className={styles.empty}>Belum ada siswa yang punya hasil pretest dan posttest sekaligus.</p>
          )}
        </>
      )}
    </section>
  );
}
