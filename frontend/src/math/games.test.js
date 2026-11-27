// Setiap soal game yang dibangkitkan: kunci BENAR menurut mesin aljabar, pengecoh SALAH, opsi unik.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeQuestion, makePairs, seeded, QUESTION_TYPES } from '../features/games/questionBank.js';
import { checkFactorization, checkEquivalent, checkDivision, fpb } from './checker.js';
import { toPoly } from './parser.js';

const rng = seeded(2026);

function verify(q) {
  assert.ok(q.options.includes(q.answer), 'kunci ada di opsi');
  assert.equal(new Set(q.options).size, q.options.length, 'opsi unik');
  assert.ok(q.options.length >= 3, 'minimal 3 opsi');
  if (q.type === 'factor' || q.type === 'dos') {
    assert.equal(checkFactorization(q.answer, q.target).status, 'correct', `${q.answer} untuk ${q.target}`);
    for (const o of q.options) if (o !== q.answer) assert.notEqual(checkFactorization(o, q.target).status, 'correct', `pengecoh ${o} untuk ${q.target}`);
  }
  if (q.type === 'fpb') {
    const [, a, b] = q.prompt.match(/dari (\d+)x\^2 dan (\d+)x/);
    assert.equal(fpb(`${a}x^2`, `${b}x`).toString(), toPoly(q.answer).toString());
    for (const o of q.options) if (o !== q.answer) assert.notEqual(checkEquivalent(o, q.answer).status, 'correct');
  }
  if (q.type === 'division') {
    const [, dividend, divisor] = q.prompt.match(/^(\S+) : (\S+) =/);
    assert.equal(checkDivision(q.answer, dividend, divisor).status, 'correct');
    for (const o of q.options) if (o !== q.answer) assert.notEqual(checkDivision(o, dividend, divisor).status, 'correct');
  }
  if (q.type === 'coefficient') {
    const [, term] = q.prompt.match(/dari (\S+)\?/);
    assert.equal(toPoly(term).termList()[0].coef, Number(q.answer));
  }
  if (q.type === 'likeTerms') {
    const key = (s) => JSON.stringify(toPoly(s).termList()[0].vars);
    for (const o of q.options) assert.equal(key(o) === key('x'), o === q.answer, `sejenis? ${o}`);
  }
}

test('500 soal acak (semua jenis) lulus pemeriksa mesin aljabar', () => {
  for (let i = 0; i < 500; i++) verify(makeQuestion(rng));
});

test('setiap jenis soal muncul & valid', () => {
  for (const type of QUESTION_TYPES) for (let i = 0; i < 40; i++) verify(makeQuestion(rng, type));
});

test('pasangan Pasangkan Ekspresi: faktor benar & tidak ada yang kembar', () => {
  for (let i = 0; i < 50; i++) {
    const pairs = makePairs(rng, 6);
    assert.equal(pairs.length, 6);
    assert.equal(new Set(pairs.map((p) => p.expanded)).size, 6);
    assert.equal(new Set(pairs.map((p) => p.factored)).size, 6);
    for (const p of pairs) assert.equal(checkFactorization(p.factored, p.expanded).status, 'correct');
  }
});
