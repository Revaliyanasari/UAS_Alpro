import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import InstrumentEditor from './InstrumentEditor.jsx';
import { useTeacher } from '../../store/teacherStore.js';
import { instrumentMax, validateInstrument } from './scoring.js';
import { downloadFile, fileSlug, readJsonFile } from './download.js';
import styles from './teacher.module.css';

const KIND = { pretest: 'Pretest', posttest: 'Posttest', latihan: 'Latihan', lainnya: 'Lainnya' };

export default function InstrumentsPanel() {
  const { instruments, addInstrument, deleteInstrument } = useTeacher();
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const current = instruments.find((i) => i.id === editing);
  if (current) return <InstrumentEditor instrument={current} onClose={() => setEditing(null)} />;

  const importJson = async (file) => {
    if (!file) return;
    const r = await readJsonFile(file);
    if (!r.ok) return setMsg(r.error);
    const v = validateInstrument(r.data);
    if (!v.ok) return setMsg(v.error);
    addInstrument(v.instrument);
    setMsg(`Instrumen "${v.instrument.title}" berhasil diimpor (${v.instrument.items.length} soal).`);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <Button onClick={() => setEditing(addInstrument())}>+ Instrumen baru</Button>
        <label className={styles.fileBtn}>
          Impor JSON
          <input type="file" accept="application/json,.json" onChange={(e) => importJson(e.target.files?.[0])} aria-label="Impor instrumen dari berkas JSON" />
        </label>
      </div>
      {msg && (
        <p className={styles.info} role="status">
          {msg}
        </p>
      )}
      {instruments.length === 0 ? (
        <p className={styles.empty}>Belum ada instrumen. Buat instrumen baru atau impor dari berkas JSON.</p>
      ) : (
        <ul className={styles.cards}>
          {instruments.map((i) => (
            <li key={i.id} className={styles.card}>
              <div>
                <h3>{i.title}</h3>
                <p className={styles.meta}>
                  {KIND[i.kind]} · {i.items.length} soal · skor maks {instrumentMax(i)} ·{' '}
                  <span className={i.status === 'disetujui' ? styles.ok : styles.draft}>{i.status === 'disetujui' ? 'Disetujui' : 'Draf'}</span>
                </p>
              </div>
              <div className={styles.rowBtns}>
                <Button variant="secondary" onClick={() => setEditing(i.id)}>
                  Ubah
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => downloadFile(`instrumen-${fileSlug(i.title)}.json`, JSON.stringify(i, null, 2), 'application/json')}
                >
                  Ekspor JSON
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm(`Hapus instrumen "${i.title}" beserta semua hasil penilaiannya?`)) deleteInstrument(i.id);
                  }}
                >
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
