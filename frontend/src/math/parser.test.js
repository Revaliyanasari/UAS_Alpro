// Uji parser & polinomial. Dijalankan dengan test runner bawaan Node: `npm run test:math`.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { toPoly, parse, MathInputError } from './parser.js';

const same = (a, b) => assert.ok(toPoly(a).equals(toPoly(b)), `${a} seharusnya setara ${b}`);
const fmt = (s) => toPoly(s).toString();

describe('parser: berbagai cara menulis dibaca sama', () => {
  test('perkalian implisit, titik, kali', () => {
    for (const s of ['4x(2x+3)', '4x (2x + 3)', '4x·(2x+3)', '4x*(2x+3)', '4x×(2x+3)', '(2x+3)4x', '(2x+3)(4x)']) {
      same(s, '8x^2+12x');
    }
  });
  test('pangkat dengan ^ dan ²', () => {
    same('8x²+12x', '8x^2+12x');
    same('x³', 'x^3');
  });
  test('minus unicode dan urutan suku', () => {
    same('(y+3)(y−3)', 'y^2-9');
    same('5y(−3+2y)', '10y^2-15y');
    same('-x^2', '-1x^2');
  });
  test('pembagian dibaca sebagai bagi satu suku', () => {
    same('8x^2:4x', '2x');
    same('8x²/4x', '2x');
    same('(8x^2+12x):4x', '2x+3');
    same('12x : 4x', '3');
  });
  test('huruf besar menjadi kecil, variabel lain', () => {
    same('X+X', '2x');
    same('4a+6b', '2(2a+3b)');
  });
});

describe('parser: input yang salah memberi pesan ramah', () => {
  for (const [input, fragment] of [
    ['', 'kosong'],
    ['4x(2x+', 'belum lengkap'],
    ['4x(2x+3', 'belum ditutup'],
    ['4x)+3', 'berlebih'],
    ['2,5x', 'bulat'],
    ['3x$', 'belum bisa dibaca'],
    ['()', 'kosong'],
    ['x^a', 'Pangkat'],
    ['6x:4', 'tidak bulat'],
    ['x:(x+1)', 'satu suku'],
    ['x:0', 'nol'],
  ]) {
    test(`"${input}"`, () => {
      assert.throws(() => toPoly(input), (err) => err instanceof MathInputError && err.message.includes(fragment));
    });
  }
});

describe('polinomial: format tampilan', () => {
  test('urutan suku dan simbol', () => {
    assert.equal(fmt('12x+8x^2'), '8x² + 12x');
    assert.equal(fmt('y^2-9'), 'y² − 9');
    assert.equal(fmt('-5x'), '−5x');
    assert.equal(fmt('x'), 'x');
    assert.equal(fmt('1x^2-x'), 'x² − x');
    assert.equal(fmt('x-x'), '0');
    assert.equal(fmt('7'), '7');
    assert.equal(fmt('(2a+3b)^2'), '4a² + 12ab + 9b²');
  });
  test('substitusi', () => {
    assert.equal(toPoly('x^2-16').evaluateAt({ x: 3 }), -7);
    assert.equal(toPoly('x-4').evaluateAt({ x: 3 }), -1);
  });
  test('parse mengembalikan AST', () => {
    assert.equal(parse('4x(2x+3)').type, 'mul');
  });
});
