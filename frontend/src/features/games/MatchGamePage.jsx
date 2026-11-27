import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import MathText from '../../components/ui/MathText.jsx';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import { sfx, sayTata } from '../../audio/index.js';
import RewardBurst from '../../components/reward/RewardBurst.jsx';
import { useProfile } from '../../store/profileStore.js';
import { makePairs, pick } from './questionBank.js';
import styles from './Games.module.css';

const PAIRS = 6;

/** Kartu acak: setiap pasangan menjadi 2 kartu (bentuk penjumlahan & bentuk faktor). */
function deal() {
  const pairs = makePairs(Math.random, PAIRS);
  const cards = pairs.flatMap((p) => [
    { key: `${p.id}-e`, pair: p.id, side: 'expanded', text: p.expanded },
    { key: `${p.id}-f`, pair: p.id, side: 'factored', text: p.factored },
  ]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/**
 * Pasangkan Ekspresi: ketuk satu kartu, lalu ketuk pasangannya (bentuk penjumlahan ↔ bentuk faktor).
 * Pasangan benar menyala hijau; salah → kartu bergoyang dan TATA memberi petunjuk. Bisa dengan keyboard.
 */
export default function MatchGamePage() {
  const recordGame = useProfile((s) => s.recordGame);
  const best = useProfile((s) => s.games?.pasangkan?.best ?? 0);
  const [cards, setCards] = useState(deal);
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [moves, setMoves] = useState(0);
  const [msg, setMsg] = useState('Ketuk satu kartu, lalu ketuk pasangannya.');
  const [done, setDone] = useState(null);

  const restart = () => {
    setCards(deal());
    setSelected(null);
    setMatched([]);
    setWrong([]);
    setMoves(0);
    setDone(null);
    setMsg('Ketuk satu kartu, lalu ketuk pasangannya.');
  };

  const tap = (card) => {
    if (done || matched.includes(card.pair)) return;
    if (!selected) return setSelected(card);
    if (selected.key === card.key) return setSelected(null);
    setMoves((m) => m + 1);
    if (selected.pair === card.pair) {
      const next = [...matched, card.pair];
      setMatched(next);
      setSelected(null);
      sfx('correct');
      setMsg('Cocok! Kalikan kembali: hasilnya sama dengan bentuk penjumlahannya.');
      if (next.length === PAIRS) {
        // skor: 6 pasangan, bonus bila langkah sedikit; XP maks 15
        const score = Math.max(1, PAIRS * 2 - Math.max(0, moves + 1 - PAIRS));
        const xp = Math.min(15, Math.round(score * 1.25));
        recordGame('pasangkan', score, PAIRS * 2, xp);
        setDone({ score, xp, moves: moves + 1 });
        sfx('victory');
        setTimeout(() => sayTata('levelComplete', { force: true }), 1800);
      }
    } else {
      setWrong([selected.key, card.key]);
      setTimeout(() => setWrong([]), 600);
      setSelected(null);
      sfx('tryAgain');
      setMsg(
        selected.side === card.side
          ? 'Dua kartu itu sejenis. Pasangkan bentuk penjumlahan dengan bentuk faktor, ya.'
          : pick(Math.random, ['Coba kalikan bentuk faktornya. Hasilnya sama?', 'Cari FPB-nya dulu, lalu cocokkan.', 'Ingat a² − b² = (a + b)(a − b).']),
      );
    }
  };

  return (
    <AppLayout title="Pasangkan Ekspresi" icon="puzzle" wide>
      <div className={styles.hud} aria-live="polite">
        <span>
          Pasangan <strong>{matched.length}</strong>/{PAIRS}
        </span>
        <span>
          Langkah <strong>{moves}</strong>
        </span>
        {best > 0 && <span>Rekor {best}</span>}
      </div>
      <div className={styles.matchGrid} role="group" aria-label="Kartu ekspresi">
        {cards.map((c) => {
          const isMatched = matched.includes(c.pair);
          return (
            <button
              key={c.key}
              type="button"
              className={[
                styles.matchCard,
                c.side === 'factored' ? styles.factoredCard : '',
                selected?.key === c.key ? styles.selectedCard : '',
                isMatched ? styles.matchedCard : '',
                wrong.includes(c.key) ? styles.shake : '',
              ].join(' ')}
              onClick={() => tap(c)}
              aria-pressed={selected?.key === c.key}
              aria-label={`${c.side === 'factored' ? 'Bentuk faktor' : 'Bentuk penjumlahan'} ${c.text}${isMatched ? ', sudah cocok' : ''}`}
              disabled={isMatched}
            >
              <MathText size="large">{c.text}</MathText>
            </button>
          );
        })}
      </div>
      {done && <RewardBurst xp={done.xp} showStars={false} />}
      <div className={styles.feedback}>
        <span className={styles.fbTata}>
          <Tata state={done ? 'proud' : wrong.length ? 'thinking' : 'talking'} size="sm" />
        </span>
        <SpeechBubble tone={done ? 'happy' : 'neutral'}>{done ? `Semua cocok dalam ${done.moves} langkah! Skor ${done.score}, +${done.xp} XP.` : msg}</SpeechBubble>
      </div>
      <div className={styles.row}>
        <Button onClick={restart} variant={done ? 'primary' : 'secondary'}>
          {done ? 'Main lagi' : 'Acak ulang'}
        </Button>
        <Button variant="secondary" to="/game">
          Pilih game lain
        </Button>
      </div>
    </AppLayout>
  );
}
