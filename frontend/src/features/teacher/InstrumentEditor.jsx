import Button from '../../components/ui/Button.jsx';
import { useTeacher, emptyItem } from '../../store/teacherStore.js';
import { INDICATORS, itemMax, instrumentMax, newId } from './scoring.js';
import styles from './teacher.module.css';

/**
 * Editor instrumen: identitas, status (draf/disetujui), catatan koreksi, daftar soal dengan
 * materi, indikator, kunci jawaban, catatan revisi, dan rubrik bertahap (skor maks per tahap).
 * Perubahan langsung tersimpan di perangkat.
 */
export default function InstrumentEditor({ instrument, onClose }) {
  const updateInstrument = useTeacher((s) => s.updateInstrument);
  const set = (patch) => updateInstrument(instrument.id, patch);
  const setItem = (itemId, patch) => set({ items: instrument.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) });
  const setRubric = (item, rubricId, patch) => setItem(item.id, { rubric: item.rubric.map((r) => (r.id === rubricId ? { ...r, ...patch } : r)) });

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <Button variant="secondary" onClick={onClose}>
          ← Kembali ke daftar
        </Button>
        <span className={styles.meta}>Tersimpan otomatis · skor maks {instrumentMax(instrument)}</span>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          Judul instrumen
          <input value={instrument.title} onChange={(e) => set({ title: e.target.value })} />
        </label>
        <label className={styles.field}>
          Jenis
          <select value={instrument.kind} onChange={(e) => set({ kind: e.target.value })}>
            <option value="pretest">Pretest</option>
            <option value="posttest">Posttest</option>
            <option value="latihan">Latihan</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </label>
        <label className={styles.field}>
          Status
          <select value={instrument.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="draf">Draf (sedang dikoreksi)</option>
            <option value="disetujui">Disetujui</option>
          </select>
        </label>
      </div>
      <label className={styles.field}>
        Catatan koreksi / revisi instrumen
        <textarea rows={3} value={instrument.notes} onChange={(e) => set({ notes: e.target.value })} />
      </label>

      <h3>Soal</h3>
      {instrument.items.map((it, idx) => (
        <fieldset key={it.id} className={styles.item}>
          <legend>
            Soal {it.number} · skor maks {itemMax(it)}
          </legend>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              Nomor
              <input type="number" min="1" value={it.number} onChange={(e) => setItem(it.id, { number: Number(e.target.value) || idx + 1 })} />
            </label>
            <label className={styles.field}>
              Materi
              <input value={it.topic} onChange={(e) => setItem(it.id, { topic: e.target.value })} placeholder="mis. Pemfaktoran FPB" />
            </label>
            <label className={styles.field}>
              Indikator literasi
              <select value={it.indicator} onChange={(e) => setItem(it.id, { indicator: e.target.value })}>
                <option value="">— pilih —</option>
                {Object.entries(INDICATORS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={styles.field}>
            Teks soal
            <textarea rows={3} value={it.text} onChange={(e) => setItem(it.id, { text: e.target.value })} />
          </label>
          <label className={styles.field}>
            Kunci jawaban
            <textarea rows={2} value={it.key} onChange={(e) => setItem(it.id, { key: e.target.value })} />
          </label>
          <label className={styles.field}>
            Catatan revisi soal
            <textarea rows={2} value={it.revisionNote} onChange={(e) => setItem(it.id, { revisionNote: e.target.value })} />
          </label>

          <table className={styles.table}>
            <caption>Rubrik penskoran soal {it.number}</caption>
            <thead>
              <tr>
                <th>Tahap</th>
                <th>Kriteria</th>
                <th>Skor maks</th>
                <th>
                  <span className="visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {it.rubric.map((r) => (
                <tr key={r.id}>
                  <td>
                    <input aria-label={`Nama tahap soal ${it.number}`} value={r.label} onChange={(e) => setRubric(it, r.id, { label: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label={`Kriteria tahap ${r.label}`} value={r.criteria} onChange={(e) => setRubric(it, r.id, { criteria: e.target.value })} />
                  </td>
                  <td>
                    <input
                      className={styles.num}
                      type="number"
                      min="0"
                      aria-label={`Skor maks tahap ${r.label}`}
                      value={r.maxScore}
                      onChange={(e) => setRubric(it, r.id, { maxScore: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`Hapus tahap ${r.label}`}
                      onClick={() => setItem(it.id, { rubric: it.rubric.filter((x) => x.id !== r.id) })}
                      disabled={it.rubric.length === 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.rowBtns}>
            <Button
              variant="secondary"
              onClick={() => setItem(it.id, { rubric: [...it.rubric, { id: newId('tahap'), label: `Tahap ${it.rubric.length + 1}`, maxScore: 1, criteria: '' }] })}
            >
              + Tahap rubrik
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm(`Hapus soal ${it.number}?`)) set({ items: instrument.items.filter((x) => x.id !== it.id) });
              }}
            >
              Hapus soal
            </Button>
          </div>
        </fieldset>
      ))}
      <Button onClick={() => set({ items: [...instrument.items, emptyItem(instrument.items.length + 1)] })}>+ Tambah soal</Button>
    </section>
  );
}
