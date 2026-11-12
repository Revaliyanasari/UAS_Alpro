import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import styles from './lesson.module.css';

/**
 * TATA kecil + balon kata + tombol petunjuk bertahap (3 tingkat).
 * Petunjuk tidak mengurangi poin. Pesan umpan balik ditampilkan di balon yang sama.
 */
export default function TataCoach({ message, tone = 'neutral', hints = [], hintLevel, onHint }) {
  const tataState = tone === 'happy' ? 'happy' : tone === 'confused' ? 'confused' : 'talking';
  const shown = hintLevel > 0 ? hints[hintLevel - 1] : null;
  return (
    <div className={styles.coach}>
      <Tata state={tataState} size="sm" />
      <div className={styles.coachBody}>
        {(message || shown) && (
          <SpeechBubble tone={tone === 'neutral' ? 'neutral' : tone}>
            {message && <span>{message} </span>}
            {shown && (
              <span className={styles.hint}>
                💡 {pretty(shown)}
              </span>
            )}
          </SpeechBubble>
        )}
        {hints.length > 0 && (
          <button type="button" className={styles.hintBtn} onClick={onHint} disabled={hintLevel >= hints.length}>
            💡 Minta petunjuk ({hintLevel}/{hints.length})
          </button>
        )}
      </div>
    </div>
  );
}
