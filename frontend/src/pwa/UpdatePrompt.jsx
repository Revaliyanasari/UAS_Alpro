import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdatePrompt.module.css';

// Halaman tempat siswa sedang mengerjakan sesuatu: jangan dimuat ulang tiba-tiba.
const BUSY = /\/(belajar|kuis|game\/)/;
const isBusy = () => BUSY.test(window.location.pathname);
const CHECK_EVERY_MS = 30 * 60 * 1000;

/**
 * Pembaruan aplikasi (PWA).
 * Setelah deploy, service worker baru langsung aktif (skipWaiting di vite.config.js), lalu:
 *  - di halaman biasa (beranda, peta, materi, …): aplikasi langsung dimuat ulang ke versi terbaru;
 *  - saat pelajaran/kuis/game: muat ulang DITUNDA sampai siswa keluar dari aktivitas, dengan pemberitahuan
 *    dan tombol "Perbarui sekarang" — jawaban yang sedang dikerjakan tidak terpotong.
 * Pembaruan juga diperiksa saat aplikasi dibuka lagi dari latar belakang (PWA di HP jarang dimuat ulang).
 * Data siswa (localStorage/IndexedDB) tidak disentuh — hanya file aplikasi yang diganti.
 * Pemberitahuan melayang di lapisan teratas (--z-toast) agar tidak tertutup latar halaman.
 */
export default function UpdatePrompt() {
  const { pathname } = useLocation();
  const [pending, setPending] = useState(false);
  const [hidden, setHidden] = useState(false); // "Nanti": sembunyikan pemberitahuan; pembaruan tetap dipasang saat keluar
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onNeedReload() {
      if (isBusy()) setPending(true);
      else window.location.reload();
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const check = () => {
        if (document.visibilityState === 'visible' && navigator.onLine !== false) registration.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', check);
      setInterval(check, CHECK_EVERY_MS);
    },
  });

  // Versi baru sudah aktif & siswa meninggalkan pelajaran/kuis/game → pasang sekarang.
  useEffect(() => {
    if (pending && !BUSY.test(pathname)) window.location.reload();
  }, [pending, pathname]);

  // Info "siap offline" cukup tampil sebentar.
  useEffect(() => {
    if (!offlineReady) return undefined;
    const t = setTimeout(() => setOfflineReady(false), 6000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if ((!pending || hidden) && !offlineReady) return null;

  return (
    <div className={[styles.banner, pending && !hidden ? '' : styles.passive].join(' ')} role="status">
      {pending && !hidden ? (
        <>
          <span>Versi baru Algebra Adventure siap. Akan dipasang setelah kamu selesai di halaman ini.</span>
          <button type="button" onClick={() => window.location.reload()}>
            Perbarui sekarang
          </button>
          <button type="button" onClick={() => setHidden(true)}>
            Nanti
          </button>
        </>
      ) : (
        <>
          <span>Aplikasi siap dipakai tanpa internet.</span>
        </>
      )}
    </div>
  );
}
