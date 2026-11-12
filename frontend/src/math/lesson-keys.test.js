// Semua kunci di file pelajaran (src/content/lessons/*.json) diuji dengan mesin pemeriksa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { checkFactorization, checkEquivalent, checkDivision, fpb } from './checker.js';
import { toPoly } from './parser.js';

const dir = new URL('../content/lessons/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const lesson = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  lesson.screens.forEach((s, i) => {
    const name = `${file} #${i + 1} (${s.type})`;
    if (s.type === 'input') {
      test(`${name}: kunci lulus pemeriksa`, () => {
        const c = s.check;
        if (c.kind === 'factor') assert.equal(checkFactorization(c.key, c.target).status, 'correct');
        if (c.kind === 'equivalent') assert.equal(checkEquivalent(c.target, c.target).status, 'correct');
        if (c.kind === 'division') assert.ok(toPoly(c.dividend).divideByMonomial(toPoly(c.divisor)));
        assert.equal(s.hints.length, 3, 'harus ada 3 petunjuk');
        assert.ok(s.solution.length > 0);
      });
    }
    if (s.type === 'choice') {
      test(`${name}: jawaban ada di pilihan`, () => assert.ok(s.options.includes(s.answer)));
    }
    if (s.type === 'divider') {
      test(`${name}: pembagian bulat`, () => assert.ok(toPoly(s.dividend).divideByMonomial(toPoly(s.divisor))));
    }
    if (s.type === 'board') {
      test(`${name}: target dapat difaktorkan`, () => assert.ok(toPoly(s.target).size >= 2));
    }
  });
}

test('FPB pada pelajaran World 1 sesuai mesin', () => {
  assert.equal(fpb('6x^2', '9x').toString(), '3x');
  assert.equal(fpb('16x^2', '24x').toString(), '8x');
  assert.equal(checkDivision('5x', '15x^2', '3x').status, 'correct');
});
