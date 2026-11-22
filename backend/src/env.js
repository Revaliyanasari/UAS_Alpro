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

/** Konfigurasi yang dipakai server (dengan nilai bawaan aman). */
export function configFrom(env) {
  const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);
  return {
    provider: (env.AI_PROVIDER || 'deepseek').toLowerCase(),
    apiKey: env.AI_API_KEY || '',
    baseUrl: (env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, ''),
    model: env.DEEPSEEK_MODEL || 'deepseek-chat',
    port: num(env.PORT, 8787),
    allowedOrigin: env.ALLOWED_ORIGIN || '',
    rateMax: num(env.RATE_LIMIT_MAX, 20),
    rateWindowMs: num(env.RATE_LIMIT_WINDOW_MIN, 10) * 60_000,
    timeoutMs: num(env.AI_TIMEOUT_MS, 20_000),
    maxTokens: num(env.AI_MAX_TOKENS, 400),
  };
}
