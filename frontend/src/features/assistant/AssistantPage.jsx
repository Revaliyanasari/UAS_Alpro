import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Tata from '../../components/tata/Tata.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import ChatPanel from '../ai/ChatPanel.jsx';
import { useAiStatus } from '../ai/useAiStatus.js';
import { useSettings } from '../../store/settingsStore.js';
import copy from '../../content/ai.json';
import styles from './Assistant.module.css';

// Topik yang bisa dipilih (dikirim sebagai konteks agar jawaban TATA sesuai materi).
const TOPICS = [
  { id: 'umum', label: 'Aljabar umum', worldName: '', quick: copy.quick },
  { id: 'w1', label: 'Koefisien, suku & FPB', worldName: 'Lembah Aljabar', quick: ['Apa bedanya koefisien dan konstanta?', 'Bagaimana mencari FPB dari 12x² dan 18x?', 'Kenapa 8x² : 4x = 2x?'] },
  { id: 'w2', label: 'Pemfaktoran FPB', worldName: 'Gua Rahasia Pemfaktoran', quick: ['Apa langkah memfaktorkan 6x² + 9x?', 'Bagaimana cara mengecek hasil pemfaktoran?', 'Beri contoh pemfaktoran dalam kehidupan sehari-hari.'] },
  { id: 'w3', label: 'Selisih dua kuadrat', worldName: 'Kepulauan Kuadrat', quick: ['Kenapa a² − b² = (a + b)(a − b)?', 'Bagaimana memfaktorkan x² − 49?', 'Apakah x² + 9 bisa difaktorkan?'] },
  { id: 'w4', label: 'Strategi soal tantangan', worldName: 'Menara Tantangan', quick: ['Kapan memakai FPB dan kapan memakai a² − b²?', 'Bagaimana memfaktorkan 2x² − 18 sampai lengkap?', 'Bagaimana mencari panjang jika luas dan lebar diketahui?'] },
  { id: 'w5', label: 'Literasi & soal cerita', worldName: 'Petualangan Literasi', quick: ['Bagaimana memilah yang diketahui dan ditanya?', 'Bagaimana mengubah cerita menjadi bentuk aljabar?', 'Bagaimana menilai apakah jawabanku masuk akal?'] },
];

/** Halaman Asisten Belajar (Tanya TATA). Integrasi DeepSeek lewat proxy yang sudah ada. */
export default function AssistantPage() {
  const status = useAiStatus();
  const aiEnabled = useSettings((s) => s.aiEnabled);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [mood, setMood] = useState('wave');
  const ready = status?.enabled && aiEnabled;

  return (
    <AppLayout title="Asisten Belajar" icon="chat" wide>
      <section className={styles.hero}>
        <span className={styles.heroTata}>
          <Tata state={ready ? mood : status ? 'confused' : 'thinking'} size="md" />
        </span>
        <div>
          <h2>Tanya TATA</h2>
          <p>TATA membantumu berpikir langkah demi langkah dengan pertanyaan pemantik, bukan memberi jawaban akhir.</p>
        </div>
      </section>

      {!status && <p className={styles.checking}>Memeriksa server AI…</p>}

      {status && !ready && (
        <section className={styles.notice} role="status">
          <h3>TATA AI belum aktif saat ini</h3>
          <p>
            {!aiEnabled
              ? 'Asisten AI sedang dimatikan di Pengaturan.'
              : status.reason === 'not_configured'
                ? 'Server AI sudah berjalan, tetapi API key belum diisi oleh guru/pengelola.'
                : 'Server AI tidak dapat dihubungi. Bisa jadi aplikasi dibuka dari alamat tanpa server AI (mis. GitHub Pages), atau perangkat sedang offline.'}
          </p>
          <p>Kamu tetap bisa belajar seperti biasa: setiap soal punya tombol 💡 petunjuk bertahap dan pembahasan.</p>
          <div className={styles.links}>
            <Link to="/materi">📖 Buka materi</Link>
            <Link to="/game/latihan">📝 Latihan dengan pembahasan</Link>
            {!aiEnabled && <Link to="/pengaturan">⚙ Pengaturan</Link>}
          </div>
        </section>
      )}

      {ready && (
        <section className={styles.chatCard}>
          <div className={styles.topics} role="group" aria-label="Pilih topik">
            {TOPICS.map((t) => (
              <button key={t.id} type="button" aria-pressed={topic.id === t.id} className={topic.id === t.id ? styles.topicOn : ''} onClick={() => setTopic(t)}>
                {t.label}
              </button>
            ))}
          </div>
          <SpeechBubble tail="left">{copy.privacy}</SpeechBubble>
          <ChatPanel key={topic.id} historyKey={`asisten-${topic.id}`} tall context={{ worldName: topic.worldName, topic: topic.label }} quick={topic.quick} onMood={setMood} />
        </section>
      )}
    </AppLayout>
  );
}
