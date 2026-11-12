import { useNavigate } from 'react-router-dom';
import styles from './PageShell.module.css';

/** Kerangka halaman: bilah atas (kembali + judul) dan area isi yang dibatasi lebarnya. */
export default function PageShell({ title, backTo = '/', actions, children, wide = false }) {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <button type="button" className={styles.back} onClick={() => navigate(backTo)} aria-label="Kembali">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.actions}>{actions}</div>
      </header>
      <main className={[styles.main, wide ? styles.wide : ''].join(' ')}>{children}</main>
    </div>
  );
}
