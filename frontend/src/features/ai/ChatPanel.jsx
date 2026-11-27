import { useEffect, useRef, useState } from 'react';
import { pretty } from '../../components/ui/prettyMath.js';
import { moodFor } from '../../components/tata/tataMood.js';
import { askTata, CLIENT_LIMIT } from '../../services/aiClient.js';
import { useProfile } from '../../store/profileStore.js';
import { useStudents } from '../../store/studentStore.js';
import { chatKey, loadChat, saveChat, clearChat } from './chatHistory.js';
import copy from '../../content/ai.json';
import styles from './AskTata.module.css';

const MAX_CHARS = 300;

/**
 * Isi percakapan Tanya TATA (dipakai jendela di pelajaran & halaman Asisten Belajar).
 * - Riwayat tersimpan selama sesi browser, terpisah per siswa & per topik (historyKey) — lihat chatHistory.js.
 * - Bila AI gagal (koneksi, kuota, server): pesan galat yang jujur + tombol "Coba lagi" yang mengirim ulang
 *   pertanyaan yang sama. Tidak pernah ada jawaban buatan.
 * - Pertanyaan + konteks soal dikirim ke proxy (DeepSeek). Nama panggilan hanya untuk sapaan di layar.
 * onMood(mood): memberi tahu induk ekspresi TATA yang sesuai (berpikir saat memuat, dsb.).
 */
export default function ChatPanel({ historyKey = 'umum', ...props }) {
  const studentId = useStudents((s) => s.activeId);
  const storageKey = chatKey(studentId, historyKey);
  // key: berganti siswa/topik → percakapan dimuat ulang dari kunci yang benar (tidak tercampur)
  return <Conversation key={storageKey} storageKey={storageKey} {...props} />;
}

function Conversation({ storageKey, context, quick = copy.quick, autoFocus = false, onMood, tall = false }) {
  const nickname = useProfile((s) => s.nickname);
  const [saved] = useState(() => loadChat(storageKey));
  const [messages, setMessages] = useState(saved.messages);
  const [used, setUsed] = useState(saved.used);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const alive = useRef(true);
  const left = CLIENT_LIMIT - used;
  // Pertanyaan terakhir belum terjawab (gagal, atau jendela ditutup saat menunggu) → bisa dicoba lagi.
  const unanswered = !loading && messages.length > 0 && messages.at(-1).role === 'user';

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    saveChat(storageKey, { messages, used });
  }, [storageKey, messages, used]);

  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight });
  }, [messages, loading, error]);

  useEffect(() => {
    onMood?.(loading ? moodFor('wrong', { attempt: 2 }) : error ? 'confused' : messages.length ? 'talking' : moodFor('welcome'));
  }, [loading, error, messages.length, onMood]);

  /** Kirim riwayat `history` (diakhiri pertanyaan siswa) ke AI. */
  const ask = async (history) => {
    setError('');
    setLoading(true);
    setUsed((u) => u + 1);
    const r = await askTata(history, context);
    if (!alive.current) {
      // Jendela ditutup saat menunggu: simpan jawaban yang SUDAH diterima agar tidak hilang.
      if (r.ok) saveChat(storageKey, { messages: [...history, { role: 'assistant', content: r.reply }], used: used + 1 });
      return;
    }
    setLoading(false);
    if (r.ok) setMessages([...history, { role: 'assistant', content: r.reply }]);
    else setError(r.error);
  };

  const send = (content) => {
    const q = content.trim().slice(0, MAX_CHARS);
    if (!q || loading || left <= 0) return;
    // Pertanyaan baru setelah pertanyaan yang gagal: pertanyaan yang gagal dibuang agar riwayat tetap berpasangan.
    const base = unanswered ? messages.slice(0, -1) : messages;
    const next = [...base, { role: 'user', content: q }];
    setMessages(next);
    setText('');
    ask(next);
  };

  const retry = () => {
    if (!unanswered || left <= 0) return;
    ask(messages);
  };

  const clear = () => {
    clearChat(storageKey);
    setMessages([]);
    setError('');
  };

  return (
    <div className={[styles.chat, tall ? styles.chatTall : ''].join(' ')}>
      <div className={styles.messages} ref={listRef} aria-live="polite" aria-label="Percakapan dengan TATA">
        {messages.length === 0 && <p className={styles.bubbleTata}>{nickname ? `${copy.hello.replace('{name}', nickname)} ${copy.intro}` : copy.intro}</p>}
        {messages.map((m, i) => (
          <p key={i} className={m.role === 'user' ? styles.bubbleUser : styles.bubbleTata}>
            {pretty(m.content)}
          </p>
        ))}
        {loading && (
          <p className={[styles.bubbleTata, styles.thinking].join(' ')} role="status">
            {copy.thinking}
            <span className={styles.dots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </p>
        )}
        {unanswered && (
          <div className={styles.error} role="alert">
            <p>{error || copy.unanswered}</p>
            {left > 0 && (
              <button type="button" className={styles.retry} onClick={retry}>
                ↻ {copy.retry}
              </button>
            )}
          </div>
        )}
      </div>

      {left > 0 ? (
        <>
          <div className={styles.quick} aria-label="Pertanyaan cepat">
            {quick.map((q) => (
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
        </>
      ) : (
        <p className={styles.error}>{copy.limitReached}</p>
      )}
      <p className={styles.small}>
        {left > 0 && <>{copy.remaining.replace('{n}', left)} · </>}
        {copy.caution}
        {messages.length > 0 && !loading && (
          <>
            {' '}
            <button type="button" className={styles.clear} onClick={clear}>
              {copy.clear}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
