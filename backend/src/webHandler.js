// Proxy AI dalam format Web (Request → Response) untuk hosting serverless, mis. Netlify Functions.
// Logika sama dengan server.js: validasi, prompt RMT, batas laju, batas waktu, pesan ramah.
// API key dibaca dari environment variable hosting (AI_API_KEY) dan tidak pernah dikirim ke browser.
import { configFrom } from './env.js';
import { providerFromConfig, ProviderError } from './ai/provider.js';
import { buildSystemPrompt } from './ai/prompt.js';
import { validateChatBody, createRateLimiter } from './ai/guard.js';
import { FRIENDLY, statusFor } from './ai/messages.js';

const MAX_BODY = 16 * 1024;
const json = (status, data, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

/**
 * Membuat handler. env & provider bisa disuntikkan untuk pengujian (tanpa internet / kunci asli).
 * Catatan: pembatas laju disimpan di memori fungsi, jadi di serverless sifatnya "per instans" (perlindungan dasar).
 */
export function createWebHandler({ env = process.env, provider } = {}) {
  const config = configFrom(env);
  const ai = provider === undefined ? providerFromConfig(config) : provider;
  const limiter = createRateLimiter({ max: config.rateMax, windowMs: config.rateWindowMs });

  return async function handle(request, ip = 'unknown') {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path.endsWith('/status')) {
      return json(200, { enabled: Boolean(ai), provider: ai?.name ?? null, model: ai?.model ?? null });
    }
    if (request.method !== 'POST' || !path.endsWith('/chat')) return json(404, { error: 'Tidak ditemukan.' });
    if (!ai) return json(503, { error: 'AI belum dikonfigurasi.', code: 'disabled' });

    const gate = limiter.check(ip);
    if (!gate.allowed) {
      return json(429, { error: `Batas pertanyaan tercapai. Coba lagi dalam ${Math.ceil(gate.retryAfterSec / 60)} menit.`, code: 'limit' }, { 'Retry-After': String(gate.retryAfterSec) });
    }
    let body;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY) return json(413, { error: 'Permintaan tidak valid.', code: 'bad_request' });
      body = JSON.parse(text);
    } catch {
      return json(400, { error: 'Permintaan tidak valid.', code: 'bad_request' });
    }
    const v = validateChatBody(body);
    if (!v.ok) return json(400, { error: v.error, code: 'bad_request' });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      const reply = await ai.chat({ system: buildSystemPrompt(v.context), messages: v.messages, maxTokens: config.maxTokens, signal: controller.signal });
      return json(200, { reply, remaining: gate.remaining });
    } catch (err) {
      const code = err instanceof ProviderError ? err.code : 'unavailable';
      console.warn(`[ai] gagal: ${code}`); // tanpa isi pesan siswa & tanpa API key
      return json(statusFor(code), { error: FRIENDLY[code] ?? FRIENDLY.unavailable, code });
    } finally {
      clearTimeout(timer);
    }
  };
}
