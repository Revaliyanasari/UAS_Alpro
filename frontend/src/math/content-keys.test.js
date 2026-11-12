// Semua kunci jawaban di docs/CONTENT_PLAN.md diuji agar tidak ada kunci yang ditulis "dari kepala".
// Saat konten dipindahkan ke file JSON (Fase 3), uji ini akan membaca JSON tersebut.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { checkFactorization, checkDivision, checkQuotient, checkEquivalent, fpb, fpbOfExpressions, isDifferenceOfSquares, evaluateExpression } from './checker.js';

const factored = [
  // World 2
  ['5(x+2)', '5x+10'],
  ['2(2a+3b)', '4a+6b'],
  ['x(x+7)', 'x^2+7x'],
  ['5y(2y-3)', '10y^2-15y'],
  ['6x(2x+3)', '12x^2+18x'],
  ['5x(2x+1)', '10x^2+5x'],
  ['3x(2x+3)', '6x^2+9x'],
  ['7(x+2)', '7x+14'],
  ['3y(3y+2)', '9y^2+6y'],
  ['2x(3x+2)', '6x^2+4x'],
  // World 3
  ['(x+5)(x-5)', 'x^2-25'],
  ['(y+7)(y-7)', 'y^2-49'],
  ['(x+2)(x-2)', 'x^2-4'],
  ['(a+6)(a-6)', 'a^2-36'],
  ['(2x+3)(2x-3)', '4x^2-9'],
  ['(3y+4)(3y-4)', '9y^2-16'],
  ['(4+y)(4-y)', '16-y^2'],
  // World 4
  ['7(2x+3)', '14x+21'],
  ['6a(3a-2)', '18a^2-12a'],
  ['(p+4)(p-4)', 'p^2-16'],
  // World 5
  ['6x(x+3)', '6x^2+18x'],
  ['(k+2)(k-2)', 'k^2-4'],
  ['5x(2x+3)', '10x^2+15x'],
  ['5x(3x+1)', '15x^2+5x'],
  ['(x+6)(x-6)', 'x^2-36'],
];

describe('kunci pemfaktoran CONTENT_PLAN', () => {
  for (const [answer, target] of factored) {
    test(`${target} = ${answer}`, () => {
      assert.equal(checkFactorization(answer, target).status, 'correct');
    });
  }
  test('Budi 5x(2x) salah untuk 10x² + 5x', () => {
    assert.equal(checkFactorization('5x(2x)', '10x^2+5x').status, 'wrong');
  });
  test('B/S: 2x(3x + 4) = 6x² + 8x (Benar)', () => {
    assert.equal(checkEquivalent('2x(3x+4)', '6x^2+8x').status, 'correct');
  });
  test('B/S: x² + 16 = (x + 4)(x − 4) (Salah)', () => {
    assert.equal(checkEquivalent('(x+4)(x-4)', 'x^2+16').status, 'wrong');
  });
});

describe('kunci FPB & pembagian World 1', () => {
  for (const [args, expected] of [
    [['12', '18'], '6'],
    [['4a', '6a'], '2a'],
    [['14x^2', '21x'], '7x'],
    [['16x^2', '24x'], '8x'],
    [['6x^2', '9x'], '3x'],
    [['10y^2', '15y'], '5y'],
    [['8x^2', '12x'], '4x'],
  ]) {
    test(`FPB(${args.join(', ')}) = ${expected}`, () => assert.equal(fpb(...args).toString(), expected));
  }
  for (const [dividend, divisor, q] of [
    ['20x^2', '5x', '4x'],
    ['18y', '6', '3y'],
    ['15x^2', '3x', '5x'],
    ['6x', '3', '2x'],
    ['10x', '5x', '2'],
    ['6x^2', '2x', '3x'],
    ['20y^2', '4y', '5y'],
    ['8x^2', '4x', '2x'],
    ['12x', '4x', '3'],
    ['6x^2', '3x', '2x'],
  ]) {
    test(`${dividend} : ${divisor} = ${q}`, () => assert.equal(checkDivision(q, dividend, divisor).status, 'correct'));
  }
});

describe('kunci lain World 3–5', () => {
  test('sortir selisih dua kuadrat', () => {
    assert.deepEqual(['x^2-9', 'x^2+9', 'x^2-7', '4y^2-1'].map(isDifferenceOfSquares), [true, false, false, true]);
  });
  test('World 4 lantai 3: (15x² + 10x) : 5x = 3x + 2', () => {
    assert.equal(checkQuotient('3x+2', '15x^2+10x', '5x').status, 'correct');
  });
  test('Misi 5.1: Sari benar (x + 3), Tono salah (x + 18)', () => {
    assert.equal(checkQuotient('x+3', '6x^2+18x', '6x').status, 'correct');
    assert.equal(checkQuotient('x+18', '6x^2+18x', '6x').code, 'M1');
  });
  test('Misi 5.3: FPB = 5x, panjang 2x + 3 dan 3x + 1', () => {
    assert.equal(fpbOfExpressions('10x^2+15x', '15x^2+5x').toString(), '5x');
    assert.equal(checkQuotient('2x+3', '10x^2+15x', '5x').status, 'correct');
    assert.equal(checkQuotient('3x+1', '15x^2+5x', '5x').status, 'correct');
  });
  test('Misi 5.4: x = 5 → lebar −1; x = 8 → 14 × 2', () => {
    assert.equal(evaluateExpression('x-6', { x: 5 }), -1);
    assert.deepEqual([evaluateExpression('x+6', { x: 8 }), evaluateExpression('x-6', { x: 8 })], [14, 2]);
  });
});
