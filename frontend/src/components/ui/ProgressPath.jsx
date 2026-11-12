import styles from './ProgressPath.module.css';

/** Bilah progres bergaya jalan setapak. value dari 0 sampai max. */
export default function ProgressPath({ value, max, label = 'Kemajuan' }) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(Math.max(0, value), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);
  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={`${clamped} dari ${safeMax}`}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.count}>
        {clamped}/{safeMax}
      </span>
    </div>
  );
}
