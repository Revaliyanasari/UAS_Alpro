import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import { useTeacher } from '../../store/teacherStore.js';
import { downloadFile, fileSlug, readJsonFile } from './download.js';
import styles from './teacher.module.css';

/**
 * Cadangan data & Google Drive. Integrasi Drive otomatis BELUM dikonfigurasi (perlu Google OAuth resmi),
 * jadi tidak ada tombol "hubungkan" palsu. Guru mengunduh berkas lalu mengunggahnya manual ke Drive.
 */
export default function BackupPanel() {
  const { instruments, results, exportAll, importAll } = useTeacher();
  const [msg, setMsg] = useState('');

  const restore = async (file) => {
    if (!file) return;
    const r = await readJsonFile(file);
    if (!r.ok) return setMsg(r.error);
    if (!window.confirm('Memulihkan cadangan akan MENGGANTI data Modul Guru di perangkat ini. Lanjutkan?')) return;
    const res = importAll(r.data);
    setMsg(res.ok ? 'Cadangan berhasil dipulihkan.' : res.error);
  };

  return (
    <section className={styles.panel}>
      <h3>Cadangan data</h3>
      <p>
        Data saat ini: {instruments.length} instrumen, {results.length} hasil siswa. Progres belajar siswa di aplikasi tidak ikut terhapus atau
        tergantikan.
      </p>
      <div className={styles.toolbar}>
        <Button onClick={() => downloadFile(`cadangan-modul-guru-${fileSlug('algebra-adventure')}.json`, JSON.stringify(exportAll(), null, 2), 'application/json')}>
          Unduh cadangan (JSON)
        </Button>
        <label className={styles.fileBtn}>
          Pulihkan dari cadangan
          <input type="file" accept="application/json,.json" onChange={(e) => restore(e.target.files?.[0])} aria-label="Pulihkan cadangan dari berkas JSON" />
        </label>
      </div>
      {msg && (
        <p className={styles.info} role="status">
          {msg}
        </p>
      )}

      <h3>Google Drive</h3>
      <p className={styles.info}>
        Status: <strong>belum terhubung</strong>. Koneksi otomatis ke Google Drive memerlukan Google OAuth resmi dan belum dikonfigurasi, jadi
        aplikasi tidak menyimpan atau meminta akun Google.
      </p>
      <ol className={styles.steps}>
        <li>Unduh berkas yang dibutuhkan: cadangan JSON (di atas), rekap CSV, atau laporan PDF (tab Laporan → Cetak / Simpan PDF).</li>
        <li>Buka drive.google.com dengan akun Anda, lalu buat folder, misalnya "Algebra Adventure – Evaluasi".</li>
        <li>Seret berkas ke folder tersebut. Berkas CSV bisa dibuka sebagai Google Spreadsheet.</li>
        <li>Hasil pindaian lembar kerja siswa (foto/PDF) disimpan di folder yang sama, dengan nama file memakai kode siswa (mis. S01-pretest.pdf).</li>
      </ol>
      <p className={styles.meta}>Rancangan integrasi otomatis: docs/GOOGLE_DRIVE_INTEGRATION.md.</p>
    </section>
  );
}
