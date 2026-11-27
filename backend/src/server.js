// Proxy AI Learning Assistant. Frontend → /api/ai/* → server ini → DeepSeek.
// API key hanya dibaca dari backend/.env dan tidak pernah dikirim ke browser atau ditulis ke log.
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadEnv, configFrom, keyWarning } from './env.js';
import { providerFromConfig, ProviderError } from './ai/provider.js';
import { buildSystemPrompt } from './ai/prompt.js';
import { validateChatBody, createRateLimiter } from './ai/guard.js';
import { FRIENDLY, statusFor } from './ai/messages.js';

const MAX_BODY = 16 * 1024;


function send(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('too_large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Membuat handler HTTP. provider & config disuntikkan agar bisa diuji tanpa internet. */
export function createApp({ config, provider }) {
  const limiter = createRateLimiter({ max: config.rateMax, windowMs: config.rateWindowMs });

  return async function handler(req, res) {
    const cors = {};
    if (config.allowedOrigin && req.headers.origin === config.allowedOrigin) {
      cors['Access-Control-Allow-Origin'] = config.allowedOrigin;
      cors['Access-Control-Allow-Headers'] = 'Content-Type';
      cors['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      cors.Vary = 'Origin';
    }
    if (req.method === 'OPTIONS') return send(res, 204, {}, cors);

    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/api/ai/status') {
      return send(res, 200, { enabled: Boolean(provider), provider: provider?.name ?? null, model: provider?.model ?? null }, cors);
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/chat') {
      if (!provider) return send(res, 503, { error: 'AI belum dikonfigurasi.', code: 'disabled' }, cors);
      const ip = req.socket.remoteAddress ?? 'unknown';
      const gate = limiter.check(ip);
      if (!gate.allowed) {
        return send(res, 429, { error: `Batas pertanyaan tercapai. Coba lagi dalam ${Math.ceil(gate.retryAfterSec / 60)} menit.`, code: 'limit' }, { ...cors, 'Retry-After': String(gate.retryAfterSec) });
      }
      let body;
      try {
        body = JSON.parse(await readBody(req));
      } catch (e) {
        return send(res, e.message === 'too_large' ? 413 : 400, { error: 'Permintaan tidak valid.', code: 'bad_request' }, cors);
      }
      const v = validateChatBody(body);
      if (!v.ok) return send(res, 400, { error: v.error, code: 'bad_request' }, cors);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.timeoutMs);
      try {
        const reply = await provider.chat({
          system: buildSystemPrompt(v.context),
          messages: v.messages,
          maxTokens: config.maxTokens,
          signal: controller.signal,
        });
        return send(res, 200, { reply, remaining: gate.remaining }, cors);
      } catch (err) {
        const code = err instanceof ProviderError ? err.code : 'unavailable';
        // Log tanpa isi pesan siswa dan tanpa API key.
        console.warn(`[ai] gagal: ${code}`);
        const status = statusFor(code);
        return send(res, status, { error: FRIENDLY[code] ?? FRIENDLY.unavailable, code }, cors);
      } finally {
        clearTimeout(timer);
      }
    }

    return send(res, 404, { error: 'Tidak ditemukan.' }, cors);
  };
}

// Dijalankan langsung: node src/server.js
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const here = dirname(fileURLToPath(import.meta.url));
  const config = configFrom(loadEnv(join(here, '..', '.env')));
  const provider = providerFromConfig(config);
  createServer(createApp({ config, provider })).listen(config.port, () => {
    console.log(`Proxy AI Algebra Adventure: http://localhost:${config.port}`);
    console.log(provider ? `AI aktif (${provider.name}, model ${provider.model}).` : 'AI NONAKTIF: AI_API_KEY belum diisi di backend/.env.');
    const warn = keyWarning(config);
    if (warn) console.warn(`PERINGATAN: ${warn}`);
  });
}
