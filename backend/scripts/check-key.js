// Memeriksa API key penyedia AI (Gemini / DeepSeek) di backend/.env dengan SATU permintaan sangat kecil (±20 token).
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

const GEMINI = config.provider === 'gemini';
const NAME = GEMINI ? 'Google Gemini' : 'DeepSeek';
const SITE = GEMINI ? 'aistudio.google.com → Get API key' : 'platform.deepseek.com → API keys';
const EXPLAIN = {
  auth: `Kunci DITOLAK ${NAME} (salah, terpotong, atau sudah dihapus). Buat kunci baru di ${SITE}, lalu tempel ulang.`,
  quota: GEMINI
    ? 'Kunci benar, tetapi KUOTA Gemini habis (batas harian). Tunggu kuota pulih atau periksa paket di aistudio.google.com.'
    : 'Kunci benar, tetapi SALDO DeepSeek habis. Isi saldo di platform.deepseek.com → Top up.',
  rate: `${NAME} sedang sibuk/membatasi permintaan. Coba lagi beberapa menit lagi.`,
  timeout: `${NAME} terlalu lama menjawab. Periksa koneksi internet lalu coba lagi.`,
  unavailable: `Tidak bisa memakai ${NAME} saat ini (server sibuk atau model tidak tersedia). Coba lagi nanti.`,
  bad_response: `Jawaban ${NAME} tidak terbaca. Coba lagi.`,
};

try {
  const provider = providerFromConfig(config);
  const reply = await provider.chat({ system: 'Jawab singkat.', messages: [{ role: 'user', content: 'Balas dengan kata: siap' }], maxTokens: 5 });
  console.log(`✔ API key ${NAME} BERFUNGSI (model ${config.model}). Contoh jawaban: "${reply.slice(0, 20)}"`);
} catch (err) {
  const code = err instanceof ProviderError ? err.code : 'unavailable';
  console.log(`✘ Gagal (${code}): ${EXPLAIN[code] ?? err.message}`);
  process.exit(1);
}
