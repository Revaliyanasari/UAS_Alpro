import { useEffect } from 'react';
import Tata from '../../components/tata/Tata.jsx';
import { sfx, sayTata, useVoiceStatus } from '../../audio/index.js';
import { tataVoice } from '../../audio/voice.js';
import { useSettings } from '../../store/settingsStore.js';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import { moodFromTone } from '../../components/tata/tataMood.js';
import styles from './lesson.module.css';

/**
 * TATA kecil + balon kata + tombol petunjuk bertahap (3 tingkat).
 * Petunjuk tidak mengurangi poin. Pesan umpan balik ditampilkan di balon yang sama.
 * mood: ekspresi TATA (lihat components/tata/tataMood.js).
 */
export default function TataCoach({ message, tone = 'neutral', mood, focus, hints = [], hintLevel, onHint }) {
  const shown = hintLevel > 0 ? hints[hintLevel - 1] : null;
  // Ekspresi dari situasi belajar (mood); bila tidak ada, diturunkan dari nada umpan balik.
  const tataState = mood ?? moodFromTone(tone, Boolean(shown));
  // Suara mengikuti respons TATA: ceria saat benar, lembut saat belum tepat (tidak menghukum).
  useEffect(() => {
    if (!message) return;
    if (tone === 'happy') sfx('correct');
    else if (tone === 'confused') sfx('tryAgain');
    else return undefined;
    // Suara TATA menyusul bunyi efek (dengan jeda per situasi agar tidak berulang-ulang).
    const t = setTimeout(() => sayTata(tone === 'happy' ? 'correct' : 'wrong'), 350);
    return () => clearTimeout(t);
  }, [message, tone]);
  // Tombol "Dengar": TATA membacakan pesan & petunjuk yang sedang tampil.
  const voiceOn = useSettings((s) => s.voiceOn);
  const canSpeak = useVoiceStatus() === 'ready' && voiceOn;
  const spoken = [message, focus && `${focus.label}: ${focus.text}`, shown && `Petunjuk: ${pretty(shown)}`].filter((t) => typeof t === 'string' && t).join('. ');
  return (
    <div className={styles.coach}>
      <Tata state={tataState} size="sm" />
      <div className={styles.coachBody}>
        {(message || shown || focus) && (
          <SpeechBubble tone={tone === 'neutral' ? 'neutral' : tone}>
            {message && <span>{message} </span>}
            {focus && (
              <span className={styles.focus}>
                {focus.icon} <strong>{focus.label}:</strong> {focus.text}
              </span>
            )}
            {shown && (
              <span className={styles.hint}>
                💡 {pretty(shown)}
              </span>
            )}
          </SpeechBubble>
        )}
        {canSpeak && spoken && (
          <button type="button" className={styles.hintBtn} onClick={() => tataVoice.speak(spoken, { force: true })} aria-label="Dengarkan TATA membacakan pesan ini">
            🔊 Dengar
          </button>
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
