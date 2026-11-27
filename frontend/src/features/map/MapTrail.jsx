import { useLayoutEffect, useState } from 'react';
import styles from './MapTrail.module.css';

/**
 * Jalan setapak berkelok yang menghubungkan pulau (kiri ↔ kanan bergantian), di BELAKANG kartu pulau.
 * Menggantikan garis lurus di tengah layar. Titik-titiknya diukur dari posisi pulau yang sebenarnya
 * (ResizeObserver), jadi jalan selalu tepat melewati tiap pulau di HP maupun laptop.
 * Bagian yang sudah dilalui (pulau lulus) berwarna kuning cerah.
 */
export default function MapTrail({ listRef, completed = 0 }) {
  const [geo, setGeo] = useState(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const measure = () => {
      const box = list.getBoundingClientRect();
      const pts = [...list.children].map((li) => {
        const el = li.firstElementChild ?? li;
        const r = el.getBoundingClientRect();
        return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2];
      });
      setGeo({ w: box.width, h: box.height, pts });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [listRef]);

  if (!geo || geo.pts.length < 2) return null;
  const { w, h, pts } = geo;
  const seg = (a, b) => {
    const midY = (a[1] + b[1]) / 2;
    return `C ${a[0]} ${midY}, ${b[0]} ${midY}, ${b[0]} ${b[1]}`;
  };
  const pathTo = (n) => `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1, n + 1).map((p, i) => seg(pts[i], p)).join(' ');
  const full = pathTo(pts.length - 1);
  const doneUpTo = Math.min(completed, pts.length - 1);

  return (
    <svg className={styles.trail} data-trail="" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
      <path d={full} className={styles.road} />
      {doneUpTo > 0 && <path d={pathTo(doneUpTo)} className={styles.roadDone} />}
      <path d={full} className={styles.dashes} />
    </svg>
  );
}
