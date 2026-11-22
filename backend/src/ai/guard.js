// Validasi & pembersihan masukan sebelum dikirim ke AI (CLAUDE.md aturan 8: data anak tidak dikirim ke AI).

export const LIMITS = { maxMessages: 10, maxChars: 500, maxContextChars: 300 };

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE = /(?:\+?62|0)\d[\d\s-]{7,13}\d/g;

/** Samarkan email & nomor telepon yang mungkin diketik siswa. */
export function scrubPersonalData(text) {
  return text.replace(EMAIL, '[disamarkan]').replace(PHONE, '[disamarkan]');
}

const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n).trim() : undefined);

/**
 * Memeriksa body permintaan /api/ai/chat.
 * @returns {{ ok: true, messages, context } | { ok: false, error }}
 */
export function validateChatBody(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Format permintaan tidak valid.' };
  const { messages, context } = body;
  if (!Array.isArray(messages) || messages.length === 0) return { ok: false, error: 'Pesan kosong.' };
  const recent = messages.slice(-LIMITS.maxMessages);
  const clean = [];
  for (const m of recent) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return { ok: false, error: 'Format pesan tidak valid.' };
    }
    const content = m.content.trim();
    if (!content) return { ok: false, error: 'Pesan kosong.' };
    if (content.length > LIMITS.maxChars) return { ok: false, error: `Pesan terlalu panjang (maksimal ${LIMITS.maxChars} karakter).` };
    clean.push({ role: m.role, content: m.role === 'user' ? scrubPersonalData(content) : content });
  }
  if (clean[clean.length - 1].role !== 'user') return { ok: false, error: 'Pesan terakhir harus dari siswa.' };
  const ctx = context && typeof context === 'object' ? context : {};
  return {
    ok: true,
    messages: clean,
    context: {
      worldName: clip(ctx.worldName, 80),
      topic: clip(ctx.topic, 120),
      task: clip(ctx.task, LIMITS.maxContextChars),
      phase: clip(ctx.phase, 40),
    },
  };
}

/** Pembatas laju sederhana di memori: maksimal `max` permintaan per `windowMs` untuk setiap kunci (IP). */
export function createRateLimiter({ max, windowMs, now = () => Date.now() }) {
  const hits = new Map();
  return {
    check(key) {
      const t = now();
      const list = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
      if (list.length >= max) {
        hits.set(key, list);
        return { allowed: false, retryAfterSec: Math.ceil((windowMs - (t - list[0])) / 1000) };
      }
      list.push(t);
      hits.set(key, list);
      return { allowed: true, remaining: max - list.length };
    },
  };
}
