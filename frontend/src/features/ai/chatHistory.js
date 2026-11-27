// Riwayat percakapan Tanya TATA selama SATU sesi browser (sessionStorage: hilang saat tab ditutup).
// Kunci dipisah per siswa & per topik → riwayat tidak tercampur antarsiswa di perangkat yang sama.
// Hanya berisi pertanyaan siswa & jawaban AI yang benar-benar diterima (tidak pernah jawaban buatan).
const PREFIX = 'aa-chat';
const MAX_MESSAGES = 40;

export const chatKey = (studentId, topic) => `${PREFIX}:${studentId || 'tamu'}:${topic || 'umum'}`;

const valid = (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length > 0;

function storage() {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null; // mis. mode privat yang memblokir penyimpanan → riwayat hanya di memori
  }
}

/** { messages, used } untuk kunci ini (kosong bila belum ada / rusak). */
export function loadChat(key) {
  try {
    const raw = storage()?.getItem(key);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.messages)) return { messages: [], used: 0 };
    return { messages: data.messages.filter(valid).slice(-MAX_MESSAGES), used: Math.max(0, Number(data.used) || 0) };
  } catch {
    return { messages: [], used: 0 };
  }
}

export function saveChat(key, { messages, used }) {
  try {
    storage()?.setItem(key, JSON.stringify({ messages: messages.filter(valid).slice(-MAX_MESSAGES), used }));
  } catch {
    /* penyimpanan penuh/diblokir: percakapan tetap berjalan di memori */
  }
}

export function clearChat(key) {
  try {
    storage()?.removeItem(key);
  } catch {
    /* abaikan */
  }
}
