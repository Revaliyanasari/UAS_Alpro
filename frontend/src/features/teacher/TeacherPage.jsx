import { useState } from 'react';
import PageShell from '../../components/ui/PageShell.jsx';
import InstrumentsPanel from './InstrumentsPanel.jsx';
import ScoringPanel from './ScoringPanel.jsx';
import ReportPanel from './ReportPanel.jsx';
import BackupPanel from './BackupPanel.jsx';
import { useTeacher } from '../../store/teacherStore.js';
import { useHydrated } from '../../hooks/useHydrated.js';
import styles from './teacher.module.css';

const TABS = [
  { id: 'instrumen', label: 'Instrumen', Panel: InstrumentsPanel },
  { id: 'penilaian', label: 'Penilaian', Panel: ScoringPanel },
  { id: 'laporan', label: 'Laporan', Panel: ReportPanel },
  { id: 'cadangan', label: 'Cadangan & Drive', Panel: BackupPanel },
];

/**
 * Modul Guru: kelola instrumen & rubrik, input skor hasil kerja siswa, rekap & analisis, ekspor CSV/PDF/JSON.
 * Data hanya tersimpan di perangkat ini (belum ada server kelas) — guru diingatkan untuk mengunduh cadangan.
 */
export default function TeacherPage() {
  const [tab, setTab] = useState('instrumen');
  const hydrated = useHydrated(useTeacher);
  const { Panel } = TABS.find((t) => t.id === tab);

  return (
    <PageShell title="Modul Guru" backTo="/pengaturan" wide>
      <p className={[styles.notice, styles.noPrint].join(' ')}>
        🔒 Data tersimpan hanya di perangkat ini dan tidak dikirim ke internet. Catat siswa dengan <strong>kode</strong> (mis. S01), bukan nama
        lengkap. Unduh cadangan secara berkala di tab <em>Cadangan &amp; Drive</em>.
      </p>
      <div className={[styles.tabs, styles.noPrint].join(' ')} role="tablist" aria-label="Bagian Modul Guru">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={[styles.tab, tab === t.id ? styles.tabOn : ''].join(' ')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab).label}>
        {hydrated ? <Panel /> : null}
      </div>
    </PageShell>
  );
}
