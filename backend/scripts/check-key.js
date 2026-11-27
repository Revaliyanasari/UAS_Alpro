// Memeriksa API key DeepSeek di backend/.env dengan SATU permintaan sangat kecil (±20 token).
// Isi kunci tidak pernah ditampilkan. Pakai: cd backend && npm run cek-kunci
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadEnv, configFrom, keyWarning } from '../src/env.js';
import { providerFromConfig, ProviderError } from '../src/ai/provider.js';

const here = dirname(fileURLToPath(import.meta.url));
const config = configFrom(loadEnv(join(here, '..', '.env')));

if (!config.apiKey) {
  console.log('✘ AI_API_KEY belum diisi di backend/.env.');
  process.exit(1);
}
const warn = keyWarning(config);
if (warn) console.log(`⚠ ${warn}`);

const EXPLAIN = {
  auth: 'Kunci DITOLAK DeepSeek (salah, terpotong, atau sudah dihapus). Buat kunci baru di platform.deepseek.com → API keys, lalu tempel ulang.',
  quota: 'Kunci benar, tetapi SALDO DeepSeek habis. Isi saldo di platform.deepseek.com → Top up.',
  rate: 'DeepSeek sedang membatasi permintaan. Coba lagi beberapa menit lagi.',
  timeout: 'DeepSeek terlalu lama menjawab. Periksa koneksi internet lalu coba lagi.',
  unavailable: 'Tidak bisa menghubungi DeepSeek. Periksa koneksi internet / firewall.',
  bad_response: 'Jawaban DeepSeek tidak terbaca. Coba lagi.',
};

try {
  const provider = providerFromConfig(config);
  const reply = await provider.chat({ system: 'Jawab singkat.', messages: [{ role: 'user', content: 'Balas dengan kata: siap' }], maxTokens: 5 });
  console.log(`✔ API key DeepSeek BERFUNGSI (model ${config.model}). Contoh jawaban: "${reply.slice(0, 20)}"`);
} catch (err) {
  const code = err instanceof ProviderError ? err.code : 'unavailable';
  console.log(`✘ Gagal (${code}): ${EXPLAIN[code] ?? err.message}`);
  process.exit(1);
}
