import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import { useTeacher } from '../../store/teacherStore.js';
import { STUDENT_CODE, itemMax, newId, recapPerStudent, resultScore } from './scoring.js';
import styles from './teacher.module.css';

const today = () => new Date().toISOString().slice(0, 10);

/** Formulir hasil kerja satu siswa: jawaban (transkrip), skor tiap tahap rubrik, catatan. */
function ResultForm({ instrument, initial, onDone }) {
  const saveResult = useTeacher((s) => s.saveResult);
  const results = useTeacher((s) => s.results);
  const [draft, setDraft] = useState(
    () => initial ?? { id: newId('hasil'), instrumentId: instrument.id, studentCode: '', date: today(), answers: {}, teacherNote: '' },
  );
  const [error, setError] = useState('');
  const score = resultScore(instrument, draft);

  const setAnswer = (itemId, patch) =>
    setDraft((d) => ({ ...d, answers: { ...d.answers, [itemId]: { scores: {}, answer: '', note: '', ...d.answers[itemId], ...patch } } }));

  const save = () => {
    const code = draft.studentCode.trim().toUpperCase();
    if (!STUDENT_CODE.test(code)) return setError('Isi kode siswa (huruf/angka, maks 12 karakter, mis. S01). Jangan menulis nama lengkap.');
    if (results.some((r) => r.instrumentId === instrument.id && r.studentCode === code && r.id !== draft.id)) {
      return setError(`Hasil untuk ${code} pada instrumen ini sudah ada. Ubah hasil yang lama.`);
    }
    saveResult({ ...draft, studentCode: code });
    onDone();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          Kode siswa
          <input value={draft.studentCode} onChange={(e) => setDraft({ ...draft, studentCode: e.target.value })} placeholder="S01" maxLength={12} />
        </label>
        <label className={styles.field}>
          Tanggal
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </label>
        <p className={styles.totalBox} aria-live="polite">
          Total <strong>{score.total}</strong> / {score.max} · Nilai <strong>{score.percent}</strong>
        </p>
      </div>

      {instrument.items.map((it) => {
        const ans = draft.answers[it.id] ?? { scores: {}, answer: '', note: '' };
        return (
          <fieldset key={it.id} className={styles.item}>
            <legend>
              Soal {it.number} · {score.perItem.find((p) => p.itemId === it.id)?.score ?? 0} / {itemMax(it)}
            </legend>
            {it.text && <p className={styles.itemText}>{it.text}</p>}
            {it.key && (
              <details className={styles.keyBox}>
                <summary>Lihat kunci jawaban</summary>
                <p>{it.key}</p>
              </details>
            )}
            <label className={styles.field}>
              Jawaban siswa (transkrip dari lembar kerja)
              <textarea rows={2} value={ans.answer} onChange={(e) => setAnswer(it.id, { answer: e.target.value })} />
            </label>
            <div className={styles.scoreGrid}>
              {it.rubric.map((r) => (
                <label key={r.id} className={styles.field} title={r.criteria}>
                  {r.label || 'Tahap'} (0–{r.maxScore})
                  <input
                    className={styles.num}
                    type="number"
                    min="0"
                    max={r.maxScore}
                    value={ans.scores?.[r.id] ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? '' : Math.min(Math.max(Number(e.target.value), 0), Number(r.maxScore));
                      setAnswer(it.id, { scores: { ...ans.scores, [r.id]: v } });
                    }}
                  />
                </label>
              ))}
            </div>
            <label className={styles.field}>
              Catatan soal ini
              <input value={ans.note} onChange={(e) => setAnswer(it.id, { note: e.target.value })} />
            </label>
          </fieldset>
        );
      })}

      <label className={styles.field}>
        Catatan guru
        <textarea rows={2} value={draft.teacherNote} onChange={(e) => setDraft({ ...draft, teacherNote: e.target.value })} />
      </label>
      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}
      <div className={styles.rowBtns}>
        <Button onClick={save}>Simpan hasil</Button>
        <Button variant="secondary" onClick={onDone}>
          Batal
        </Button>
      </div>
    </div>
  );
}

export default function ScoringPanel() {
  const { instruments, results, deleteResult } = useTeacher();
  const [instId, setInstId] = useState(instruments[0]?.id ?? '');
  const [form, setForm] = useState(null); // null | 'new' | result
  const instrument = instruments.find((i) => i.id === instId);

  if (instruments.length === 0) return <p className={styles.empty}>Buat instrumen dulu di tab Instrumen.</p>;
  if (instrument && form) return <ResultForm instrument={instrument} initial={form === 'new' ? null : form} onDone={() => setForm(null)} />;

  const recap = instrument ? recapPerStudent(instrument, results) : [];

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
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
        <Button onClick={() => setForm('new')} disabled={!instrument}>
          + Tambah hasil siswa
        </Button>
      </div>
      {instrument?.status === 'draf' && <p className={styles.info}>Instrumen masih berstatus draf, cocok untuk uji coba dan koreksi soal.</p>}
      {recap.length === 0 ? (
        <p className={styles.empty}>Belum ada hasil siswa untuk instrumen ini.</p>
      ) : (
        <table className={styles.table}>
          <caption>Hasil siswa — {instrument.title}</caption>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Nilai</th>
              <th>
                <span className="visually-hidden">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {recap.map((r) => {
              const result = results.find((x) => x.instrumentId === instrument.id && x.studentCode === r.studentCode);
              return (
                <tr key={r.studentCode}>
                  <td>{r.studentCode}</td>
                  <td>{r.date}</td>
                  <td>
                    {r.total}/{r.max}
                  </td>
                  <td>{r.percent}</td>
                  <td className={styles.rowBtns}>
                    <button type="button" className={styles.linkBtn} onClick={() => setForm(result)}>
                      Ubah
                    </button>
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => window.confirm(`Hapus hasil ${r.studentCode}?`) && deleteResult(result.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
