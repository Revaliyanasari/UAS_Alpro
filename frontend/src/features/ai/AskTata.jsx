import { useEffect, useRef, useState } from 'react';
import Tata from '../../components/tata/Tata.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import { moodFor } from '../../components/tata/tataMood.js';
import { askTata, CLIENT_LIMIT } from '../../services/aiClient.js';
import { useSettings } from '../../store/settingsStore.js';
import { useAiStatus } from './useAiStatus.js';
import copy from '../../content/ai.json';
import styles from './AskTata.module.css';

const MAX_CHARS = 300;

/**
 * Tombol + panel "Tanya TATA" (AI Learning Assistant). Hanya tampil bila server AI aktif
 * dan siswa tidak mematikannya di Pengaturan — tidak ada tombol palsu (CLAUDE.md aturan 3).
 * context: { worldName, topic, task, phase } — tanpa data pribadi siswa.
 */
export default function AskTata({ context }) {
  const status = useAiStatus();
  const aiEnabled = useSettings((s) => s.aiEnabled);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [used, setUsed] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  if (!status?.enabled || !aiEnabled) return null;

  const left = CLIENT_LIMIT - used;

  const send = async (content) => {
    const q = content.trim().slice(0, MAX_CHARS);
    if (!q || loading || left <= 0) return;
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setText('');
    setError('');
    setLoading(true);
    setUsed((u) => u + 1);
    const r = await askTata(next, context);
    setLoading(false);
    if (r.ok) setMessages([...next, { role: 'assistant', content: r.reply }]);
    else setError(r.error);
  };

  const mood = loading ? moodFor('wrong', { attempt: 2 }) : error ? 'confused' : messages.length ? 'talking' : moodFor('welcome');

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span aria-hidden="true">💬</span> {copy.button}
      </button>
      {open && (
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

            <div className={styles.messages} ref={listRef} aria-live="polite">
              {messages.length === 0 && <p className={styles.bubbleTata}>{copy.intro}</p>}
              {messages.map((m, i) => (
                <p key={i} className={m.role === 'user' ? styles.bubbleUser : styles.bubbleTata}>
                  {pretty(m.content)}
                </p>
              ))}
              {loading && <p className={styles.bubbleTata}>{copy.thinking}</p>}
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
            </div>

            {left > 0 ? (
              <>
                <div className={styles.quick} aria-label="Pertanyaan cepat">
                  {copy.quick.map((q) => (
                    <button key={q} type="button" onClick={() => send(q)} disabled={loading}>
                      {q}
                    </button>
                  ))}
                </div>
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(text);
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder={copy.placeholder}
                    aria-label="Pertanyaan untuk TATA"
                    rows={2}
                    disabled={loading}
                  />
                  <button type="submit" className={styles.send} disabled={loading || !text.trim()}>
                    {copy.send}
                  </button>
                </form>
                <p className={styles.small}>
                  {copy.remaining.replace('{n}', left)} · {copy.caution}
                </p>
              </>
            ) : (
              <p className={styles.error}>{copy.limitReached}</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
