// Uji pemeriksa jawaban & diagnosis kesalahan (docs/LEARNING_DESIGN.md §5.2, docs/TESTING_PLAN.md §3).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkFactorization,
  checkDivision,
  checkQuotient,
  checkEquivalent,
  fpb,
  fpbOfExpressions,
  isDifferenceOfSquares,
  expand,
} from './checker.js';

const fact = (answer, target, opts) => checkFactorization(answer, target, opts);
const expectResult = (r, status, code) => {
  assert.equal(r.status, status, `status: ${JSON.stringify(r)}`);
  if (code) assert.equal(r.code, code, `kode: ${JSON.stringify(r)}`);
};

describe('pemfaktoran FPB', () => {
  test('benar dalam berbagai urutan', () => {
    for (const a of ['4x(2x+3)', '(2x+3)4x', '4x(3+2x)', '4x·(2x + 3)', '2·2x(2x+3)']) {
      expectResult(fact(a, '8x^2+12x'), 'correct', 'OK');
    }
  });
  test('M2: faktor angka masih tersisa di dalam kurung', () => {
    expectResult(fact('2x(4x+6)', '8x^2+12x'), 'partial', 'M2');
    expectResult(fact('x(8x+12)', '8x^2+12x'), 'partial', 'M2');
  });
  test('M3: variabel belum dikeluarkan', () => {
    expectResult(fact('4(2x^2+3x)', '8x^2+12x'), 'partial', 'M3');
  });
  test('M1: lupa membagi suku kedua (kesalahan Rafa)', () => {
    expectResult(fact('4x(2x+12)', '8x^2+12x'), 'wrong', 'M1');
    expectResult(fact('2x(4x+12x)', '8x^2+12x'), 'wrong', 'M7'); // 4x + 12x = 16x (suku sejenis), jadi = 32x²
    expectResult(fact('5x(2x)', '10x^2+5x'), 'wrong', 'M1');
  });
  test('M6: koefisien hasil bagi salah', () => {
    expectResult(fact('4x(4x+3)', '8x^2+12x'), 'wrong', 'M6');
  });
  test('M11: faktor di depan hilang', () => {
    expectResult(fact('2x+3', '8x^2+12x'), 'wrong', 'M11');
  });
  test('belum berbentuk perkalian', () => {
    expectResult(fact('8x^2+12x', '8x^2+12x'), 'not-factored', 'NOT_FACTORED');
    expectResult(fact('12x+8x²', '8x^2+12x'), 'not-factored', 'NOT_FACTORED');
  });
  test('input rusak tidak membuat error', () => {
    const r = fact('4x(2x+', '8x^2+12x');
    assert.equal(r.status, 'invalid');
    assert.ok(r.message.length > 0);
  });
  test('ekspansi tersedia untuk tombol "cek dengan mengalikan"', () => {
    assert.equal(fact('4x(2x+12)', '8x^2+12x').expanded, '8x² + 48x');
    assert.equal(expand('4x(2x+3)'), '8x² + 12x');
  });
  test('requireFullyFactored=false menerima faktor sebagian', () => {
    expectResult(fact('2x(4x+6)', '8x^2+12x', { requireFullyFactored: false }), 'correct');
  });
  test('acceptForms menerima bentuk sesuai konteks, bentuk lain tetap parsial', () => {
    expectResult(fact('3x(2x+4)', '6x^2+12x', { acceptForms: ['3x(2x+4)'] }), 'correct', 'OK');
    expectResult(fact('(2x+4)·3x', '6x^2+12x', { acceptForms: ['3x(2x+4)'] }), 'correct', 'OK');
    expectResult(fact('2x(3x+6)', '6x^2+12x', { acceptForms: ['3x(2x+4)'] }), 'partial', 'M2');
  });
});

describe('selisih dua kuadrat', () => {
  test('benar', () => {
    expectResult(fact('(y+3)(y-3)', 'y^2-9'), 'correct');
    expectResult(fact('(y-3)(y+3)', 'y^2-9'), 'correct');
    expectResult(fact('(2x+3)(2x-3)', '4x^2-9'), 'correct');
    expectResult(fact('(4+y)(4-y)', '16-y^2'), 'correct');
  });
  test('M4: tanda sama', () => {
    expectResult(fact('(y-3)(y-3)', 'y^2-9'), 'wrong', 'M4');
    expectResult(fact('(y-3)^2', 'y^2-9'), 'wrong', 'M4');
    expectResult(fact('(y+3)(y+3)', 'y^2-9'), 'wrong', 'M4');
  });
  test('M5: a² + b² dikira selisih dua kuadrat', () => {
    expectResult(fact('(y+3)(y-3)', 'y^2+9'), 'wrong', 'M5');
  });
  test('masih tersisa selisih dua kuadrat', () => {
    expectResult(fact('2(x^2-4)', '2x^2-8'), 'partial', 'DOTS_LEFT');
    expectResult(fact('2(x+2)(x-2)', '2x^2-8'), 'correct', 'OK');
  });
  test('akar salah → diagnosis umum', () => {
    expectResult(fact('(y+9)(y-9)', 'y^2-9'), 'wrong', 'M7');
  });
  test('sortir bentuk', () => {
    assert.equal(isDifferenceOfSquares('x^2-9'), true);
    assert.equal(isDifferenceOfSquares('x^2+9'), false);
    assert.equal(isDifferenceOfSquares('x^2-7'), false);
    assert.equal(isDifferenceOfSquares('4y^2-1'), true);
    assert.equal(isDifferenceOfSquares('16-y^2'), true);
  });
});

describe('pembagian suku tunggal (World 1.6)', () => {
  test('benar', () => {
    expectResult(checkDivision('2x', '8x^2', '4x'), 'correct');
    expectResult(checkDivision('3', '12x', '4x'), 'correct');
    expectResult(checkDivision('2x', '6x', '3'), 'correct');
  });
  test('kesalahan umum', () => {
    expectResult(checkDivision('4x', '8x^2', '4x'), 'wrong', 'M6');
    expectResult(checkDivision('2x^2', '8x^2', '4x'), 'wrong', 'M8');
    expectResult(checkDivision('3x', '12x', '4x'), 'wrong', 'M9');
    expectResult(checkDivision('2', '8x^2', '4x'), 'wrong', 'M10');
    expectResult(checkDivision('5', '8x^2', '4x'), 'wrong', 'M7');
  });
});

describe('hasil bagi bentuk aljabar oleh satu suku', () => {
  test('benar dan kesalahan Rafa', () => {
    expectResult(checkQuotient('2x+3', '8x^2+12x', '4x'), 'correct');
    expectResult(checkQuotient('2x+12', '8x^2+12x', '4x'), 'wrong', 'M1');
    expectResult(checkQuotient('3x+2', '15x^2+10x', '5x'), 'correct');
  });
});

describe('FPB', () => {
  test('FPB suku tunggal', () => {
    assert.equal(fpb('8x^2', '12x').toString(), '4x');
    assert.equal(fpb('12', '18').toString(), '6');
    assert.equal(fpb('4a', '6a').toString(), '2a');
  });
  test('FPB dua bentuk aljabar', () => {
    assert.equal(fpbOfExpressions('6x^2+12x', '9x^2+15x').toString(), '3x');
    assert.equal(fpbOfExpressions('4x^2+6x', '6x^2+9x').toString(), '2x² + 3x');
  });
});

describe('setara', () => {
  test('model luas', () => {
    expectResult(checkEquivalent('y·y − 3·3', 'y^2-9'), 'correct');
    expectResult(checkEquivalent('y^2+9', 'y^2-9'), 'wrong');
  });
});
