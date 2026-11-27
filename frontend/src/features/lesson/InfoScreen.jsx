import { useState } from 'react';
import MathText from '../../components/ui/MathText.jsx';
import Button from '../../components/ui/Button.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import StoryCard from './StoryCard.jsx';
import styles from './lesson.module.css';

/**
 * Layar penjelasan ('info') atau contoh bertahap ('example').
 * Pada contoh, langkah muncul satu per satu saat siswa mengetuk — tidak ada perpindahan otomatis.
 * badge: label tahap (mis. "Lantai 2 dari 4" di Menara Tantangan, "Misi 1 · Menalar" di Petualangan Literasi).
 * story/known/asked: kartu cerita kontekstual (Petualangan Literasi).
 */
export default function InfoScreen({ screen, onDone }) {
  const steps = screen.steps ?? [];
  const [shown, setShown] = useState(steps.length ? 1 : 0);
  const allShown = shown >= steps.length;

  const reveal = () => {
    const next = shown + 1;
    setShown(next);
    if (next >= steps.length) onDone({ firstTry: true });
  };

  return (
    <div className={styles.screenBody}>
      {screen.badge && <p className={styles.stageBadge}>{screen.badge}</p>}
      <StoryCard story={screen.story} known={screen.known} asked={screen.asked} />
      {screen.math && (
        <p className={styles.bigMath}>
          {/^[A-Za-z]{3}/.test(screen.math) ? pretty(screen.math) : <MathText size="large">{screen.math}</MathText>}
        </p>
      )}
      {screen.text && <p className={styles.text}>{pretty(screen.text)}</p>}
      {steps.length > 0 && (
        <>
          <ol className={styles.steps}>
            {steps.slice(0, shown).map((s) => (
              <li key={s}>{pretty(s)}</li>
            ))}
          </ol>
          {!allShown && (
            <Button variant="secondary" block onClick={reveal}>
              Langkah berikutnya ({shown}/{steps.length})
            </Button>
          )}
        </>
      )}
    </div>
  );
}
