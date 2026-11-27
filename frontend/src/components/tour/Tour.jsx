import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Tata from '../tata/Tata.jsx';
import styles from './Tour.module.css';

const GAP = 12; // jarak kartu dari target
const MARGIN = 12; // jarak minimum kartu dari tepi layar

/** Elemen target pertama yang TERLIHAT untuk selector (mis. "Buka menu" di HP, sidebar di laptop). */
function findTarget(selector) {
  if (!selector) return null;
  for (const el of document.querySelectorAll(selector)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/** Ada dialog modal lain yang terbuka? Tur mengalah (disembunyikan) agar tidak pernah menutupi modal. */
const modalOpen = () => Boolean(document.querySelector('[aria-modal="true"]:not([data-tour-card])'));

/**
 * Tur singkat: lingkaran sorot di sekitar target + kartu penjelasan TATA.
 *  - Bisa ditutup (✕ / Esc), dilewati ("Lewati tur"), dan diulang (dari Beranda & Pengaturan).
 *  - Kartu ditempatkan di bawah/atas target dan selalu di dalam layar; di HP sempit menjadi lembar bawah.
 *  - Lapisan sorot tidak menangkap klik (pointer-events: none) sehingga tombol penting tetap bisa dipakai.
 *  - Saat ada modal lain terbuka (menu, suara, Tanya TATA), tur disembunyikan sampai modal ditutup.
 */
export default function Tour({ steps, onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [pos, setPos] = useState(null);
  const [hidden, setHidden] = useState(modalOpen);
  const cardRef = useRef(null);
  const step = steps[index];
  const last = index === steps.length - 1;

  const finish = useCallback(() => onClose?.(), [onClose]);

  // Ukur target & tempatkan kartu (ulang saat resize/scroll).
  const place = useCallback(() => {
    const target = findTarget(step.target);
    const r = target ? target.getBoundingClientRect() : null;
    setRect(r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
    const card = cardRef.current;
    if (!card) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    if (!r || vw < 520) {
      setPos(null); // tanpa target / layar sempit: kartu menempel di bawah (CSS .sheet)
      return;
    }
    const below = r.bottom + GAP + ch <= vh - MARGIN;
    const top = below ? r.bottom + GAP : Math.max(MARGIN, r.top - GAP - ch);
    const left = Math.min(Math.max(MARGIN, r.left + r.width / 2 - cw / 2), vw - cw - MARGIN);
    setPos({ top, left });
  }, [step.target]);

  // Gulir target ke tengah saat langkah berganti, lalu ukur.
  useLayoutEffect(() => {
    const target = findTarget(step.target);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    place();
    const t = setTimeout(place, 350); // setelah gulir halus selesai
    return () => clearTimeout(t);
  }, [place, step.target]);

  useEffect(() => {
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [place]);

  // Sembunyikan saat modal lain muncul (MutationObserver pada <body>).
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined;
    const mo = new MutationObserver(() => setHidden(modalOpen()));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (hidden) return undefined;
    cardRef.current?.querySelector('[data-primary]')?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hidden, index, finish]);

  if (hidden) return null;

  const pad = 6;
  return createPortal(
    <div className={styles.layer}>
      {rect ? (
        <div
          className={styles.spot}
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
          aria-hidden="true"
        />
      ) : (
        <div className={styles.dim} aria-hidden="true" />
      )}
      <section
        ref={cardRef}
        className={[styles.card, pos ? '' : styles.sheet].join(' ')}
        style={pos ? { top: pos.top, left: pos.left } : undefined}
        role="dialog"
        aria-modal="false"
        data-tour-card=""
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
      >
        <header className={styles.head}>
          <span className={styles.avatar} aria-hidden="true">
            <Tata state={step.mood ?? 'wave'} size="sm" />
          </span>
          <div>
            <p className={styles.count}>
              Langkah {index + 1} dari {steps.length}
            </p>
            <h2 id="tour-title">{step.title}</h2>
          </div>
          <button type="button" className={styles.close} onClick={finish} aria-label="Tutup tur">
            ✕
          </button>
        </header>
        <p id="tour-text" className={styles.text}>
          {step.text}
        </p>
        <div className={styles.dots} aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.title} className={i === index ? styles.dotOn : ''} />
          ))}
        </div>
        <footer className={styles.actions}>
          {!last && (
            <button type="button" className={styles.skip} onClick={finish}>
              Lewati tur
            </button>
          )}
          <span className={styles.spacer} />
          {index > 0 && (
            <button type="button" className={styles.back} onClick={() => setIndex(index - 1)}>
              Kembali
            </button>
          )}
          <button type="button" className={styles.next} data-primary="" onClick={() => (last ? finish() : setIndex(index + 1))}>
            {last ? 'Selesai' : 'Lanjut'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
