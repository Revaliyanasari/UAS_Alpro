// Kunci jawaban Instrumen Versi B Revisi 2 (docs/INSTRUMEN_REVISI_VERSI_B.md) diuji dengan mesin pemeriksa.
// Jika uji ini gagal, berarti kunci di dokumen atau mesin pemeriksa keliru — keduanya harus diperiksa.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { checkFactorization, checkQuotient, checkEquivalent, fpbOfExpressions, evaluateExpression } from './checker.js';
import { toPoly } from './parser.js';

describe('Soal 1 — Reasoning', () => {
  test('banyak kantong = (8x² + 12x) : 4x = 2x + 3 (Dinda)', () => {
    assert.equal(checkQuotient('2x+3', '8x^2+12x', '4x').status, 'correct');
  });
  test('jawaban Rafa salah karena 12x tidak dibagi 4x', () => {
    const r = checkQuotient('2x+12', '8x^2+12x', '4x');
    assert.equal(r.code, 'M1');
    assert.equal(toPoly('4x(2x+12)').toString(), '8x² + 48x');
  });
  test('T2 skor 2: 4x(2x + 3)', () => {
    assert.equal(checkFactorization('4x(2x+3)', '8x^2+12x').status, 'correct');
  });
  test('T2 skor 1: pemfaktoran sebagian 4(2x² + 3x) dan 2x(4x + 6) ekuivalen tetapi belum paling sederhana', () => {
    assert.equal(checkFactorization('4(2x^2+3x)', '8x^2+12x').status, 'partial');
    assert.equal(checkFactorization('2x(4x+6)', '8x^2+12x').status, 'partial');
  });
  test('x bilangan asli → banyak buku & kantong bilangan asli', () => {
    for (let x = 1; x <= 10; x++) {
      const kantong = evaluateExpression('2x+3', { x });
      const buku = evaluateExpression('8x^2+12x', { x });
      assert.ok(Number.isInteger(kantong) && kantong > 0);
      assert.equal(kantong * 4 * x, buku);
    }
  });
});

describe('Soal 2 — Formulating', () => {
  test('luas lahan bunga = y² − 9 = (y + 3)(y − 3)', () => {
    assert.equal(checkEquivalent('y*y - 3*3', 'y^2-9').status, 'correct');
    assert.equal(checkFactorization('(y+3)(y-3)', 'y^2-9').status, 'correct');
  });
  test('bentuk salah yang tercantum di rubrik', () => {
    assert.equal(checkFactorization('(y-3)(y-3)', 'y^2-9').code, 'M4');
    assert.equal(checkFactorization('(y+9)(y-9)', 'y^2-9').status, 'wrong');
  });
});

describe('Soal 3 — Employing', () => {
  test('L₁ = 6x(x + 2) dan L₂ = 3x(3x + 5)', () => {
    assert.equal(checkFactorization('6x(x+2)', '6x^2+12x').status, 'correct');
    assert.equal(checkFactorization('3x(3x+5)', '9x^2+15x').status, 'correct');
  });
  test('L₁ = 3x(2x + 4) diterima karena sesuai konteks lebar meja 3x', () => {
    const r = checkFactorization('3x(2x+4)', '6x^2+12x', { acceptForms: ['3x(2x+4)'] });
    assert.equal(r.status, 'correct');
  });
  test('L₁ = 2x(3x + 6) belum diterima (tidak memakai FPB maupun lebar 3x)', () => {
    const r = checkFactorization('2x(3x+6)', '6x^2+12x', { acceptForms: ['3x(2x+4)'] });
    assert.notEqual(r.status, 'correct');
  });
  test('FPB(L₁, L₂) = 3x', () => {
    assert.equal(fpbOfExpressions('6x^2+12x', '9x^2+15x').toString(), '3x');
  });
  test('panjang meja (informasi tambahan): 2x + 4 dan 3x + 5', () => {
    assert.equal(checkQuotient('2x+4', '6x^2+12x', '3x').status, 'correct');
    assert.equal(checkQuotient('3x+5', '9x^2+15x', '3x').status, 'correct');
  });
});

describe('Soal 4 — Interpreting & Evaluating', () => {
  test('(x + 4)(x − 4) = x² − 16', () => {
    assert.equal(checkFactorization('(x+4)(x-4)', 'x^2-16').status, 'correct');
  });
  test('x = 3 → panjang 7, lebar −1, luas −7', () => {
    assert.equal(evaluateExpression('x+4', { x: 3 }), 7);
    assert.equal(evaluateExpression('x-4', { x: 3 }), -1);
    assert.equal(evaluateExpression('x^2-16', { x: 3 }), -7);
  });
  test('batas wajar: lebar ≥ 10 dm dan panjang ≤ 30 dm ⇔ 14 ≤ x ≤ 26', () => {
    const wajar = (x) => evaluateExpression('x-4', { x }) >= 10 && evaluateExpression('x+4', { x }) <= 30;
    const valid = [];
    for (let x = -5; x <= 40; x++) if (wajar(x)) valid.push(x);
    assert.equal(valid[0], 14);
    assert.equal(valid[valid.length - 1], 26);
    assert.equal(valid.length, 13);
    assert.equal(wajar(5), false); // 9 dm × 1 dm tidak wajar
  });
  test('contoh kunci x = 20 → 24 dm × 16 dm, luas 384 dm²', () => {
    assert.equal(evaluateExpression('x+4', { x: 20 }), 24);
    assert.equal(evaluateExpression('x-4', { x: 20 }), 16);
    assert.equal(evaluateExpression('x^2-16', { x: 20 }), 384);
  });
  test('contoh batas x = 14 → 18 × 10; x = 26 → 30 × 22', () => {
    assert.deepEqual([evaluateExpression('x+4', { x: 14 }), evaluateExpression('x-4', { x: 14 })], [18, 10]);
    assert.deepEqual([evaluateExpression('x+4', { x: 26 }), evaluateExpression('x-4', { x: 26 })], [30, 22]);
  });
});

describe('Rekap skor', () => {
  test('total skor maksimum 24', () => {
    const steps = { 1: [1, 2, 1, 1, 1], 2: [1, 1, 1, 1, 1, 1], 3: [1, 2, 2, 1], 4: [1, 1, 1, 1, 1, 1] };
    const perItem = Object.values(steps).map((s) => s.reduce((a, b) => a + b, 0));
    assert.deepEqual(perItem, [6, 6, 6, 6]);
    assert.equal(perItem.reduce((a, b) => a + b, 0), 24);
  });
});
