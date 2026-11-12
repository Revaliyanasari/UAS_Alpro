import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdatePrompt.module.css';

// Mendaftarkan service worker (agar aplikasi bisa dipasang & dibuka offline)
// dan menampilkan pemberitahuan saat versi baru tersedia. Siswa yang memilih kapan memuat ulang,
// sehingga pengerjaan tes tidak terpotong.
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  // Info "siap offline" cukup tampil sebentar; info versi baru tetap tampil sampai dipilih.
  useEffect(() => {
    if (!offlineReady) return undefined;
    const t = setTimeout(() => setOfflineReady(false), 6000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className={styles.banner} role="status">
      {needRefresh ? (
        <>
          <span>Versi baru tersedia.</span>
          <button type="button" onClick={() => updateServiceWorker(true)}>
            Muat ulang
          </button>
          <button type="button" onClick={() => setNeedRefresh(false)}>
            Nanti
          </button>
        </>
      ) : (
        <>
          <span>Aplikasi siap dipakai tanpa internet.</span>
          <button type="button" onClick={() => setOfflineReady(false)}>
            Oke
          </button>
        </>
      )}
    </div>
  );
}
