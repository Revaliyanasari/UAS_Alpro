// Kunci pilihan ganda World 4 (Menara Tantangan) & World 5 (Petualangan Literasi) yang berupa
// angka/penilaian kewajaran — dihitung ulang dengan mesin polinomial (bukan "dari kepala").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { toPoly } from './parser.js';
import { checkFactorization } from './checker.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const w4 = read('../content/lessons/world-4.json');
const w5 = read('../content/lessons/world-5.json');
const q4 = read('../content/quizzes/world-4.json');
const q5 = read('../content/quizzes/world-5.json');
const at = (expr, values) => toPoly(expr).evaluateAt(values);
const screen = (lesson, title) => lesson.screens.find((s) => s.title === title);

test('W4 menentukan nilai variabel: (x + 5)(x − 5) = 75 → x = 10 (satu-satunya pilihan yang cocok)', () => {
  const s = screen(w4, 'Menentukan nilai variabel');
  const ok = s.options.filter((o) => at('(x+5)(x-5)', { x: Number(o) }) === 75);
  assert.deepEqual(ok, [s.answer]);
});

test('W4 aula: p = 3 membuat sisi p − 4 negatif → tidak masuk akal', () => {
  assert.ok(at('p-4', { p: 3 }) < 0);
  assert.match(screen(w4, 'Masuk akal?').answer, /^Tidak/);
});

test('W4 hitung pintar & tanpa kalkulator', () => {
  assert.equal(at('x^2-9', { x: 13 }), 160);
  assert.equal(at('x^2-1', { x: 99 }), 9800);
  assert.equal(at('4x+3', { x: 5 }), 23);
});

test('W4 Beni/Ayu & Rani/Dodi: jawaban yang kalah memang belum lengkap (M3), yang menang lengkap', () => {
  assert.equal(checkFactorization('4x(3x+2)', '12x^2+8x').status, 'correct');
  assert.equal(checkFactorization('4(3x^2+2x)', '12x^2+8x').status, 'partial');
  assert.equal(checkFactorization('6x(3x+2)', '18x^2+12x').status, 'correct');
  assert.equal(checkFactorization('3x(6x+4)', '18x^2+12x').status, 'partial');
});

test('W4 & W5 cerita kewajaran: ukuran negatif pada nilai yang ditolak', () => {
  assert.ok(at('k-3', { k: 2 }) < 0); // kuis W4 karton
  assert.ok(at('x-7', { x: 6 }) < 0); // kuis W5 meja belajar
  assert.equal(at('x-6', { x: 5 }), -1); // W5 misi 4
});

test('W5 misi 1: hanya jawaban Sari yang menghasilkan jumlah stiker', () => {
  assert.ok(toPoly('6x(x+3)').equals(toPoly('6x^2+18x')));
  assert.ok(!toPoly('6x(x+18)').equals(toPoly('6x^2+18x')));
});

test('W5 misi 2: hanya (k + 2) × (k − 2) yang luasnya k² − 4', () => {
  const s = screen(w5, 'Simpulkan');
  const asPoly = (o) => toPoly(o.replace(/ m/g, '').replace('×', '*'));
  const ok = s.options.filter((o) => asPoly(o).equals(toPoly('k^2-4')));
  assert.deepEqual(ok, [s.answer]);
});

test('W5 misi 4: dari pilihan, hanya x = 10 yang membuat panjang & lebar positif; luas x = 8 adalah 28', () => {
  const s = screen(w5, 'Pilih nilai yang wajar');
  const ok = s.options.filter((o) => {
    const x = Number(o.replace('x = ', ''));
    return at('x-6', { x }) > 0 && at('x+6', { x }) > 0;
  });
  assert.deepEqual(ok, [s.answer]);
  assert.equal(at('(x+6)(x-6)', { x: 8 }), 28);
});

test('Kuis W5: gelas/kelereng, origami, spanduk, papan tulis', () => {
  const [s1, s2, s3, s4] = q5.slots;
  assert.ok(toPoly('4x(2x+5)').equals(toPoly('8x^2+20x')) && s1.variants[0].answer === 'Lia');
  assert.ok(toPoly('3y(3y+4)').equals(toPoly('9y^2+12y')) && s1.variants[1].answer === 'Rara');
  const origami = s2.variants[0];
  const good = origami.options.filter((o) => toPoly(o.replace(' cm²', '')).equals(toPoly('m^2-9')));
  assert.deepEqual(good, [origami.answer]);
  assert.ok(toPoly('3x(2x+3)').equals(toPoly('6x^2+9x')) && toPoly('3x(3x+1)').equals(toPoly('9x^2+3x')));
  assert.equal(s3.variants[0].check.target, '3x');
  assert.equal(at('(x+4)(x-4)', { x: 9 }), 65);
  assert.equal(s4.variants[1].check.target, '65');
});

test('Kuis W4: hitungan angka', () => {
  assert.equal(at('x^2-y^2', { x: 101, y: 99 }), 400);
  assert.equal(at('x^2-4', { x: 12 }), 140);
  assert.equal(q4.slots.length, 5);
});

test('Konteks World 5 berbeda dari instrumen pretest/posttest', () => {
  const text = JSON.stringify([w5, q5]).toLowerCase();
  for (const banned of ['buku tulis', 'kantong plastik', 'taman bunga', 'kolam', 'pita', 'meja pameran', 'karpet', 'pojok baca']) {
    assert.ok(!text.includes(banned), `konteks instrumen "${banned}" tidak boleh dipakai di latihan`);
  }
});
