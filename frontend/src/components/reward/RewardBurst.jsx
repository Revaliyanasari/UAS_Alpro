import styles from './RewardBurst.module.css';

/**
 * Animasi penghargaan: bintang muncul satu per satu + "+N XP" melayang naik, dengan percikan kecil.
 * - Hanya CSS (transform/opacity) → ringan; berjalan sekali (±1,5 dtk) lalu diam di posisi akhir.
 * - pointer-events: none → tidak pernah menghalangi tombol; tidak memblokir lanjut belajar.
 * - Dekoratif (aria-hidden): angka XP & bintang tetap tertulis sebagai teks di halaman hasil.
 * - "Kurangi animasi" (Pengaturan / sistem) → tampil langsung tanpa gerak.
 * stars: jumlah bintang diraih (0–3) dari max; xp: XP yang didapat (0 = tidak ditampilkan).
 */
export default function RewardBurst({ stars = 0, max = 3, xp = 0, showStars = true }) {
  if (!xp && !stars) return null;
  return (
    <div className={styles.burst} aria-hidden="true" data-reward="">
      <span className={styles.sparkles}>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} style={{ '--i': i }} />
        ))}
      </span>
      {showStars && (
        <span className={styles.stars}>
          {Array.from({ length: max }, (_, i) => (
            <svg key={i} viewBox="0 0 24 24" className={i < stars ? styles.starOn : styles.starOff} style={{ '--d': `${0.25 + i * 0.28}s` }}>
              <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" />
            </svg>
          ))}
        </span>
      )}
      {xp > 0 && <span className={styles.xp}>+{xp} XP</span>}
    </div>
  );
}
