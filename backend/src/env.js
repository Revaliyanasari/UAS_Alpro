// Membaca backend/.env tanpa pustaka tambahan. Variabel yang sudah ada di lingkungan tidak ditimpa.
import { readFileSync, existsSync } from 'node:fs';

export function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

export function loadEnv(path) {
  if (existsSync(path)) {
    const parsed = parseEnv(readFileSync(path, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) if (process.env[k] === undefined) process.env[k] = v;
  }
  return process.env;
}

// Google Gemini (AI Studio) lewat endpoint yang kompatibel OpenAI.
// gemini-flash-lite-latest: cepat (±1 dtk) & stabil saat diuji 27 Nov 2026; gemini-2.5-* tidak tersedia untuk kunci baru.
export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
export const GEMINI_MODEL = 'gemini-flash-lite-latest';
export const GEMINI_FALLBACK = 'gemini-3-flash-preview';

/** Konfigurasi yang dipakai server (dengan nilai bawaan aman). */
export function configFrom(env) {
  const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);
  const provider = (env.AI_PROVIDER || 'deepseek').toLowerCase();
  const gemini = provider === 'gemini';
  const list = (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    provider,
    apiKey: env.AI_API_KEY || '',
    // Keduanya memakai format chat completions yang kompatibel OpenAI; hanya alamat & model yang berbeda.
    baseUrl: (env.AI_BASE_URL || (gemini ? GEMINI_BASE_URL : env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com')).replace(/\/+$/, ''),
    model: env.AI_MODEL || (gemini ? GEMINI_MODEL : env.DEEPSEEK_MODEL || 'deepseek-chat'),
    // Model cadangan: dicoba bila model utama sedang sibuk / tidak tersedia (bukan bila kunci ditolak).
    fallbackModels: list(env.AI_FALLBACK_MODELS ?? (gemini ? GEMINI_FALLBACK : '')),
    port: num(env.PORT, 8787),
    allowedOrigin: env.ALLOWED_ORIGIN || '',
    rateMax: num(env.RATE_LIMIT_MAX, 20),
    rateWindowMs: num(env.RATE_LIMIT_WINDOW_MIN, 10) * 60_000,
    timeoutMs: num(env.AI_TIMEOUT_MS, 20_000),
    maxTokens: num(env.AI_MAX_TOKENS, 400),
  };
}

/**
 * Pemeriksaan bentuk API key (tanpa pernah menampilkan isinya).
 * Kunci DeepSeek berawalan "sk-" (±35 karakter); kunci Google Gemini berawalan "AIza" atau "AQ.".
 * @returns {string|null} pesan peringatan, atau null bila bentuknya wajar
 */
export function keyWarning(config) {
  const k = config.apiKey;
  if (!k) return null;
  if (config.provider === 'gemini') {
    if (!k.startsWith('AIza') && !k.startsWith('AQ.')) return 'AI_API_KEY tidak tampak seperti kunci Google Gemini (berawalan "AIza" atau "AQ."). Salin ulang dari aistudio.google.com → Get API key.';
    return null;
  }
  if (config.provider !== 'deepseek') return null;
  if (!k.startsWith('sk-')) return 'AI_API_KEY tidak berawalan "sk-". Kemungkinan yang tertempel bukan API key DeepSeek (salin ulang dari platform.deepseek.com → API keys).';
  if (k.length < 30) return 'AI_API_KEY terlalu pendek. Kemungkinan kunci terpotong saat disalin.';
  return null;
}
