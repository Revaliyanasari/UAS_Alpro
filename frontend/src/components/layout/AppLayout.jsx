import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import NavMenu from './NavMenu.jsx';
import MenuButton from './MenuButton.jsx';
import AudioButton from '../../audio/AudioButton.jsx';
import { categoryOf } from './menu.js';
import { useSettings } from '../../store/settingsStore.js';
import MathDecor from './MathDecor.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import styles from './Nav.module.css';

/**
 * Tata letak halaman hub siswa:
 *  - Laptop (≥ 1024 px): sidebar menu yang bisa dibuka/ditutup (pilihan tersimpan).
 *  - HP/tablet: tombol ⋮ Menu membuka drawer.
 *  - Bilah atas: judul halaman (warna kategori), tombol suara, dan Pengaturan (ikon gear + label).
 */
export default function AppLayout({ title, icon, children, wide = false, decor = true }) {
  const { pathname } = useLocation();
  const cat = categoryOf(pathname);
  const sidebarOpen = useSettings((s) => s.sidebarOpen);
  const setSetting = useSettings((s) => s.setSetting);
  // Sidebar hanya dirender di laptop (≥ 1024 px); di HP/tablet menu memakai drawer (tidak ada tautan ganda).
  const desktop = useMediaQuery('(min-width: 1024px)');
  const showSidebar = desktop && sidebarOpen;

  return (
    <div className={[styles.app, showSidebar ? styles.withSidebar : ''].join(' ')}>
      {showSidebar && (
        <aside className={styles.sidebar} aria-label="Navigasi samping">
          <NavMenu />
        </aside>
      )}
      <div className={[styles.page, styles[`page-${cat}`], decor ? styles.decor : ''].join(' ')}>
        <header className={styles.top}>
          {!showSidebar && <MenuButton />}
          {desktop && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setSetting({ sidebarOpen: !sidebarOpen })}
            aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
            aria-pressed={sidebarOpen}
          >
            <Icon name="sidebar" size={22} />
          </button>
          )}
          <h1 className={styles.title}>
            {icon && (
              <span className={styles.titleIcon}>
                <Icon name={icon} size={22} />
              </span>
            )}
            {title}
          </h1>
          <AudioButton className={styles.iconBtn} />
          <Link to="/pengaturan" className={styles.settingsLink} aria-label="Pengaturan">
            <Icon name="gear" size={22} />
            <span className={styles.settingsLabel}>Pengaturan</span>
          </Link>
        </header>
        {decor && <MathDecor />}
        <main className={[styles.main, wide ? styles.mainWide : ''].join(' ')}>{children}</main>
      </div>
    </div>
  );
}
