// Satu-satunya tempat yang memanggil penyedia AI (setara app/ai/provider.py pada rancangan awal).
// Antarmuka penyedia: { name, chat({ system, messages, maxTokens, signal }) → Promise<string> }.

export class ProviderError extends Error {
  /** code: 'auth' | 'quota' | 'rate' | 'timeout' | 'unavailable' | 'bad_response' */
  constructor(code, message) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
  }
}

// Status yang berarti "model ini sedang tidak bisa dipakai" → coba model cadangan (kunci tetap sama).
const TRY_NEXT = new Set([404, 429, 500, 503]);

/**
 * Penyedia dengan format chat completions yang kompatibel OpenAI (DeepSeek, Google Gemini):
 * POST {baseUrl}/chat/completions, header Authorization: Bearer <key>.
 * fallbackModels: dicoba berurutan bila model utama sibuk/tidak tersedia. Kunci ditolak/kuota habis → langsung berhenti.
 * fetchImpl bisa diganti saat pengujian (tanpa memanggil internet).
 */
export function createOpenAICompatibleProvider({ name, apiKey, baseUrl, model, fallbackModels = [], fetchImpl = globalThis.fetch }) {
  const models = [model, ...fallbackModels.filter((m) => m && m !== model)];
  async function once(m, { system, messages, maxTokens, signal }) {
      let res;
      try {
        res = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: m,
            messages: [{ role: 'system', content: system }, ...messages],
            max_tokens: maxTokens,
            temperature: 0.4, // rendah: jawaban matematika lebih konsisten
            stream: false,
          }),
          signal,
        });
      } catch (err) {
        if (err?.name === 'AbortError' || err?.name === 'TimeoutError') throw new ProviderError('timeout', 'AI terlalu lama menjawab');
        throw new ProviderError('unavailable', 'Tidak dapat menghubungi layanan AI');
      }
      if (res.status === 401 || res.status === 403) throw new ProviderError('auth', 'API key tidak valid');
      if (res.status === 402) throw new ProviderError('quota', 'Saldo API habis');
      if (res.status === 429) {
        // Gemini memakai 429 untuk kuota habis (RESOURCE_EXHAUSTED) maupun batas per menit.
        const body = typeof res.text === 'function' ? await res.text().catch(() => '') : '';
        const err = /quota|exhausted|billing/i.test(body) ? new ProviderError('quota', 'Kuota API habis') : new ProviderError('rate', 'Layanan AI sedang sibuk');
        err.status = 429;
        throw err;
      }
      if (!res.ok) {
        const err = new ProviderError('unavailable', `Layanan AI mengembalikan status ${res.status}`);
        err.status = res.status;
        throw err;
      }
      let data;
      try {
        data = await res.json();
      } catch {
        throw new ProviderError('bad_response', 'Jawaban AI tidak bisa dibaca');
      }
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== 'string' || !text.trim()) throw new ProviderError('bad_response', 'Jawaban AI kosong');
      return text.trim();
  }
  return {
    name,
    model,
    models,
    async chat(args) {
      let last;
      for (const m of models) {
        try {
          return await once(m, args);
        } catch (err) {
          last = err;
          if (!(err instanceof ProviderError) || !TRY_NEXT.has(err.status) || err.code === 'quota') throw err;
        }
      }
      throw last;
    },
  };
}

/** DeepSeek (penyedia awal). */
export const createDeepSeekProvider = (opts) => createOpenAICompatibleProvider({ name: 'deepseek', ...opts });
/** Google Gemini (AI Studio) — endpoint kompatibel OpenAI. */
export const createGeminiProvider = (opts) => createOpenAICompatibleProvider({ name: 'gemini', ...opts });

/** Memilih penyedia dari konfigurasi; null bila AI belum dikonfigurasi (tanpa API key). */
export function providerFromConfig(config, fetchImpl) {
  if (!config.apiKey) return null;
  if (config.provider === 'deepseek') return createDeepSeekProvider({ ...config, fetchImpl });
  if (config.provider === 'gemini') return createGeminiProvider({ ...config, fetchImpl });
  return null;
}
