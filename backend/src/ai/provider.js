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

/**
 * DeepSeek memakai format chat completions yang kompatibel OpenAI:
 * POST {baseUrl}/chat/completions, header Authorization: Bearer <key>.
 * fetchImpl bisa diganti saat pengujian (tanpa memanggil internet).
 */
export function createDeepSeekProvider({ apiKey, baseUrl, model, fetchImpl = globalThis.fetch }) {
  return {
    name: 'deepseek',
    model,
    async chat({ system, messages, maxTokens, signal }) {
      let res;
      try {
        res = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
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
      if (res.status === 429) throw new ProviderError('rate', 'Layanan AI sedang sibuk');
      if (!res.ok) throw new ProviderError('unavailable', `Layanan AI mengembalikan status ${res.status}`);
      let data;
      try {
        data = await res.json();
      } catch {
        throw new ProviderError('bad_response', 'Jawaban AI tidak bisa dibaca');
      }
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== 'string' || !text.trim()) throw new ProviderError('bad_response', 'Jawaban AI kosong');
      return text.trim();
    },
  };
}

/** Memilih penyedia dari konfigurasi; null bila AI belum dikonfigurasi (tanpa API key). */
export function providerFromConfig(config, fetchImpl) {
  if (!config.apiKey) return null;
  if (config.provider === 'deepseek') return createDeepSeekProvider({ ...config, fetchImpl });
  return null;
}
