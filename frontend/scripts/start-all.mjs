// Menjalankan Algebra Adventure LENGKAP (aplikasi + Tanya TATA/AI) dengan satu perintah:
//   npm run mulai          (dari folder frontend)
//   atau klik dua kali "Jalankan Algebra Adventure.bat" di folder proyek.
// - Server AI  : backend/src/server.js (port 8787) — API key dibaca dari backend/.env, tidak pernah ditampilkan.
// - Aplikasi   : Vite (port 5173), juga bisa dibuka dari HP di Wi-Fi yang sama.
// Tekan Ctrl+C untuk menghentikan keduanya.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(frontend, '..');
const backend = join(root, 'backend');
const PORT = 5173;

function say(msg) {
  console.log(`\x1b[36m[Algebra Adventure]\x1b[0m ${msg}`);
}

function openBrowser() {
  if (process.platform === 'win32' && !process.env.NO_BROWSER) spawn('cmd', ['/c', 'start', '', `http://localhost:${PORT}`], { stdio: 'ignore', detached: true }).unref();
}

// 0) Sudah berjalan (mis. diklik dua kali)? Cukup buka browser, jangan menjalankan salinan kedua.
try {
  const r = await fetch(`http://localhost:${PORT}/`, { signal: AbortSignal.timeout(1500) });
  if (r.ok) {
    say(`Aplikasi sudah berjalan di http://localhost:${PORT} — membuka browser.`);
    openBrowser();
    process.exit(0);
  }
} catch {
  /* belum berjalan → lanjut */
}

// 1) Dependensi aplikasi
if (!existsSync(join(frontend, 'node_modules', 'vite'))) {
  say('Memasang dependensi aplikasi (sekali saja, butuh internet)…');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const r = spawnSync(npm, ['install'], { cwd: frontend, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    say('Gagal memasang dependensi. Periksa koneksi internet lalu coba lagi.');
    process.exit(1);
  }
}

// 2) Status AI (tanpa menampilkan kunci)
const envFile = join(backend, '.env');
const env = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
const hasKey = /^AI_API_KEY=\S+/m.test(env);
const provider = (env.match(/^AI_PROVIDER=(\S+)/m)?.[1] ?? 'deepseek').toLowerCase();
if (!hasKey) say('PERINGATAN: AI_API_KEY belum diisi di backend/.env → aplikasi tetap berjalan, Tanya TATA nonaktif.');

// 3) Jalankan server AI & aplikasi
const children = [];
function run(name, args, cwd) {
  const child = spawn(process.execPath, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  const prefix = `\x1b[90m[${name}]\x1b[0m `;
  const pipe = (stream, out) => stream.on('data', (d) => String(d).split(/\r?\n/).filter(Boolean).forEach((l) => out.write(prefix + l + '\n')));
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    if (!stopping) {
      say(`${name} berhenti (kode ${code}). Menghentikan semuanya…`);
      stop(code ?? 1);
    }
  });
  children.push(child);
  return child;
}
let stopping = false;
function stop(code = 0) {
  stopping = true;
  for (const c of children) c.kill();
  process.exit(code);
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

run('AI', ['src/server.js'], backend);
run('Aplikasi', ['node_modules/vite/bin/vite.js', '--host', '--port', String(PORT), '--strictPort'], frontend);

// 4) Tampilkan alamat setelah aplikasi siap, lalu buka browser
const lanIps = Object.values(networkInterfaces())
  .flat()
  .filter((i) => i && i.family === 'IPv4' && !i.internal)
  .map((i) => i.address);

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      const [app, ai] = await Promise.all([fetch(`http://localhost:${PORT}/`), fetch(`http://localhost:${PORT}/api/ai/status`).then((r) => r.json())]);
      if (app.ok) return ai;
    } catch {
      /* belum siap */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}
const ai = await waitReady();
console.log('');
say('SIAP! Buka salah satu alamat berikut:');
say(`  Laptop ini : http://localhost:${PORT}`);
for (const ip of lanIps) say(`  HP (Wi-Fi sama): http://${ip}:${PORT}`);
say(ai?.enabled ? `Tanya TATA AKTIF (${ai.provider}, model ${ai.model}).` : `Tanya TATA NONAKTIF (${hasKey ? 'server AI belum siap — periksa pesan [AI] di atas' : 'API key belum diisi'}; penyedia: ${provider}).`);
say('Biarkan jendela ini terbuka selama aplikasi dipakai. Tekan Ctrl+C untuk berhenti.');
openBrowser();
