// Setiap kode diagnosis yang bisa dihasilkan pemeriksa harus punya teks umpan balik TATA,
// dan teks itu tidak boleh membocorkan jawaban akhir.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { feedback, feedbackFor } from '../content/feedback.js';

test('semua kode di checker.js punya umpan balik', () => {
  const source = readFileSync(new URL('./checker.js', import.meta.url), 'utf8');
  const codes = new Set([...source.matchAll(/'(M\d+|OK|INPUT|NOT_FACTORED|DOTS_LEFT)'/g)].map((m) => m[1]));
  assert.ok(codes.size >= 12, `kode ditemukan: ${[...codes]}`);
  for (const code of codes) assert.ok(feedback[code], `umpan balik untuk ${code} belum ada`);
});

test('umpan balik singkat dan tidak menyebut jawaban 4x(2x + 3)', () => {
  for (const [code, f] of Object.entries(feedback)) {
    assert.ok(f.text.split(/\s+/).length <= 25, `${code} terlalu panjang`);
    assert.ok(!/4x\(2x ?\+ ?3\)/.test(f.text), `${code} membocorkan jawaban`);
  }
});

test('pesan INPUT menyertakan penjelasan parser', () => {
  const f = feedbackFor({ code: 'INPUT', message: 'Ada kurung yang belum ditutup.' });
  assert.match(f.text, /kurung/);
});
