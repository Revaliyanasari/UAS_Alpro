// Handler serverless (Netlify Function) — tanpa internet dan tanpa API key asli.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWebHandler } from '../src/webHandler.js';
import netlifyFn, { config as netlifyConfig } from '../../netlify/functions/ai.mjs';
import { ProviderError } from '../src/ai/provider.js';

const BASE = 'https://contoh.netlify.app';
const chat = (body) => new Request(`${BASE}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const ask = { messages: [{ role: 'user', content: 'Bagaimana mencari FPB?' }], context: { worldName: 'Lembah Aljabar' } };

test('tanpa AI_API_KEY: status nonaktif, chat 503', async () => {
  const h = createWebHandler({ env: {} });
  assert.deepEqual(await (await h(new Request(`${BASE}/api/ai/status`))).json(), { enabled: false, provider: null, model: null });
  assert.equal((await h(chat(ask))).status, 503);
});

test('chat berhasil: prompt RMT + konteks diteruskan', async () => {
  let seen;
  const provider = { name: 'fake', model: 'm', chat: async (a) => ((seen = a), 'Coba cari FPB angkanya dulu.') };
  const h = createWebHandler({ env: {}, provider });
  const r = await h(chat(ask), '1.2.3.4');
  assert.equal(r.status, 200);
  assert.match((await r.json()).reply, /FPB/);
  assert.match(seen.system, /JANGAN memberikan jawaban akhir/);
  assert.match(seen.system, /Lembah Aljabar/);
});

test('batas laju, validasi, error penyedia', async () => {
  const ok = { name: 'fake', model: 'm', chat: async () => 'ok' };
  const h = createWebHandler({ env: { RATE_LIMIT_MAX: '2' }, provider: ok });
  assert.equal((await h(chat(ask), 'ip')).status, 200);
  assert.equal((await h(chat({ messages: [] }), 'ip')).status, 400);
  assert.equal((await h(chat(ask), 'ip')).status, 429);
  assert.equal((await h(chat(ask), 'ip-lain')).status, 200);

  const failing = { name: 'fake', model: 'm', chat: async () => { throw new ProviderError('quota', 'habis'); } };
  const r = await createWebHandler({ env: {}, provider: failing })(chat(ask));
  assert.equal(r.status, 502);
  assert.match((await r.json()).error, /kuota habis/);
});

test('API key tidak muncul di respons', async () => {
  const h = createWebHandler({ env: { AI_API_KEY: 'rahasia-sekali' } });
  const text = await (await h(new Request(`${BASE}/api/ai/status`))).text();
  assert.match(text, /"enabled":true/);
  assert.doesNotMatch(text, /rahasia/);
});

test('fungsi Netlify: jalur /api/ai/* dan membaca env hosting', async () => {
  assert.deepEqual(netlifyConfig.path, ['/api/ai/status', '/api/ai/chat']);
  const before = process.env.AI_API_KEY;
  delete process.env.AI_API_KEY;
  const r = await netlifyFn(new Request(`${BASE}/api/ai/status`), { ip: '9.9.9.9' });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).enabled, false);
  if (before !== undefined) process.env.AI_API_KEY = before;
});
