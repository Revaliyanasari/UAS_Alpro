import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import NavMenu from './NavMenu.jsx';
import styles from './Nav.module.css';

/**
 * Tombol menu titik tiga (⋮) + panel navigasi (drawer) yang meluncur dari kiri.
 * Dipakai di semua halaman siswa (peta, pelajaran, kuis, dan tata letak AppLayout di HP).
 * compact: hanya ikon (tetap punya aria-label) untuk header sempit seperti pelajaran/kuis.
 */
export default function MenuButton({ compact = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]); // tutup saat berpindah halaman

  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.querySelector('a')?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={[styles.menuBtn, compact ? styles.menuBtnCompact : '', className].join(' ')}
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon name="more" size={22} />
        {!compact && <span>Menu</span>}
      </button>
      {/* Portal ke <body>: drawer selalu di atas, walau tombolnya ada di header yang punya z-index sendiri (mis. peta) */}
      {open &&
        createPortal(
        <div className={styles.drawerBackdrop} onClick={() => setOpen(false)}>
          <aside
            ref={panelRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Menu utama"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className={styles.drawerClose} onClick={() => setOpen(false)} aria-label="Tutup menu">
              <Icon name="close" size={22} />
            </button>
            <NavMenu onNavigate={() => setOpen(false)} />
          </aside>
        </div>,
          document.body,
        )}
    </>
  );
}
