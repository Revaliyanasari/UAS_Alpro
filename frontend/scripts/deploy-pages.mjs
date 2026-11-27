// Deploy frontend ke GitHub Pages (gratis): https://<user>.github.io/<repo>/
// - Membangun aplikasi dengan base "/<repo>/".
// - 404.html = salinan index.html agar tautan langsung (mis. /peta) tetap terbuka saat dimuat ulang.
// - Hasil build di-commit ke branch "gh-pages" (TIDAK mengubah branch main, tanpa force push).
// Catatan: GitHub Pages hanya menyajikan file statis, jadi Tanya TATA (AI) otomatis tersembunyi di sini.
//
// Pakai: npm run deploy:pages
import { spawnSync } from 'node:child_process';
import { cpSync, copyFileSync, writeFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(frontend, 'dist');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8', ...opts });
  if (r.status !== 0 && !opts.allowFail) throw new Error(`Gagal: ${cmd} ${args.join(' ')}\n${r.stderr ?? ''}`);
  return r;
}
const git = (args, opts = {}) => run('git', args, { quiet: true, ...opts });

const origin = git(['remote', 'get-url', 'origin'], { cwd: frontend }).stdout.trim();
const repo = origin.replace(/\.git$/, '').split('/').pop();
const sha = git(['rev-parse', '--short', 'HEAD'], { cwd: frontend }).stdout.trim();
const base = `/${repo}/`;

console.log(`1/3 Membangun aplikasi untuk ${base} …`);
run(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { cwd: frontend, env: { ...process.env, VITE_BASE: base } });
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
writeFileSync(join(dist, '.nojekyll'), ''); // jangan proses dengan Jekyll

console.log('2/3 Menyiapkan branch gh-pages …');
const work = mkdtempSync(join(tmpdir(), 'aa-pages-'));
const cloned = git(['clone', '--quiet', '--depth', '1', '--branch', 'gh-pages', '--single-branch', origin, work], { allowFail: true });
if (cloned.status !== 0) {
  git(['init', '--quiet', work]);
  git(['checkout', '--quiet', '--orphan', 'gh-pages'], { cwd: work });
  git(['remote', 'add', 'origin', origin], { cwd: work });
}
for (const name of readdirSync(work)) if (name !== '.git') rmSync(join(work, name), { recursive: true, force: true });
cpSync(dist, work, { recursive: true });

git(['add', '-A'], { cwd: work });
const changed = git(['status', '--porcelain'], { cwd: work }).stdout.trim();
if (!changed) {
  console.log('Tidak ada perubahan untuk dipublikasikan.');
} else {
  git(['-c', 'core.safecrlf=false', 'commit', '--quiet', '-m', `deploy: build dari main ${sha}`], { cwd: work });
  console.log('3/3 Mengunggah ke branch gh-pages …');
  run('git', ['push', '--quiet', 'origin', 'gh-pages'], { cwd: work });
}
rmSync(work, { recursive: true, force: true });
const user = origin.split('/').slice(-2, -1)[0].toLowerCase();
console.log(`Selesai. Alamat: https://${user}.github.io${base}`);
