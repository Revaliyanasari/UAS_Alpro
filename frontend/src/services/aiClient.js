// Klien AI Learning Assistant. Hanya memanggil proxy /api/ai/* (backend/src/server.js);
// frontend tidak pernah memegang API key. Data siswa (nama panggilan, progres) tidak dikirim.

export const CLIENT_LIMIT = 15; // pertanyaan per sesi pelajaran (cadangan; server juga membatasi per IP)

async function fetchWithTimeout(url, options = {}, ms = 25_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** { enabled, reason } — reason: 'ok' | 'not_configured' | 'offline' */
export async function getAiStatus() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { enabled: false, reason: 'offline' };
  try {
    const res = await fetchWithTimeout('/api/ai/status', {}, 4_000);
    if (!res.ok) return { enabled: false, reason: 'offline' };
    const data = await res.json();
    return data.enabled ? { enabled: true, reason: 'ok' } : { enabled: false, reason: 'not_configured' };
  } catch {
    return { enabled: false, reason: 'offline' };
  }
}

/**
 * Kirim percakapan ke TATA AI.
 * @param {{role:'user'|'assistant', content:string}[]} messages
 * @param {{worldName?:string, topic?:string, task?:string, phase?:string}} context
 * @returns {Promise<{ ok: true, reply: string } | { ok: false, error: string }>}
 */
export async function askTata(messages, context) {
  try {
    const res = await fetchWithTimeout('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && typeof data.reply === 'string') return { ok: true, reply: data.reply };
    return { ok: false, error: data.error || 'TATA AI sedang tidak tersedia. Pakai tombol petunjuk 💡 dulu, ya.' };
  } catch (err) {
    return {
      ok: false,
      error: err?.name === 'AbortError' ? 'TATA AI terlalu lama berpikir. Coba lagi, ya.' : 'Tidak bisa terhubung ke TATA AI. Periksa internetmu.',
    };
  }
}
