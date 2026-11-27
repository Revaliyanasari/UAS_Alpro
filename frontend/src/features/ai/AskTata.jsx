import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import Tata from '../../components/tata/Tata.jsx';
import { useSettings } from '../../store/settingsStore.js';
import { useAiStatus } from './useAiStatus.js';
import ChatPanel from './ChatPanel.jsx';
import copy from '../../content/ai.json';
import styles from './AskTata.module.css';

/**
 * Tombol + jendela "Tanya TATA" di layar pelajaran. Hanya tampil bila server AI aktif
 * dan siswa tidak mematikannya di Pengaturan — tidak ada tombol palsu (CLAUDE.md aturan 3).
 * context: { worldName, topic, task, phase } — tanpa data pribadi siswa.
 */
export default function AskTata({ context }) {
  const status = useAiStatus();
  const aiEnabled = useSettings((s) => s.aiEnabled);
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState('wave');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!status?.enabled || !aiEnabled) return null;

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span aria-hidden="true">💬</span> {copy.button}
      </button>
      {open &&
        createPortal(
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="ask-tata-title" onClick={(e) => e.stopPropagation()}>
            <header className={styles.head}>
              <span className={styles.avatar}>
                <Tata state={mood} size="sm" />
              </span>
              <div>
                <h2 id="ask-tata-title">{copy.title}</h2>
                <p className={styles.small}>{copy.privacy}</p>
              </div>
              <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Tutup Tanya TATA">
                ✕
              </button>
            </header>
            <ChatPanel historyKey={`pelajaran-${context?.worldName ?? 'umum'}`} context={context} autoFocus onMood={setMood} />
          </section>
        </div>,
          document.body,
        )}
    </>
  );
}
