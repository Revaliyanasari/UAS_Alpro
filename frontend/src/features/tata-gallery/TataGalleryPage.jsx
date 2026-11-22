import { useState } from 'react';
import PageShell from '../../components/ui/PageShell.jsx';
import Tata2D from '../../components/tata/Tata2D.jsx';
import { EXPRESSION_ORDER } from '../../components/tata/tataExpressions.js';
import copy from '../../content/tata-expressions.json';
import { sfx } from '../../audio/index.js';
import styles from './TataGalleryPage.module.css';

// Ekspresi tenang/sedih memakai bunyi TATA yang lembut.
const SOFT = new Set(['sad', 'disappointed', 'sleepy', 'confused', 'shy', 'calm', 'focused', 'thinking']);

/**
 * Galeri Ekspresi TATA: 18 ekspresi orisinal (SVG). Ketuk kartu untuk melihat versi besar yang bergerak,
 * beserta keterangan kapan ekspresi itu muncul saat belajar. Kartu kecil sengaja diam agar tidak ramai.
 */
export default function TataGalleryPage() {
  const [selected, setSelected] = useState('wave');
  const info = copy.expressions[selected];

  return (
    <PageShell title={copy.title} backTo="/pengaturan" wide>
      <p className={styles.intro}>{copy.intro}</p>
      <section className={styles.preview} aria-live="polite" aria-label={`Ekspresi terpilih: ${info.name}`}>
        <div className={styles.previewArt}>
          <Tata2D key={selected} state={selected} label={`TATA ${info.name}`} />
        </div>
        <div className={styles.previewText}>
          <h2>{info.name}</h2>
          <p className={styles.desc}>“{info.desc}”</p>
          <p className={styles.when}>
            <strong>Kapan muncul:</strong> {info.when}
          </p>
        </div>
      </section>
      <ul className={styles.grid} aria-label="Daftar ekspresi TATA">
        {EXPRESSION_ORDER.map((id, i) => (
          <li key={id}>
            <button
              type="button"
              className={[styles.card, id === selected ? styles.active : ''].join(' ')}
              onClick={() => {
                setSelected(id);
                sfx(SOFT.has(id) ? 'tataSoft' : 'tataHello');
              }}
              aria-pressed={id === selected}
              aria-label={`${i + 1}. ${copy.expressions[id].name}`}
            >
              <span className={styles.art} aria-hidden="true">
                <Tata2D state={id} label="" />
              </span>
              <span className={styles.name}>
                {i + 1}. {copy.expressions[id].name}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className={styles.note}>💚 {copy.note}</p>
    </PageShell>
  );
}
