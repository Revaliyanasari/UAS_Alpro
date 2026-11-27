// Penyedia Google Gemini (endpoint kompatibel OpenAI) — tanpa internet & tanpa kunci asli.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configFrom, keyWarning, GEMINI_BASE_URL, GEMINI_MODEL, GEMINI_FALLBACK } from '../src/env.js';
import { providerFromConfig, ProviderError } from '../src/ai/provider.js';

const FAKE_KEY = 'AQ.kunci-tiruan-untuk-uji';
const reply = (text) => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: text } }] }) });
const fail = (status, body = '') => ({ ok: false, status, json: async () => ({}), text: async () => body });

function fakeFetch(responses) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return responses.shift();
  };
  return { calls, fetchImpl };
}
const ask = (p) => p.chat({ system: 'Kamu TATA.', messages: [{ role: 'user', content: 'Apa itu FPB?' }], maxTokens: 50 });

test('konfigurasi Gemini: alamat kompatibel OpenAI, model utama & cadangan bawaan', () => {
  const c = configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: FAKE_KEY });
  assert.equal(c.baseUrl, GEMINI_BASE_URL);
  assert.equal(c.model, GEMINI_MODEL);
  assert.deepEqual(c.fallbackModels, [GEMINI_FALLBACK]);
  // Bisa diatur lewat .env
  const d = configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: FAKE_KEY, AI_MODEL: 'model-a', AI_FALLBACK_MODELS: 'model-b, model-c' });
  assert.equal(d.model, 'model-a');
  assert.deepEqual(d.fallbackModels, ['model-b', 'model-c']);
  // DeepSeek tetap seperti semula (tidak ada perubahan perilaku)
  const ds = configFrom({ AI_API_KEY: 'sk-x' });
  assert.equal(ds.provider, 'deepseek');
  assert.equal(ds.baseUrl, 'https://api.deepseek.com');
  assert.equal(ds.model, 'deepseek-chat');
  assert.deepEqual(ds.fallbackModels, []);
});

test('pemeriksaan bentuk kunci Gemini (isi kunci tidak pernah ditampilkan)', () => {
  assert.equal(keyWarning(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: 'AQ.abc' })), null);
  assert.equal(keyWarning(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: 'AIzaSyabc' })), null);
  const w = keyWarning(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: 'sk-rahasia123' }));
  assert.match(w, /Gemini/);
  assert.ok(!w.includes('rahasia123'));
});

test('permintaan Gemini: Bearer key, /chat/completions, model utama; jawaban diteruskan', async () => {
  const { calls, fetchImpl } = fakeFetch([reply('Coba cari faktor 12 dan 18 dulu.')]);
  const p = providerFromConfig(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: FAKE_KEY }), fetchImpl);
  assert.equal(p.name, 'gemini');
  assert.equal(await ask(p), 'Coba cari faktor 12 dan 18 dulu.');
  assert.equal(calls[0].url, `${GEMINI_BASE_URL}/chat/completions`);
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${FAKE_KEY}`);
  assert.equal(calls[0].body.model, GEMINI_MODEL);
  assert.equal(calls[0].body.messages[0].role, 'system');
});

test('model utama sibuk (503) atau tidak tersedia (404) → model cadangan dipakai', async () => {
  for (const status of [503, 404]) {
    const { calls, fetchImpl } = fakeFetch([fail(status), reply('Jawaban dari model cadangan')]);
    const p = providerFromConfig(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: FAKE_KEY }), fetchImpl);
    assert.equal(await ask(p), 'Jawaban dari model cadangan');
    assert.deepEqual(calls.map((c) => c.body.model), [GEMINI_MODEL, GEMINI_FALLBACK]);
  }
});

test('kunci ditolak → berhenti (tidak mencoba model lain); kuota habis → kode quota', async () => {
  const denied = fakeFetch([fail(403), reply('tidak boleh dipakai')]);
  const p1 = providerFromConfig(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: FAKE_KEY }), denied.fetchImpl);
  await assert.rejects(ask(p1), (e) => e instanceof ProviderError && e.code === 'auth');
  assert.equal(denied.calls.length, 1);

  const quota = fakeFetch([fail(429, '{"error":{"status":"RESOURCE_EXHAUSTED","message":"You exceeded your current quota"}}'), reply('x')]);
  const p2 = providerFromConfig(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: FAKE_KEY }), quota.fetchImpl);
  await assert.rejects(ask(p2), (e) => e.code === 'quota');
  assert.equal(quota.calls.length, 1);
});

test('semua model sibuk → galat jujur (tanpa jawaban buatan)', async () => {
  const { fetchImpl } = fakeFetch([fail(503), fail(503)]);
  const p = providerFromConfig(configFrom({ AI_PROVIDER: 'gemini', AI_API_KEY: FAKE_KEY }), fetchImpl);
  await assert.rejects(ask(p), (e) => e instanceof ProviderError && e.code === 'unavailable');
});
